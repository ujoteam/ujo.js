import 'babel-polyfill';
import { getConnextClient } from 'connext/dist/Connext';
import axios from 'axios';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { emptyAddress } from 'connext/dist/Utils';
import { convertPayment } from 'connext/dist/types';
import getExchangeRates from 'connext/dist/lib/getExchangeRates';
import { CurrencyType } from 'connext/dist/state/ConnextState/CurrencyTypes';
import CurrencyConvertable from 'connext/dist/lib/currency/CurrencyConvertable';

import BigNumber from 'bignumber.js';
import BN from 'bn.js';

import ProviderOptions from './utils/ProviderOptions';
import clientProvider from './utils/web3/clientProvider';
import { getDollarSubstring } from './utils/getDollarSubstring';
import createWallet from './walletGen';
import tokenAbi from './abi/humanToken.json';

// set constants
const HASH_PREAMBLE = 'SpankWallet authentication message:';
// const DEPOSIT_MINIMUM_WEI = ethers.utils.parseEther('0.03'); // 30 FIN
const DEPOSIT_ESTIMATED_GAS = new BigNumber('700000') // 700k gas
const HUB_EXCHANGE_CEILING = new BigNumber(Web3.utils.toWei('69', 'ether')); // 69 TST
const CHANNEL_DEPOSIT_MAX = new BigNumber(Web3.utils.toWei('30', 'ether')); // 30 TST
const opts = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: 'Bearer foo',
  },
  withCredentials: true,
};

// define class
class Card {
  constructor(cb) {
    // remove from a 'state'
    // object and list under `this`
    this.address = '';
    this.web3 = {};
    this.connext = {};
    this.tokenAddress = null;
    this.tokenContract = null;
    this.channelState = null;
    this.connextState = null;
    this.stateUpdateCallback = cb;
    this.exchangeRate = '0.00';
    this.hubUrl = null;
    this.rpcProvider = null;
  }

  // TODO: take in mnemonic so that users can
  // generate wallet from another dapplication
  async init(hubUrl = 'http://localhost:8080', rpcProvider = 'http://localhost:8545') {
    // Set up wallet
    const mnemonic = localStorage.getItem('mnemonic');
    const delegateSigner = await createWallet(mnemonic);
    const address = await delegateSigner.getAddressString();
    this.address = address;
    this.hubUrl = hubUrl;
    this.rpcProvider = rpcProvider;

    // set up web3 and connext
    await this.setWeb3(delegateSigner, rpcProvider, hubUrl);
    await this.setConnext(hubUrl);
    await this.setTokenContract();
    await this.authorizeHandler();

    // start polling for state
    await this.pollConnextState();
    await this.setBrowserWalletMinimumBalance();
    await this.poller();

    // return address
    return address;
  }

  // ************************************************* //
  //                State setters                      //
  // ************************************************* //
  async setWeb3(address, rpcUrl, hubUrl) {
    const providerOpts = new ProviderOptions(address, rpcUrl, hubUrl).approving();
    const provider = clientProvider(providerOpts);
    const customWeb3 = new Web3(provider);
    this.web3 = customWeb3;
  }

  async setConnext(hubUrl) {
    const options = {
      web3: this.web3,
      hubUrl,
      user: this.address,
    };

    // *** Instantiate the connext client ***
    const connext = await getConnextClient(options);
    // console.log(`Successfully set up connext! Connext config:`);
    // console.log(`  - tokenAddress: ${connext.opts.tokenAddress}`);
    // console.log(`  - hubAddress: ${connext.opts.hubAddress}`);
    // console.log(`  - contractAddress: ${connext.opts.contractAddress}`);
    // console.log(`  - ethNetworkId: ${connext.opts.ethNetworkId}`);
    this.connext = connext;
    this.tokenAddress = connext.opts.tokenAddress;
  }

  async setTokenContract() {
    try {
      const tokenContract = new this.web3.eth.Contract(tokenAbi, this.tokenAddress);
      this.tokenContract = tokenContract;
    } catch (e) {
      console.log('Error setting token contract', e); // eslint-disable-line
    }
  }

  // ************************************************* //
  //                    Pollers                        //
  // ************************************************* //
  async pollConnextState() {
    const that = this;
    // register listeners
    this.connext.on('onStateChange', state => {
      // console.log('STATE cHANEGE', state)
      if (state.persistent.channel) {
        const balance = state.persistent.channel.balanceTokenUser;
        // balance is in Dai, return via callback so app/service can process usd amount
        that.stateUpdateCallback(balance);
      }

      that.channelState = state.persistent.channel;
      that.connextState = state;
      that.exchangeRate = state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0;
      that.runtime = state.runtime;
    });
    // start polling
    await this.connext.start();
  }

  async poller() {
    await this.autoDeposit();
    await this.autoSwap();
    // await this.connext.requestCollateral();

    setInterval(async () => {
      await this.autoDeposit();
    }, 5000);

    setInterval(async () => {
      await this.autoSwap();
    }, 500);

    // setInterval(async () => {
    //   await this.checkStatus();
    // }, 400)
  }

  async setBrowserWalletMinimumBalance() {
    const { web3, connextState } = this;
    if (!web3 || !connextState) return;

    const defaultGas = new BN(await web3.eth.getGasPrice())
    // default connext multiple is 1.5, leave 2x for safety
    const depositGasPrice = DEPOSIT_ESTIMATED_GAS.multipliedBy(new BigNumber(2)).multipliedBy(defaultGas);
    // add dai conversion
    const minConvertable = new CurrencyConvertable(CurrencyType.WEI, depositGasPrice, () => getExchangeRates(connextState));

    const browserMinimumBalance = {
      wei: minConvertable.toWEI().amount,
      dai: minConvertable.toUSD().amount,
    }

    this.browserMinimumBalance = browserMinimumBalance;
  }

  // TODO: figure out why after proposing a deposit
  // it halts awaiting a confirm 
  async autoDeposit() {
    const {
      address,
      tokenContract,
      connextState,
      tokenAddress,
      exchangeRate,
      rpcProvider,
      web3,
      browserMinimumBalance,
    } = this;
    if (!rpcProvider) return;

    const balance = await web3.eth.getBalance(address);

    let tokenBalance = '0';
    try {
      tokenBalance = await tokenContract.methods.balanceOf(address).call();
    } catch (e) {
      console.warn(
        `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${await web3.eth.net.getId()}))? Error: ${
          e.message
        }`
      );
    }

    if (balance !== '0' || tokenBalance !== '0') {
      const minWei = new BigNumber(browserMinimumBalance.wei);
      // don't autodeposit anything under the threshold
      // update the refunding variable before returning
      if (new BigNumber(balance).lt(minWei)) return;

      // only proceed with deposit request if you can deposit
      if (!connextState || !connextState.runtime.canDeposit || exchangeRate === '0.00') return;
      // if (!connextState || exchangeRate === '0.00') return;

      const channelDeposit = {
        amountWei: new BigNumber(balance).toFixed(0),
        amountToken: tokenBalance,
      };

      if (channelDeposit.amountWei === '0' && channelDeposit.amountToken === '0') return;

      // if amount to deposit into channel is over the channel max
      // then return excess deposit to the sending account
      // const weiToReturn = this.constructor.calculateWeiToRefund(channelDeposit.amountWei, connextState);

      // return wei to sender
      // if (weiToReturn !== '0') {
      //   // await this.returnWei(weiToReturn);
      //   return;
      // }

      // update channel deposit
      // const weiDeposit = new BigNumber(channelDeposit.amountWei).minus(new BigNumber(weiToReturn)); // with refund happening... we are removing that
      const weiDeposit = new BigNumber(channelDeposit.amountWei);
      channelDeposit.amountWei = weiDeposit.toFixed(0);

      await this.connext.deposit(channelDeposit);
    }
  }

  // returns a BigNumber
  static calculateWeiToRefund(wei, connextState) {
    // channel max tokens is minimum of the ceiling that
    // the hub would exchange, or a set deposit max
    const ceilingWei = new CurrencyConvertable(
      CurrencyType.BEI,
      BigNumber.min(HUB_EXCHANGE_CEILING, CHANNEL_DEPOSIT_MAX),
      () => getExchangeRates(connextState)
    ).toWEI().amountBigNumber;

    const weiToRefund = BigNumber.max(new BN(wei).minus(ceilingWei), new BN(0));
    return weiToRefund.toFixed(0);
  }

  // swapping wei for dai
  async autoSwap() {
    const { channelState, connextState } = this;
    if (!connextState || !connextState.runtime.canExchange) return;

    const weiBalance = new BigNumber(channelState.balanceWeiUser);
    const tokenBalance = new BigNumber(channelState.balanceTokenUser);
    if (channelState && weiBalance.gt(new BigNumber('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
      // console.log(`Exchanging ${channelState.balanceWeiUser} wei`); // eslint-disable-line
      await this.connext.exchange(channelState.balanceWeiUser, 'wei');
    }
  }

  // ************************************************* //
  //                    Handlers                       //
  // ************************************************* //
  async authorizeHandler() {
    const { web3 } = this;
    const challengeRes = await axios.post(`${this.hubUrl}/auth/challenge`, {}, opts);

    const data = `${HASH_PREAMBLE} ${web3.utils.sha3(challengeRes.data.nonce)} ${web3.utils.sha3('localhost')}`;
    const hash = web3.utils.sha3(data);
    const signature = await web3.eth.personal.sign(hash, this.address, null);

    try {
      const authRes = await axios.post(
        `${this.hubUrl}/auth/response`,
        {
          nonce: challengeRes.data.nonce,
          address: this.address,
          origin: 'localhost',
          signature,
        },
        opts,
      );
      const { token } = authRes.data;
      document.cookie = `hub.sid=${token}`;
      // console.log(`hub authentication cookie set: ${token}`);
      const res = await axios.get(`${this.hubUrl}/auth/status`, opts);
      // console.log('res', res.data);
      // console.log(`Auth status: ${JSON.stringify(res.data)}`);
    } catch (e) {
      console.log(e);
    }
  }

  // ************************************************* //
  //                  Send Funds                       //
  // ************************************************* //
  async generateRedeemableLink(value) {
    const { connext } = this;
    if (Number.isNaN(value)) throw new Error('Value is not a number');

    // generate secret, set type, and set
    // recipient to empty address
    const payment = {
      meta: { purchaseId: 'payment' },
      payments: [
        {
          type: 'PT_LINK',
          recipient: emptyAddress,
          secret: connext.generateSecret(),
          amount: {
            amountToken: (value * Math.pow(10, 18)).toString(),
            amountWei: '0',
          },
        }
      ]
    };

    return this.paymentHandler(payment);
  }

  async generatePayment(value, recipientAddress) {
    const { connext } = this;
    if (Number.isNaN(value)) throw new Error('Value is not a number');

    // generate secret, set type, and set
    const payment = {
      meta: { purchaseId: 'payment' },
      payments: [
        {
          type: 'PT_CHANNEL',
          recipient: recipientAddress,
          secret: connext.generateSecret(),
          amount: {
            amountToken: (value * Math.pow(10, 18)).toString(),
            amountWei: '0',
          },
        }
      ],
    };

    return this.paymentHandler(payment);
  }

  // returns true on a successful payment to address
  // return the secret on a successful link generation
  // otherwise throws an error
  async paymentHandler(payment) {
    const { connext, web3, channelState } = this;

    // check if the recipient needs collateral
    await connext.recipientNeedsCollateral(
      payment.payments[0].recipient,
      convertPayment('str', payment.payments[0].amount)
    );

    let balanceError, addressError;

    // validate that the token amount is within bounds
    const paymentAmount = convertPayment('bn', payment.payments[0].amount);
    if (paymentAmount.amountToken.gt(new BN(channelState.balanceTokenUser))) {
      balanceError = 'Insufficient balance in channel';
    }

    if (paymentAmount.amountToken.isZero()) {
      balanceError = 'Please enter a payment amount above 0';
    }

    // validate recipient is valid address OR the empty address
    // TODO: handle in other functions that structure payment object
    const { recipient } = payment.payments[0];
    if (!web3.utils.isAddress(recipient) && recipient !== emptyAddress) {
      addressError = 'Please choose a valid address';
    }

    // return if either errors exist
    if (balanceError || addressError) {
      const errorMessage = balanceError || addressError;
      throw new Error(errorMessage);
    }

    // otherwise make payment
    try {
      let paymentRes = await connext.buy(payment);
      // console.log(`Payment result: ${JSON.stringify(paymentRes, null, 2)}`);
      if (payment.payments[0].type === 'PT_LINK') {
        return payment.payments[0].secret;
      }
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }

  async redeemPayment(secret) {
    const { connext, channelState, connextState } = this;
    if (!connext || !channelState || !connextState) throw new Error('Connext not configured');

    if (!secret) throw new Error('No secret detected, cannot redeem payment.');

    // user is not payor, can redeem payment
    try {
      return connext.redeem(secret);
    } catch (e) {
      throw new Error(e);
    }
  }

  // ************************************************* //
  //                    Helper                         //
  // ************************************************* //
  convertDaiToUSDString(dai) {
    // const balance = state.persistent.channel.balanceTokenUser;
    const substr = dai ? getDollarSubstring(dai) : ['0', '00'];
    let cents = substr[1].substring(0, 2);
    if (cents.length === 1) cents = `${cents}0`;
    return `${substr[0]}.${cents}`;
  }
}

export default Card;
