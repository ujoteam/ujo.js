import 'babel-polyfill';
import * as Connext from 'connext';
import { ethers as eth } from 'ethers';
import Web3 from 'web3';
import BN from 'bn.js';
// import { CurrencyType } from 'connext/dist/state/ConnextState/CurrencyTypes';
// import CurrencyConvertable from 'connext/dist/lib/currency/CurrencyConvertable';

// import ProviderOptions from './utils/ProviderOptions';
// import clientProvider from './utils/web3/clientProvider';
import { getDollarSubstring } from './utils/getDollarSubstring';
// import createWallet from './walletGen';
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

const validateAmount = value => {
  value = value.toString();
  console.log('value', value)
  console.log('typeof', typeof value)
  // if there are more than 18 digits after the decimal, do not
  // count them.
  // throw a warning in the address error
  // let balanceError = null
  const decimal = value.startsWith('.') ? value.substr(1) : value.split('.')[1];

  // let tokenVal = value;
  if (decimal && decimal.length > 18) {
    // tokenVal = value.startsWith('.') ? value.substr(0, 19) : `${value.split('.')[0]}.${decimal.substr(0, 18)}`;
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

    // otherwise generate wallet in create wallet
    // const delegateSigner = await createWallet(mnemonic);
    // const address = await delegateSigner.getAddressString();
    // this.address = address;

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
    // async setWeb3(delegateSigner) {
    const provider = new eth.providers.JsonRpcProvider(this.rpcProvider);
    this.web3 = provider;
    // const providerOpts = new ProviderOptions(delegateSigner, this.rpcProvider, this.hubUrl).approving();
    // const provider = clientProvider(providerOpts);
    // const customWeb3 = new Web3(provider);
    // this.web3 = customWeb3;
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

    // const defaultGas = new BN(await web3.eth.getGasPrice())
    // default connext multiple is 1.5, leave 2x for safety
    // const depositGasPrice = DEPOSIT_ESTIMATED_GAS.multipliedBy(new BigNumber(2)).multipliedBy(defaultGas);
    // add dai conversion
    // const minConvertable = new CurrencyConvertable(CurrencyType.WEI, depositGasPrice, () => getExchangeRates(connextState));


    const gasPrice = await this.web3.getGasPrice();

    // default connext multiple is 1.5, leave 2x for safety
    const totalDepositGasWei = DEPOSIT_ESTIMATED_GAS.mul(Big(2)).mul(gasPrice);

    this.minDeposit = Connext.Currency.WEI(totalDepositGasWei, () => getExchangeRates(connextState));
    this.maxDeposit = Connext.Currency.DEI(CHANNEL_DEPOSIT_MAX, () => getExchangeRates(connextState));
  }

  // TODO: figure out why after proposing a deposit
  // it halts awaiting a confirm
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
    if (Number.isNaN(value)) throw new Error('Value is not a number');
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
    if (Number.isNaN(value)) throw new Error('Value is not a number');
    value = this.validateAmount(value);

    // generate secret, set type, and set
    const payment = {
      meta: { purchaseId: 'ujo' },
      payments: [
        {
          type: 'PT_OPTIMISTIC',
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

    // check if the recipient needs collateral
    // is utilized later in fn. Consider in a v2
    const needsCollateral = await connext.recipientNeedsCollateral(
      paymentVal.payments[0].recipient,
      convertPayment('str', {
        amountWei: paymentVal.payments[0].amountWei,
        amountToken: paymentVal.payments[0].amountToken
      }),
    );

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
      addressError = 'Please choose a valid address';
    }

    // return if either errors exist
    if (balanceError || addressError) {
      const errorMessage = balanceError || addressError;
      throw new Error(errorMessage);
    }

    // comment back in later if needed
    // if (needsCollateral && payment.payments[0].type !== 'PT_LINK') {
    //   try {
    //     await this.tryToCollateralize(payment);
    //   } catch (e) {
    //     throw e;
    //   }
    // }

    // otherwise make payment
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

  async collateralizeRecipient(payment) {
    const { connext } = this;
    // do not collateralize on pt link payments
    if (payment.payments[0].type === 'PT_LINK') return;

    // collateralize by sending payment
    // const err = await this._sendPayment(payment, true);
    const success = await connext.buy(payment);
    // somehow it worked???
    if (success) return;

    // call to send payment failed, monitor collateral
    // watch for confirmation on the recipients side
    // of the channel for 20s
    let needsCollateral
    await setInterval(
      async (iteration, stop) => {
        // returns null if no collateral needed
        needsCollateral = await connext.recipientNeedsCollateral(
          payment.payments[0].recipient,
          convertPayment('str', payment.payments[0].amount)
        );
        if (!needsCollateral || iteration > 20) {
          stop();
        }
      },
      5000,
      { iterations: 20 }
    );

    if (needsCollateral) {
      this.setState({
        showReceipt: true,
        paymentState: PaymentStates.CollateralTimeout
      });
      return CollateralStates.Timeout;
    }

    return CollateralStates.Success;
  }

  // not utilized yet
  tryToCollateralize(payment) {
    const { connext } = this;
    let iteration = 0;
    return new Promise((res, rej) => {
      const collateralizeInterval = setInterval(async () => {
        console.log('interval', iteration);
        const needsCollateral = await connext.recipientNeedsCollateral(
          payment.payments[0].recipient,
          convertPayment('str', payment.payments[0].amount),
        );
        if (!needsCollateral) {
          console.log('successfulyl collateralized')
          res(true);
          clearInterval(collateralizeInterval);
        } else if (iteration >= 20) {
          rej(new Error('Unable to collateralize'));
          clearInterval(collateralizeInterval);
        }
        iteration += 1;
      }, 5000);
    });
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
    const { connext } = this;
    const recipient = originalRecipient.toLowerCase();

    if (!eth.utils.isHexString(recipient)) {
      throw new Error(`Invalid hex string: ${originalRecipient}`);
    }
    if (eth.utils.arrayify(recipient).length !== 20) {
      throw new Error(`Invalid length: ${originalRecipient}`);
    }

    const withdrawalVal = this.createWithdrawValues(recipient, withdrawEth);

    // // check for valid address
    // // let addressError = null
    // // let balanceError = null
    // if (!Web3.utils.isAddress(recipient)) {
    //   throw new Error(`${withdrawalVal.recipient} is not a valid address`);
    // }

    // TODO: check the input balance is under channel balance
    // TODO: allow partial withdrawals?

    console.log(`Withdrawing: ${JSON.stringify(withdrawalVal, null, 2)}`);
    await connext.withdraw(withdrawalVal);
    // this.poller();
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
