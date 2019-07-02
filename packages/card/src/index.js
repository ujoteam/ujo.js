import 'babel-polyfill';
import * as Connext from 'connext';
import { ethers as eth } from 'ethers';
import Web3 from 'web3';
import interval from 'interval-promise';

import { getDollarSubstring } from './utils/getDollarSubstring';
import tokenAbi from './abi/humanToken.json';

// set constants
const Big = n => eth.utils.bigNumberify(n.toString());
const { getExchangeRates, hasPendingOps } = new Connext.Utils();
const emptyAddress = eth.constants.AddressZero;
const convertPayment = Connext.convert.Payment;
const DEPOSIT_ESTIMATED_GAS = Big('700000'); // 700k gas
const HUB_EXCHANGE_CEILING = eth.constants.WeiPerEther.mul(Big(69)); // 69 TST
const CHANNEL_DEPOSIT_MAX = eth.constants.WeiPerEther.mul(Big(30)); // 30 TST

const constructorError = 'Card constructor takes one object as an argument with "hubUrl", "rpcProvider", and "onStateUpdate" as properties.';
const CollateralStates = {
  PaymentMade: 0,
  Timeout: 1,
  Success: 2,
};

const validateAmount = ogValue => {
  const value = ogValue.toString();
  const decimal = value.startsWith('.') ? value.substr(1) : value.split('.')[1];

  // if there are more than 18 digits after the decimal, do not count them
  if (decimal && decimal.length > 18) {
    throw new Error('Value is too precise. Please keep it to maximum 18 decimal points');
    // balanceError = `Value too precise! Using ${tokenVal}`
  } else return Web3.utils.toWei(`${value}`, 'ether');
}

// define class
class Card {
  constructor(opts) {
    if (typeof opts !== 'object') throw new Error(constructorError);

    // passed in options
    this.onStateUpdate = opts.onStateUpdate ? opts.onStateUpdate : () => {};
    this.hubUrl = opts.hubUrl ? opts.hubUrl : 'http://localhost:8080';
    this.rpcProvider = opts.rpcProvider ? opts.rpcProvider : 'http://localhost:8545';
    this.domain = opts.domain ? opts.domain : 'localhost';

    this.address = '';
    this.web3 = {};
    this.connext = {};
    this.tokenAddress = null;
    this.tokenContract = null;
    this.channelState = null;
    this.connextState = null;
    this.exchangeRate = '0.00';

    this.validateAmount = validateAmount;
  }

  async init(existingMnemonic) {
    // check if mnemonic is passed or exists in LS
    const mnemonic = existingMnemonic || localStorage.getItem('mnemonic') || eth.Wallet.createRandom().mnemonic;
    if (!localStorage.getItem('mnemonic')) localStorage.setItem('mnemonic', mnemonic);

    // set up web3 and connext
    await this.setWeb3();
    await this.setConnext(mnemonic);
    await this.setTokenContract();

    // start polling for state
    await this.pollConnextState();
    await this.setBrowserWalletMinimumBalance();
    await this.poller();

    // return address
    return this.address;
  }

  // ************************************************* //
  //                State setters                      //
  // ************************************************* //
  async setWeb3() {
    const provider = new eth.providers.JsonRpcProvider(this.rpcProvider);
    this.web3 = provider;
  }

  async setConnext(mnemonic) {
    const options = {
      hubUrl: this.hubUrl,
      mnemonic,
      ethUrl: this.rpcProvider, // Note: can use hubs eth provider by omitting this as well
      logLevel: 5,
      // user: this.address,
      // origin: this.domain,
    };

    // *** Instantiate the connext client ***
    // *** Create Address ***
    this.connext = await Connext.createClient(options);
    this.tokenAddress = this.connext.opts.tokenAddress;
    this.address = await this.connext.wallet.getAddress();
    // console.log(`Successfully set up connext! Connext config:`);
    // console.log(`  - tokenAddress: ${this.connext.opts.tokenAddress}`);
    // console.log(`  - hubAddress: ${this.connext.opts.hubAddress}`);
    // console.log(`  - contractAddress: ${this.connext.opts.contractAddress}`);
    // console.log(`  - ethNetworkId: ${this.connext.opts.ethNetworkId}`);
  }

  async setTokenContract() {
    try {
      const tokenContract = new eth.Contract(this.tokenAddress, tokenAbi, this.web3);
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
        that.onStateUpdate(balance);
      }

      that.channelState = state.persistent.channel;
      that.connextState = state;
      that.exchangeRate = state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.DAI : 0;
      that.runtime = state.runtime;
      console.log('Connext updated:', state)
    });

    // start polling
    await this.connext.start();
  }

  async poller() {
    await this.autoDeposit();
    await this.autoSwap();

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

    const gasPrice = await this.web3.getGasPrice();

    // default connext multiple is 1.5, leave 2x for safety
    const totalDepositGasWei = DEPOSIT_ESTIMATED_GAS.mul(Big(2)).mul(gasPrice);

    this.minDeposit = Connext.Currency.WEI(totalDepositGasWei, () => getExchangeRates(connextState));
    this.maxDeposit = Connext.Currency.DEI(CHANNEL_DEPOSIT_MAX, () => getExchangeRates(connextState));
  }

  async autoDeposit() {
    const { address, tokenContract, connextState, tokenAddress, rpcProvider, web3, minDeposit } = this;
    if (!rpcProvider || !minDeposit) return;

    const balance = await web3.getBalance(address);
    const gasPrice = (await web3.getGasPrice()).toHexString();

    let tokenBalance = '0';
    try {
      tokenBalance = await tokenContract.balanceOf(address);
    } catch (e) {
      console.warn(
        `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${JSON.stringify(
          await web3.getNetwork()
        )}))? Error: ${e.message}`,
      );
      return;
    }

    if (balance.gt(eth.constants.Zero) || tokenBalance.gt(eth.constants.Zero)) {
      const minWei = minDeposit.toWEI().floor()
      // don't autodeposit anything under the threshold
      // update the refunding variable before returning
      if (balance.lt(minWei)) return;

      // only proceed with deposit request if you can deposit
      if (!connextState) return;

      if (
        // something was submitted
        connextState.runtime.deposit.submitted ||
        connextState.runtime.withdrawal.submitted ||
        connextState.runtime.collateral.submitted
      ) {
        console.log(`Deposit or withdrawal transaction in progress, will not auto-deposit`);
        return;
      }

      const channelDeposit = {
        amountWei: balance.sub(minWei),
        amountToken: tokenBalance,
      };

      if (channelDeposit.amountWei.eq(eth.constants.Zero) && channelDeposit.amountToken.eq(eth.constants.Zero)) return;

      await this.connext.deposit(
        {
          amountWei: channelDeposit.amountWei.toString(),
          amountToken: channelDeposit.amountToken.toString(),
        },
        { gasPrice },
      );
    }
  }

  // swapping wei for dai
  async autoSwap() {
    const { channelState, connextState } = this;
    if (!connextState || hasPendingOps(channelState)) return;

    const weiBalance = Big(channelState.balanceWeiUser);
    const tokenBalance = Big(channelState.balanceTokenUser);
    if (channelState && weiBalance.gt(Big('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
      await this.connext.exchange(channelState.balanceWeiUser, 'wei');
    }
  }

  // ************************************************* //
  //                  Send Funds                       //
  // ************************************************* //

  async generateRedeemableLink(value) {
    const { connext } = this;
    if (isNaN(value)) throw new Error('Value is not a number');
    value = this.validateAmount(value);

    // generate secret, set type, and set
    // recipient to empty address
    const payment = {
      meta: { purchaseId: 'ujo' },
      payments: [
        {
          type: 'PT_LINK',
          recipient: emptyAddress,
          amountToken: value,
          amountWei: '0',
          meta: { secret: connext.generateSecret() },
        }
      ],
    };

    return this.paymentHandler(payment);
  }

  async generatePayment(value, recipientAddress) {
    if (isNaN(value)) throw new Error('Value is not a number');
    value = this.validateAmount(value);

    // generate secret, set type, and set
    const payment = {
      meta: { purchaseId: 'ujo' },
      payments: [
        {
          type: 'PT_OPTIMISTIC', // only optimistic for now 'PT_CHANNEL',
          recipient: recipientAddress,
          amountToken: value,
          amountWei: '0',
        }
      ],
    };

    const act = await this.paymentHandler(payment);
    return act;
  }

  // returns true on a successful payment to address
  // return the secret on a successful link generation
  // otherwise throws an error
  async paymentHandler(paymentVal) {
    const { connext, channelState } = this;

    let balanceError;
    let addressError;

    // validate that the token amount is within bounds
    const paymentAmount = convertPayment('bn', paymentVal.payments[0]);
    if (paymentAmount.amountToken.gt(Big(channelState.balanceTokenUser))) {
      balanceError = 'Insufficient balance in channel';
    }

    if (paymentAmount.amountToken.isZero()) {
      balanceError = 'Please enter a payment amount above 0';
    }

    // validate recipient is valid address OR the empty address
    // TODO: handle in other functions that structure payment object
    const { recipient } = paymentVal.payments[0];
    if (!Web3.utils.isAddress(recipient) && recipient !== emptyAddress) {
      addressError = 'Please use a valid address';
    }

    // return if either errors exist
    if (balanceError || addressError) {
      const errorMessage = balanceError || addressError;
      throw new Error(errorMessage);
    }

    // check if the recipient needs collateral
    // is utilized later in fn. Consider in a v2
    const needsCollateral = await connext.recipientNeedsCollateral(
      paymentVal.payments[0].recipient,
      convertPayment('str', {
        amountWei: paymentVal.payments[0].amountWei,
        amountToken: paymentVal.payments[0].amountToken,
      }),
    );

    // collateralize recipient if not a link payment
    // not used now as we do optimistic payments
    if (needsCollateral && paymentVal.payments[0].type !== 'PT_LINK') {
      // this can have 3 potential outcomes:
      // - collateralization failed (return)
      // - payment succeeded (return)
      // - channel collateralized
      const collateralizationStatus = await this.collateralizeRecipient(paymentVal);
      switch (collateralizationStatus) {
        // setting state for these cases done in collateralize
        case CollateralStates.PaymentMade:
          return true;
        case CollateralStates.Timeout:
          throw new Error('Collateralization of recipient timed out. Please try again.');
          // return;
        case CollateralStates.Success:
          return await this.sendPayment(paymentVal);
        default:
          console.log('GOT In DEFAULT')
          return await this.sendPayment(paymentVal);
      }
    } else {
      return await this.sendPayment(paymentVal);
    }
  }

  async sendPayment(paymentVal) {
    const { connext } = this;

    try {
      let paymentRes = await connext.buy(paymentVal);
      // console.log(`Payment result: ${JSON.stringify(paymentRes, null, 2)}`);
      if (paymentVal.payments[0].type === 'PT_LINK') {
        return paymentVal.payments[0].meta.secret;
      }
      return true;
    } catch (e) {
      console.log('error with payment', e)
      throw new Error(e);
    }
  }

  async collateralizeRecipient(paymentVal) {
    const { connext } = this;

    // collateralize by sending payment
    try {
      const success = await this.sendPayment(paymentVal);
      // if success, return successful payment
      if (success) return CollateralStates.PaymentMade;
    }
    catch (e) {
      // do nothing
    }

    // call to send payment failed, monitor collateral
    // watch for confirmation on the recipients side
    // of the channel for 20s
    let needsCollateral;
    await interval(
      async (iteration, stop) => {
        // returns null if no collateral needed
        needsCollateral = await connext.recipientNeedsCollateral(
          paymentVal.payments[0].recipient,
          convertPayment('str', {
            amountWei: paymentVal.payments[0].amountWei,
            amountToken: paymentVal.payments[0].amountToken,
          }),
        );
        if (!needsCollateral || iteration > 20) {
          stop();
        }
      }, 5000, { iterations: 20 }
    );

    if (needsCollateral) return CollateralStates.Timeout;
    return CollateralStates.Success;
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
  //                 Withdraw Funds                    //
  // ************************************************* //
  async withdrawalAllFunds(originalRecipient, withdrawEth = true) {
    // TODO: add value to withdraw and check the input balance is under channel balance
    const { connext } = this;
    const recipient = originalRecipient.toLowerCase();

    // check for valid address
    if (!eth.utils.isHexString(recipient)) {
      throw new Error(`Invalid recipient. Invalid hex string: ${originalRecipient}`);
    }
    if (eth.utils.arrayify(recipient).length !== 20) {
      throw new Error(`Invalid recipient. Invalid length: ${originalRecipient}`);
    }

    const withdrawalVal = this.createWithdrawValues(recipient, withdrawEth);

    console.log(`Withdrawing: ${JSON.stringify(withdrawalVal, null, 2)}`);
    await connext.withdraw(withdrawalVal);
  }

  createWithdrawValues(recipient, withdrawEth) {
    // set the state to contain the proper withdrawal args for
    // eth or dai withdrawal
    const { channelState, connextState, exchangeRate } = this;
    let withdrawalVal = {
      recipient,
      exchangeRate,
      tokensToSell: '0',
      withdrawalWeiUser: '0',
      weiToSell: '0',
      withdrawalTokenUser: '0',
    };

    if (withdrawEth && channelState && connextState) {
      const { custodialBalance } = connextState.persistent;
      const amountToken = Big(channelState.balanceTokenUser).add(custodialBalance.balanceToken);
      const amountWei = Big(channelState.balanceWeiUser).add(custodialBalance.balanceWei);

      // withdraw all channel balance in eth
      withdrawalVal = {
        ...withdrawalVal,
        tokensToSell: amountToken.toString(),
        withdrawalWeiUser: amountWei.toString(),
        weiToSell: '0',
        withdrawalTokenUser: '0',
      };
    } else {
      throw new Error('Not permitting withdrawal of tokens at this time');
      // // handle withdrawing all channel balance in dai
      // withdrawalVal = {
      //   ...withdrawalVal,
      //   tokensToSell: '0',
      //   withdrawalWeiUser: '0',
      //   weiToSell: channelState.balanceWeiUser,
      //   withdrawalTokenUser: channelState.balanceTokenUser,
      // };
    }

    return withdrawalVal;
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
