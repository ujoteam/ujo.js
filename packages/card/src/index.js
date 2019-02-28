import 'babel-polyfill';
require("dotenv").config();
import { getConnextClient } from 'connext/dist/Connext.js';
import axios from 'axios';

import ProviderOptions from '../utils/ProviderOptions.js';
import clientProvider from '../utils/web3/clientProvider.js';
import createWallet from './walletGen';

const Web3 = require('web3');
const eth = require('ethers');
const humanTokenAbi = require('../abi/humanToken.json');

// const env = process.env.NODE_ENV;
const tokenAbi = humanTokenAbi;
// console.log(`starting app in env: ${JSON.stringify(process.env, null, 1)}`);

// Provider info
// local
const hubUrlLocal = 'http://localhost:8080';
const localProvider = 'http://localhost:8545';
// REACT_APP_LOCAL_HUB_URL=http://localhost:8080
// REACT_APP_LOCAL_RPC_URL=http://localhost:8545
// // rinkeby
// const hubUrlRinkeby = process.env.REACT_APP_RINKEBY_HUB_URL.toLowerCase();
// const rinkebyProvider = process.env.REACT_APP_RINKEBY_RPC_URL.toLowerCase();
// // mainnet
// const hubUrlMainnet = process.env.REACT_APP_MAINNET_HUB_URL.toLowerCase();
// const mainnetProvider = process.env.REACT_APP_MAINNET_RPC_URL.toLowerCase();

const HASH_PREAMBLE = 'SpankWallet authentication message:';
const DEPOSIT_MINIMUM_WEI = eth.utils.parseEther('0.03'); // 30 FIN
const HUB_EXCHANGE_CEILING = eth.utils.parseEther('69'); // 69 TST

const opts = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: 'Bearer foo',
  },
  withCredentials: true,
};

class Card {
  constructor(config) {
    console.log(config);
    this.state = {
      rpcUrl: null,
      hubUrl: null,
      tokenAddress: null,
      channelManagerAddress: null,
      hubWalletAddress: null,
      web3: null,
      customWeb3: null,
      tokenContract: null,
      connext: null,
      delegateSigner: null,
      modals: {
        settings: false,
        keyGen: false,
        receive: false,
        send: false,
        cashOut: false,
        scan: false,
        deposit: false,
      },
      authorized: 'false',
      approvalWeiUser: '10000',
      channelState: null,
      exchangeRate: '0.00',
      interval: null,
      connextState: null,
      runtime: null,
      sendScanArgs: {
        amount: null,
        recipient: null,
      },
      address: '',
      status: {
        deposit: '',
        withdraw: '',
        payment: '',
      },
    };

    this.networkHandler = this.networkHandler.bind(this);
  }

  async init(config) {
    // this.web3 = config.web3;
    // this.networkId = await config.getNetwork();

    /* 
    Start Connext logic
    */

    // Set up state
    const mnemonic = localStorage.getItem('mnemonic');
    let rpc = localStorage.getItem('rpc');
    // TODO: better way to set default provider
    // if it doesnt exist in storage
    if (!rpc) {
      rpc = 'LOCALHOST';
      // rpc = env === 'development' ? 'LOCALHOST' : 'RINKEBY';
      localStorage.setItem('rpc', rpc);
    }
    // If a browser address exists, create wallet
    if (mnemonic) {
      const delegateSigner = await createWallet(mnemonic);
      const address = await delegateSigner.getAddressString();
      this.state.address = address;
      console.log('Autosigner address: ', address);

      // TODO
      // this.setState({ delegateSigner, address });
      // store.dispatch({
      //   type: 'SET_WALLET',
      //   text: delegateSigner,
      // });

      // // If a browser address exists, instantiate connext
      // console.log('this.state.delegateSigner', this.state.delegateSigner)
      // if (this.state.delegateSigner) {
      await this.setWeb3(delegateSigner, rpc);
      await this.setConnext();
      await this.setTokenContract();
      // await this.authorizeHandler();

      await this.pollConnextState();
      await this.poller();
    } else {
      // Else, we wait for user to finish selecting through modal which will refresh page when done
      // TODO
      // const { modals } = this.state;
      // this.setState({ modals: { ...modals, keyGen: true } });
      await createWallet(this.state.web3);
      // Then refresh the page
      window.location.reload();
    }
  }

  // ************************************************* //
  //                State setters                      //
  // ************************************************* //
  async networkHandler(rpc) {
    // called from settingsCard when a new RPC URL is connected
    // will create a new custom web3 and reinstantiate connext
    localStorage.setItem('rpc', rpc);
    await this.setWeb3(rpc);
    await this.setConnext();
    await this.setTokenContract();
  }

  // either LOCALHOST MAINNET or RINKEBY
  async setWeb3(address, rpc) {
    let rpcUrl;
    let hubUrl;
    switch (rpc) {
      case 'LOCALHOST':
        rpcUrl = localProvider;
        hubUrl = hubUrlLocal;
        break;
      // case 'RINKEBY':
      //   rpcUrl = rinkebyProvider;
      //   hubUrl = hubUrlRinkeby;
      //   break;
      // case 'MAINNET':
      //   rpcUrl = mainnetProvider;
      //   hubUrl = hubUrlMainnet;
      //   break;
      default:
        throw new Error(`Unrecognized rpc: ${rpc}`);
    }
    console.log('Custom provider with rpc:', rpcUrl);

    // Ask permission to view accounts
    let windowId;
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      windowId = await window.web3.eth.net.getId();
    }

    const providerOpts = new ProviderOptions(address, rpcUrl).approving();
    const provider = clientProvider(providerOpts);
    const customWeb3 = new Web3(provider);
    this.state.customWeb3 = customWeb3;
    console.log('customWeb3');
    // console.log('-------- Crashes below --------')
    // const customId = await customWeb3.eth.net.getId();
    console.log('customId');

    // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext
    // this.setState({ customWeb3, hubUrl });
    if (windowId && true) {
    // if (windowId && windowId !== customId) {
      console.log(`REMOVED ALERT --- Your card is set to ${JSON.stringify(rpc)}`);
      // alert(
      //   `Your card is set to ${JSON.stringify(
      //     rpc,
      //   )}. To avoid losing funds, please make sure your metamask and card are using the same network.`,
      // );
    }
  }

  async setTokenContract() {
    try {
      const { customWeb3, tokenAddress } = this.state;
      const tokenContract = new customWeb3.eth.Contract(tokenAbi, tokenAddress);
      // this.setState({ tokenContract });
      console.log('Set up token contract details');
    } catch (e) {
      console.log('Error setting token contract');
      console.log(e);
    }
  }

  async setConnext() {
    const hubUrl = 'http://localhost:8080';
    const { address, customWeb3 } = this.state;

    const options = {
      web3: customWeb3,
      hubUrl, // in dev-mode: http://localhost:8080,
      user: address,
    };
    console.log('Setting up connext with options:', options);

    // *** Instantiate the connext client ***
    const connext = await getConnextClient(options);
    console.log(`Successfully set up connext! Connext config:`);
    console.log(`  - tokenAddress: ${connext.opts.tokenAddress}`);
    console.log(`  - hubAddress: ${connext.opts.hubAddress}`);
    console.log(`  - contractAddress: ${connext.opts.contractAddress}`);
    console.log(`  - ethNetworkId: ${connext.opts.ethNetworkId}`);
    this.state.connext = connext;
    // this.setState({
    //   connext,
    //   tokenAddress: connext.opts.tokenAddress,
    //   channelManagerAddress: connext.opts.contractAddress,
    //   hubWalletAddress: connext.opts.hubAddress,
    //   ethNetworkId: connext.opts.ethNetworkId,
    // });
  }

  // ************************************************* //
  //                    Pollers                        //
  // ************************************************* //
  async pollConnextState() {
    const { connext } = this.state;
    console.log('connext', connext);
    // register listeners
    connext.on('onStateChange', state => {
      console.log('Connext state changed:', state);
      // this.setState({
      //   channelState: state.persistent.channel,
      //   connextState: state,
      //   runtime: state.runtime,
      //   exchangeRate: state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0,
      // });
    });
    // start polling
    await connext.start();
  }

  async poller() {
    await this.autoDeposit();
    await this.autoSwap();

    setInterval(async () => {
      await this.autoDeposit();
      await this.autoSwap();
    }, 1000);

    setInterval(async () => {
      await this.checkStatus();
    }, 400);
  }

  async autoDeposit() {
    const { address, tokenContract, customWeb3, connextState, tokenAddress } = this.state;
    const balance = await customWeb3.eth.getBalance(address);
    let tokenBalance = '0';
    try {
      tokenBalance = await tokenContract.methods.balanceOf(address).call();
    } catch (e) {
      console.warn(
        `Error fetching token balance, are you sure the token address (addr: ${tokenAddress}) is correct for the selected network (id: ${await customWeb3.eth.net.getId()}))? Error: ${
          e.message
        }`,
      );
    }

    if (balance !== '0' || tokenBalance !== '0') {
      if (eth.utils.bigNumberify(balance).lte(DEPOSIT_MINIMUM_WEI)) {
        // don't autodeposit anything under the threshold
        return;
      }
      // only proceed with deposit request if you can deposit
      if (!connextState || !connextState.runtime.canDeposit) {
        // console.log("Cannot deposit");
        return;
      }

      const actualDeposit = {
        amountWei: eth.utils
          .bigNumberify(balance)
          .sub(DEPOSIT_MINIMUM_WEI)
          .toString(),
        amountToken: tokenBalance,
      };

      if (actualDeposit.amountWei === '0' && actualDeposit.amountToken === '0') {
        console.log(`Actual deposit is 0, not depositing.`);
        return;
      }

      console.log(`Depositing: ${JSON.stringify(actualDeposit, null, 2)}`);
      const depositRes = await this.state.connext.deposit(actualDeposit);
      console.log(`Deposit Result: ${JSON.stringify(depositRes, null, 2)}`);
    }
  }

  async autoSwap() {
    const { channelState, connextState } = this.state;
    if (!connextState || !connextState.runtime.canExchange) {
      // console.log("Cannot exchange");
      return;
    }
    const weiBalance = eth.utils.bigNumberify(channelState.balanceWeiUser);
    const tokenBalance = eth.utils.bigNumberify(channelState.balanceTokenUser);
    if (channelState && weiBalance.gt(eth.utils.bigNumberify('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING)) {
      console.log(`Exchanging ${channelState.balanceWeiUser} wei`);
      await this.state.connext.exchange(channelState.balanceWeiUser, 'wei');
    }
  }

  async checkStatus() {
    const { channelState, runtime } = this.state;
    let deposit = null;
    let payment = null;
    let withdraw = null;
    if (runtime.syncResultsFromHub[0]) {
      switch (runtime.syncResultsFromHub[0].update.reason) {
        case 'ProposePendingDeposit':
          deposit = 'PENDING';
          break;
        case 'ProposePendingWithdrawal':
          withdraw = 'PENDING';
          break;
        case 'ConfirmPending':
          withdraw = 'SUCCESS';
          break;
        case 'Payment':
          payment = 'SUCCESS';
          break;
        default:
          deposit = null;
          withdraw = null;
          payment = null;
      }
      // await this.setState({ status: { deposit, withdraw, payment } });
    }
  }

  // ************************************************* //
  //                    Handlers                       //
  // ************************************************* //
  async authorizeHandler() {
    const hubUrl = 'http://localhost:8080';
    const web3 = this.state.customWeb3;
    const challengeRes = await axios.post(`${hubUrl}/auth/challenge`, {}, opts);

    
    const hash = web3.utils.sha3(
      `${HASH_PREAMBLE} ${web3.utils.sha3(challengeRes.data.nonce)} ${web3.utils.sha3('localhost')}`,
    );
    
    console.log('sign problem?')

    const signature = await web3.eth.personal.sign(hash, this.state.address);
    console.log('GOIT HEREHRHE??')

    try {
      const authRes = await axios.post(
        `${hubUrl}/auth/response`,
        {
          nonce: challengeRes.data.nonce,
          address: this.state.address,
          origin: 'localhost',
          signature,
        },
        opts,
      );
      const { token } = authRes.data.token;
      document.cookie = `hub.sid=${token}`;
      console.log(`hub authentication cookie set: ${token}`);
      const res = await axios.get(`${hubUrl}/auth/status`, opts);
      if (res.data.success) {
        // this.setState({ authorized: true });
        return res.data.success;
      } else {
        // this.setState({ authorized: false });
      }
      console.log(`Auth status: ${JSON.stringify(res.data)}`);
    } catch (e) {
      console.log(e);
    }
  }

  async scanURL(amount, recipient) {
    // this.setState({
    //   sendScanArgs: {
    //     amount,
    //     recipient,
    //   },
    // });
  }

  async collateralHandler() {
    console.log(`Requesting Collateral`);
    const collateralRes = await this.state.connext.requestCollateral();
    console.log(`Collateral result: ${JSON.stringify(collateralRes, null, 2)}`);
  }

  async closeConfirmations() {
    const deposit = null;
    const payment = null;
    const withdraw = null;
    // this.setState({ status: { deposit, payment, withdraw } });
  }
}

export default Card;
