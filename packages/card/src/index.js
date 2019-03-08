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
        const substr = balance ? getDollarSubstring(balance) : ['0', '00'];
        let cents = substr[1].substring(0, 2);
        if (cents.length === 1) cents = `${cents}0`;

        // call cb passed into creator fn with updated amount in card
        that.stateUpdateCallback(`$${substr[0]}.${cents}`);
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
    const { connextState, tokenAddress } = this;
    const balance = await this.web3.eth.getBalance(this.address);
    let tokenBalance = '0';
    try {
      tokenBalance = await this.tokenContract.methods.balanceOf(this.address).call();
    } catch (e) {
      console.warn(
        `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${await this.web3.eth.net.getId()}))? Error: ${
          e.message
        }`,
      );
    }

    if (balance !== '0' || tokenBalance !== '0') {
      if (ethers.utils.bigNumberify(balance).lte(DEPOSIT_MINIMUM_WEI)) {
        // don't autodeposit anything under the threshold
        return;
      }
      // only proceed with deposit request if you can deposit
      if (!connextState || !connextState.runtime.canDeposit) {
        // console.log("Cannot deposit");
        return;
      }

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

  // not totally sure what happens here
  async autoSwap() {
    const { channelState, connextState } = this;
    // const { channelState, connextState } = this.state;
    if (!connextState || !connextState.runtime.canExchange) {
      // console.log("Cannot exchange");
      return;
    }
    const weiBalance = ethers.utils.bigNumberify(channelState.balanceWeiUser);
    const tokenBalance = ethers.utils.bigNumberify(channelState.balanceTokenUser);
    if (channelState && weiBalance.gt(ethers.utils.bigNumberify('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
      console.log(`Exchanging ${channelState.balanceWeiUser} wei`); // eslint-disable-line
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
    // const { paymentVal } = this.state;

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

    // refactored to avoid race conditions around
    // setting state
    return this.paymentHandler(payment);
  }

  async generatePayment(value, recipientAddress) {
    const { connext } = this;
    // const { paymentVal } = this.state;

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

    // refactored to avoid race conditions around
    // setting state
    await this.paymentHandler(payment);
  }

  async paymentHandler(payment) {
    const { connext, web3, channelState } = this;
    // const { connext, web3, channelState } = this.props;

    console.log(`Submitting payment: ${JSON.stringify(payment, null, 2)}`);
    let balanceError, addressError;

    // validate that the token amount is within bounds
    const paymentAmount = convertPayment('bn', payment.payments[0].amount);
    if (paymentAmount.amountToken.gt(new BN(channelState.balanceTokenUser))) {
      console.log('Insufficient balance in channel')
      // balanceError = 'Insufficient balance in channel';
    }

    if (paymentAmount.amountToken.isZero()) {
      console.log('Please enter a payment amount above 0')
      // balanceError = 'Please enter a payment amount above 0';
    }

    // validate recipient is valid address OR the empty address
    // TODO: handle in other functions that structure payment object
    const { recipient } = payment.payments[0];
    if (!web3.utils.isAddress(recipient) && recipient !== emptyAddress) {
      addressError = 'Please choose a valid address';
    }

    // return if either errors exist
    if (balanceError || addressError) {
      // TODO: throw an error
      return false;
    }

    // otherwise make payment
    try {
      let paymentRes = await connext.buy(payment);
      console.log(`Payment result: ${JSON.stringify(paymentRes, null, 2)}`);
      if (payment.payments[0].type === 'PT_LINK') {
        return payment.payments[0].secret;
      }
      return true;
    } catch (e) {
      // TODO: throw error here
      // console.log('SEND ERROR, SETTING');
      // this.setState({ sendError: true, showReceipt: true });
    }
  }

  async redeemPayment(secret) {
    // const { isConfirm, purchaseId, retryCount } = this.state;
    const { connext, channelState, connextState } = this;
    if (!connext || !channelState || !connextState) {
      console.log('Connext or channel object not detected');
      return;
    }

    if (!secret) {
      console.log('No secret detected, cannot redeem payment.');
      return;
    }

    // if (isConfirm) {
    //   console.log('User is creator of linked payment, not automatically redeeming.');
    //   return;
    // }

    // user is not payor, can redeem payment
    try {
      const updated = await connext.redeem(secret);
      console.log('redeemed successs?', updated);
      // if (!purchaseId && retryCount < 5) {
      //   console.log('Redeeming linked payment with secret', secret)
      //   if (updated.purchaseId == null) {
      //     this.setState({ retryCount: retryCount + 1})
      //   }
      //   this.setState({ purchaseId: updated.purchaseId, amount: updated.amount, showReceipt: true });
      // }
      // if (retryCount >= 5) {
      //   this.setState({ purchaseId: 'failed', sendError: true, showReceipt: true });
      // }
    } catch (e) {
      // TODO: throw error
      // if (e.message.indexOf('Payment has been redeemed') !== -1) {
      //   this.setState({ retryCount: 5, previouslyRedeemed: true })
      //   return
      // }
      // this.setState({ retryCount: retryCount + 1 });
      // console.log('retryCount', retryCount + 1)
    }
  }
}

export default Card;
