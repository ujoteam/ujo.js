import 'babel-polyfill';
import { getConnextClient } from 'connext/dist/Connext';
import axios from 'axios';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { emptyAddress } from 'connext/dist/Utils';
import { convertPayment } from 'connext/dist/types';
import BN from 'bn.js';

import ProviderOptions from './utils/ProviderOptions';
import clientProvider from './utils/web3/clientProvider';
import { getDollarSubstring } from './utils/getDollarSubstring';
import createWallet from './walletGen';
import tokenAbi from './abi/humanToken.json';

// set constants
const HASH_PREAMBLE = 'SpankWallet authentication message:';
const DEPOSIT_MINIMUM_WEI = ethers.utils.parseEther('0.03'); // 30 FIN
const HUB_EXCHANGE_CEILING = ethers.utils.parseEther('69'); // 69 TST
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
    await this.setWeb3(delegateSigner, rpcProvider);
    await this.setConnext(hubUrl);
    await this.setTokenContract();
    await this.authorizeHandler();

    // start polling for state
    await this.pollConnextState();
    await this.poller();

    // return address
    return address;
  }

  // ************************************************* //
  //                State setters                      //
  // ************************************************* //
  async setWeb3(address, rpcUrl) {
    const providerOpts = new ProviderOptions(address, rpcUrl).approving();
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
      if (state.persistent.channel) {
        const balance = state.persistent.channel.balanceTokenUser;
        // balance is in Dai, return via callback so app/service can process usd amount
        that.stateUpdateCallback(balance);
      }

      that.channelState = state.persistent.channel;
      that.connextState = state;
      that.exchangeRate = state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0;
    });
    // start polling
    await this.connext.start();
  }

  async poller() {
    await this.autoDeposit();
    await this.autoSwap();

    setInterval(async () => {
      await this.autoDeposit();
      await this.autoSwap();
    }, 10000);
  }

  async autoDeposit() {
    const { connextState, tokenAddress, address, exchangeRate } = this;
    const balance = await this.web3.eth.getBalance(address);
    let tokenBalance = '0';

    try {
      tokenBalance = await this.tokenContract.methods.balanceOf(address).call();
    } catch (e) {
      console.warn(
        `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${await this.web3.eth.net.getId()}))? Error: ${
          e.message
        }`,
      );
    }

    if (balance !== '0' || tokenBalance !== '0') {
      // don't autodeposit anything under the threshold
      if (ethers.utils.bigNumberify(balance).lte(DEPOSIT_MINIMUM_WEI)) return;

      // only proceed with deposit request if you can deposit
      if (!connextState || !connextState.runtime.canDeposit || exchangeRate === '0.00') return;

      const actualDeposit = {
        amountWei: ethers.utils
          .bigNumberify(balance)
          .sub(DEPOSIT_MINIMUM_WEI)
          .toString(),
        amountToken: tokenBalance,
      };

      if (actualDeposit.amountWei === '0' && actualDeposit.amountToken === '0') {
        // console.log(`Actual deposit is 0, not depositing.`);
        return;
      }

      const depositRes = await this.connext.deposit(actualDeposit); // eslint-disable-line
      // console.log(`Depositing: ${JSON.stringify(actualDeposit, null, 2)}`);
      // console.log(`Deposit Result: ${JSON.stringify(depositRes, null, 2)}`);
    }
  }

  // swapping wei for dai
  async autoSwap() {
    const { channelState, connextState } = this;
    if (!connextState || !connextState.runtime.canExchange) return;

    const weiBalance = new BN(channelState.balanceWeiUser);
    const tokenBalance = new BN(channelState.balanceTokenUser);
    if (channelState && weiBalance.gt(ethers.utils.bigNumberify('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
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
      payments: [{
        type: 'PT_LINK',
        recipient: emptyAddress,
        secret: connext.generateSecret(),
        amount: {
          amountToken: (value * Math.pow(10, 18)).toString(),
          amountWei: '0',
        },
      }]
    };

    return this.paymentHandler(payment);
  }

  async generatePayment(value, recipientAddress) {
    const { connext } = this;
    if (Number.isNaN(value)) throw new Error('Value is not a number');

    // generate secret, set type, and set
    const payment = {
      meta: { purchaseId: 'payment' },
      payments: [{
        type: 'PT_CHANNEL',
        recipient: recipientAddress,
        secret: connext.generateSecret(),
        amount: {
          amountToken: (value * Math.pow(10, 18)).toString(),
          amountWei: '0',
        },
      }],
    };

    return this.paymentHandler(payment);
  }

  // returns true on a successful payment to address
  // return the secret on a successful link generation
  // otherwise throws an error
  async paymentHandler(payment) {
    const { connext, web3, channelState } = this;
    // const { connext, web3, channelState } = this.props;

    // console.log(`Submitting payment: ${JSON.stringify(payment, null, 2)}`);
    let balanceError, addressError;

    // validate that the token amount is within bounds
    const paymentAmount = convertPayment('bn', payment.payments[0].amount);
    if (paymentAmount.amountToken.gt(new BN(channelState.balanceTokenUser))) {
      balanceError = 'Insufficient balance in channel';
    }

    if (paymentAmount.amountToken.isZero() ) {
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
