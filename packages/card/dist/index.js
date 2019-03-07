"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _Connext = require("connext/dist/Connext.js");

var _axios = _interopRequireDefault(require("axios"));

var _ProviderOptions = _interopRequireDefault(require("../utils/ProviderOptions.ts"));

var _clientProvider = _interopRequireDefault(require("../utils/web3/clientProvider.ts"));

var _walletGen = require("./walletGen");

var Web3 = require('web3');

var eth = require('ethers');

var humanTokenAbi = require('../abi/humanToken.json');

var env = process.env.NODE_ENV;
var tokenAbi = humanTokenAbi;
console.log("starting app in env: ".concat(JSON.stringify(process.env, null, 1))); // Provider info
// local

var hubUrlLocal = process.env.REACT_APP_LOCAL_HUB_URL.toLowerCase();
var localProvider = process.env.REACT_APP_LOCAL_RPC_URL.toLowerCase(); // rinkeby

var hubUrlRinkeby = process.env.REACT_APP_RINKEBY_HUB_URL.toLowerCase();
var rinkebyProvider = process.env.REACT_APP_RINKEBY_RPC_URL.toLowerCase(); // mainnet

var hubUrlMainnet = process.env.REACT_APP_MAINNET_HUB_URL.toLowerCase();
var mainnetProvider = process.env.REACT_APP_MAINNET_RPC_URL.toLowerCase();
var HASH_PREAMBLE = 'SpankWallet authentication message:';
var DEPOSIT_MINIMUM_WEI = eth.utils.parseEther('0.03'); // 30 FIN

var HUB_EXCHANGE_CEILING = eth.utils.parseEther('69'); // 69 TST

var opts = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: 'Bearer foo'
  },
  withCredentials: true
};

var Card =
/*#__PURE__*/
function () {
  function Card(config) {
    (0, _classCallCheck2.default)(this, Card);
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
        deposit: false
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
        recipient: null
      },
      address: '',
      status: {
        deposit: '',
        withdraw: '',
        payment: ''
      }
    };
    this.networkHandler = this.networkHandler.bind(this);
  }

  (0, _createClass2.default)(Card, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(config) {
        var mnemonic, rpc, delegateSigner, address;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.web3 = config.web3;
                _context.next = 3;
                return config.getNetwork();

              case 3:
                this.networkId = _context.sent;

                /* 
                Start Connext logic
                */
                // Set up state
                mnemonic = localStorage.getItem('mnemonic');
                rpc = localStorage.getItem('rpc'); // TODO: better way to set default provider
                // if it doesnt exist in storage

                if (!rpc) {
                  rpc = env === 'development' ? 'LOCALHOST' : 'RINKEBY';
                  localStorage.setItem('rpc', rpc);
                } // If a browser address exists, create wallet


                if (!mnemonic) {
                  _context.next = 30;
                  break;
                }

                _context.next = 10;
                return (0, _walletGen.createWalletFromMnemonic)(mnemonic);

              case 10:
                delegateSigner = _context.sent;
                _context.next = 13;
                return delegateSigner.getAddressString();

              case 13:
                address = _context.sent;
                console.log('Autosigner address: ', address); // TODO
                // this.setState({ delegateSigner, address });
                // store.dispatch({
                //   type: 'SET_WALLET',
                //   text: delegateSigner,
                // });
                // // If a browser address exists, instantiate connext
                // console.log('this.state.delegateSigner', this.state.delegateSigner)
                // if (this.state.delegateSigner) {

                _context.next = 17;
                return this.setWeb3(rpc);

              case 17:
                _context.next = 19;
                return this.setConnext();

              case 19:
                _context.next = 21;
                return this.setTokenContract();

              case 21:
                _context.next = 23;
                return this.authorizeHandler();

              case 23:
                console.log(this.state.connext);
                _context.next = 26;
                return this.pollConnextState();

              case 26:
                _context.next = 28;
                return this.poller();

              case 28:
                _context.next = 33;
                break;

              case 30:
                _context.next = 32;
                return (0, _walletGen.createWallet)(this.state.web3);

              case 32:
                // Then refresh the page
                window.location.reload();

              case 33:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _init.apply(this, arguments);
      }

      return init;
    }() // ************************************************* //
    //                State setters                      //
    // ************************************************* //

  }, {
    key: "networkHandler",
    value: function () {
      var _networkHandler = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(rpc) {
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // called from settingsCard when a new RPC URL is connected
                // will create a new custom web3 and reinstantiate connext
                localStorage.setItem('rpc', rpc);
                _context2.next = 3;
                return this.setWeb3(rpc);

              case 3:
                _context2.next = 5;
                return this.setConnext();

              case 5:
                _context2.next = 7;
                return this.setTokenContract();

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function networkHandler(_x2) {
        return _networkHandler.apply(this, arguments);
      }

      return networkHandler;
    }() // either LOCALHOST MAINNET or RINKEBY

  }, {
    key: "setWeb3",
    value: function () {
      var _setWeb = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(rpc) {
        var rpcUrl, hubUrl, windowId, providerOpts, provider, customWeb3, customId;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.t0 = rpc;
                _context3.next = _context3.t0 === 'LOCALHOST' ? 3 : _context3.t0 === 'RINKEBY' ? 6 : _context3.t0 === 'MAINNET' ? 9 : 12;
                break;

              case 3:
                rpcUrl = localProvider;
                hubUrl = hubUrlLocal;
                return _context3.abrupt("break", 13);

              case 6:
                rpcUrl = rinkebyProvider;
                hubUrl = hubUrlRinkeby;
                return _context3.abrupt("break", 13);

              case 9:
                rpcUrl = mainnetProvider;
                hubUrl = hubUrlMainnet;
                return _context3.abrupt("break", 13);

              case 12:
                throw new Error("Unrecognized rpc: ".concat(rpc));

              case 13:
                console.log('Custom provider with rpc:', rpcUrl); // Ask permission to view accounts

                if (!window.ethereum) {
                  _context3.next = 19;
                  break;
                }

                window.web3 = new Web3(window.ethereum);
                _context3.next = 18;
                return window.web3.eth.net.getId();

              case 18:
                windowId = _context3.sent;

              case 19:
                providerOpts = new _ProviderOptions.default(store, rpcUrl).approving();
                provider = (0, _clientProvider.default)(providerOpts);
                customWeb3 = new Web3(provider);
                _context3.next = 24;
                return customWeb3.eth.net.getId();

              case 24:
                customId = _context3.sent;
                // NOTE: token/contract/hubWallet ddresses are set to state while initializing connext
                this.setState({
                  customWeb3: customWeb3,
                  hubUrl: hubUrl
                });

                if (windowId && windowId !== customId) {
                  alert("Your card is set to ".concat(JSON.stringify(rpc), ". To avoid losing funds, please make sure your metamask and card are using the same network."));
                }

              case 27:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setWeb3(_x3) {
        return _setWeb.apply(this, arguments);
      }

      return setWeb3;
    }()
  }, {
    key: "setTokenContract",
    value: function () {
      var _setTokenContract = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4() {
        var _this$state, customWeb3, tokenAddress, tokenContract;

        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                try {
                  _this$state = this.state, customWeb3 = _this$state.customWeb3, tokenAddress = _this$state.tokenAddress;
                  tokenContract = new customWeb3.eth.Contract(tokenAbi, tokenAddress);
                  this.setState({
                    tokenContract: tokenContract
                  });
                  console.log('Set up token contract details');
                } catch (e) {
                  console.log('Error setting token contract');
                  console.log(e);
                }

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function setTokenContract() {
        return _setTokenContract.apply(this, arguments);
      }

      return setTokenContract;
    }()
  }, {
    key: "setConnext",
    value: function () {
      var _setConnext = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5() {
        var _this$state2, address, customWeb3, hubUrl, opts, connext;

        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _this$state2 = this.state, address = _this$state2.address, customWeb3 = _this$state2.customWeb3, hubUrl = _this$state2.hubUrl;
                opts = {
                  web3: customWeb3,
                  hubUrl: hubUrl,
                  // in dev-mode: http://localhost:8080,
                  user: address
                };
                console.log('Setting up connext with opts:', opts); // *** Instantiate the connext client ***

                _context5.next = 5;
                return (0, _Connext.getConnextClient)(opts);

              case 5:
                connext = _context5.sent;
                console.log("Successfully set up connext! Connext config:");
                console.log("  - tokenAddress: ".concat(connext.opts.tokenAddress));
                console.log("  - hubAddress: ".concat(connext.opts.hubAddress));
                console.log("  - contractAddress: ".concat(connext.opts.contractAddress));
                console.log("  - ethNetworkId: ".concat(connext.opts.ethNetworkId));
                this.setState({
                  connext: connext,
                  tokenAddress: connext.opts.tokenAddress,
                  channelManagerAddress: connext.opts.contractAddress,
                  hubWalletAddress: connext.opts.hubAddress,
                  ethNetworkId: connext.opts.ethNetworkId
                });

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function setConnext() {
        return _setConnext.apply(this, arguments);
      }

      return setConnext;
    }() // ************************************************* //
    //                    Pollers                        //
    // ************************************************* //

  }, {
    key: "pollConnextState",
    value: function () {
      var _pollConnextState = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee6() {
        var _this = this;

        var connext;
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                connext = this.state.connext.connext; // register listeners

                connext.on('onStateChange', function (state) {
                  console.log('Connext state changed:', state);

                  _this.setState({
                    channelState: state.persistent.channel,
                    connextState: state,
                    runtime: state.runtime,
                    exchangeRate: state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0
                  });
                }); // start polling

                _context6.next = 4;
                return connext.start();

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function pollConnextState() {
        return _pollConnextState.apply(this, arguments);
      }

      return pollConnextState;
    }()
  }, {
    key: "poller",
    value: function () {
      var _poller = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee9() {
        var _this2 = this;

        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.autoDeposit();

              case 2:
                _context9.next = 4;
                return this.autoSwap();

              case 4:
                setInterval(
                /*#__PURE__*/
                (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee7() {
                  return _regenerator.default.wrap(function _callee7$(_context7) {
                    while (1) {
                      switch (_context7.prev = _context7.next) {
                        case 0:
                          _context7.next = 2;
                          return _this2.autoDeposit();

                        case 2:
                          _context7.next = 4;
                          return _this2.autoSwap();

                        case 4:
                        case "end":
                          return _context7.stop();
                      }
                    }
                  }, _callee7);
                })), 1000);
                setInterval(
                /*#__PURE__*/
                (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee8() {
                  return _regenerator.default.wrap(function _callee8$(_context8) {
                    while (1) {
                      switch (_context8.prev = _context8.next) {
                        case 0:
                          _context8.next = 2;
                          return _this2.checkStatus();

                        case 2:
                        case "end":
                          return _context8.stop();
                      }
                    }
                  }, _callee8);
                })), 400);

              case 6:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function poller() {
        return _poller.apply(this, arguments);
      }

      return poller;
    }()
  }, {
    key: "autoDeposit",
    value: function () {
      var _autoDeposit = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee10() {
        var _this$state3, address, tokenContract, customWeb3, connextState, tokenAddress, balance, tokenBalance, actualDeposit, depositRes;

        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _this$state3 = this.state, address = _this$state3.address, tokenContract = _this$state3.tokenContract, customWeb3 = _this$state3.customWeb3, connextState = _this$state3.connextState, tokenAddress = _this$state3.tokenAddress;
                _context10.next = 3;
                return customWeb3.eth.getBalance(address);

              case 3:
                balance = _context10.sent;
                tokenBalance = '0';
                _context10.prev = 5;
                _context10.next = 8;
                return tokenContract.methods.balanceOf(address).call();

              case 8:
                tokenBalance = _context10.sent;
                _context10.next = 21;
                break;

              case 11:
                _context10.prev = 11;
                _context10.t0 = _context10["catch"](5);
                _context10.t1 = console;
                _context10.t2 = "Error fetching token balance, are you sure the token address (addr: ".concat(tokenAddress, ") is correct for the selected network (id: ");
                _context10.next = 17;
                return customWeb3.eth.net.getId();

              case 17:
                _context10.t3 = _context10.sent;
                _context10.t4 = _context10.t0.message;
                _context10.t5 = _context10.t2.concat.call(_context10.t2, _context10.t3, "))? Error: ").concat(_context10.t4);

                _context10.t1.warn.call(_context10.t1, _context10.t5);

              case 21:
                if (!(balance !== '0' || tokenBalance !== '0')) {
                  _context10.next = 35;
                  break;
                }

                if (!eth.utils.bigNumberify(balance).lte(DEPOSIT_MINIMUM_WEI)) {
                  _context10.next = 24;
                  break;
                }

                return _context10.abrupt("return");

              case 24:
                if (!(!connextState || !connextState.runtime.canDeposit)) {
                  _context10.next = 26;
                  break;
                }

                return _context10.abrupt("return");

              case 26:
                actualDeposit = {
                  amountWei: eth.utils.bigNumberify(balance).sub(DEPOSIT_MINIMUM_WEI).toString(),
                  amountToken: tokenBalance
                };

                if (!(actualDeposit.amountWei === '0' && actualDeposit.amountToken === '0')) {
                  _context10.next = 30;
                  break;
                }

                console.log("Actual deposit is 0, not depositing.");
                return _context10.abrupt("return");

              case 30:
                console.log("Depositing: ".concat(JSON.stringify(actualDeposit, null, 2)));
                _context10.next = 33;
                return this.state.connext.deposit(actualDeposit);

              case 33:
                depositRes = _context10.sent;
                console.log("Deposit Result: ".concat(JSON.stringify(depositRes, null, 2)));

              case 35:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[5, 11]]);
      }));

      function autoDeposit() {
        return _autoDeposit.apply(this, arguments);
      }

      return autoDeposit;
    }()
  }, {
    key: "autoSwap",
    value: function () {
      var _autoSwap = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee11() {
        var _this$state4, channelState, connextState, weiBalance, tokenBalance;

        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _this$state4 = this.state, channelState = _this$state4.channelState, connextState = _this$state4.connextState;

                if (!(!connextState || !connextState.runtime.canExchange)) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt("return");

              case 3:
                weiBalance = eth.utils.bigNumberify(channelState.balanceWeiUser);
                tokenBalance = eth.utils.bigNumberify(channelState.balanceTokenUser);

                if (!(channelState && weiBalance.gt(eth.utils.bigNumberify('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING))) {
                  _context11.next = 9;
                  break;
                }

                console.log("Exchanging ".concat(channelState.balanceWeiUser, " wei"));
                _context11.next = 9;
                return this.state.connext.exchange(channelState.balanceWeiUser, 'wei');

              case 9:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function autoSwap() {
        return _autoSwap.apply(this, arguments);
      }

      return autoSwap;
    }()
  }, {
    key: "checkStatus",
    value: function () {
      var _checkStatus = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee12() {
        var _this$state5, channelState, runtime, deposit, payment, withdraw;

        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _this$state5 = this.state, channelState = _this$state5.channelState, runtime = _this$state5.runtime;
                deposit = null;
                payment = null;
                withdraw = null;

                if (!runtime.syncResultsFromHub[0]) {
                  _context12.next = 21;
                  break;
                }

                _context12.t0 = runtime.syncResultsFromHub[0].update.reason;
                _context12.next = _context12.t0 === 'ProposePendingDeposit' ? 8 : _context12.t0 === 'ProposePendingWithdrawal' ? 10 : _context12.t0 === 'ConfirmPending' ? 12 : _context12.t0 === 'Payment' ? 14 : 16;
                break;

              case 8:
                deposit = 'PENDING';
                return _context12.abrupt("break", 19);

              case 10:
                withdraw = 'PENDING';
                return _context12.abrupt("break", 19);

              case 12:
                withdraw = 'SUCCESS';
                return _context12.abrupt("break", 19);

              case 14:
                payment = 'SUCCESS';
                return _context12.abrupt("break", 19);

              case 16:
                deposit = null;
                withdraw = null;
                payment = null;

              case 19:
                _context12.next = 21;
                return this.setState({
                  status: {
                    deposit: deposit,
                    withdraw: withdraw,
                    payment: payment
                  }
                });

              case 21:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function checkStatus() {
        return _checkStatus.apply(this, arguments);
      }

      return checkStatus;
    }() // ************************************************* //
    //                    Handlers                       //
    // ************************************************* //

  }, {
    key: "authorizeHandler",
    value: function () {
      var _authorizeHandler = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee13() {
        var hubUrl, web3, challengeRes, hash, signature, authRes, token, res;
        return _regenerator.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                hubUrl = this.state.hubUrl.hubUrl;
                web3 = this.state.customWeb3;
                _context13.next = 4;
                return _axios.default.post("".concat(hubUrl, "/auth/challenge"), {}, opts);

              case 4:
                challengeRes = _context13.sent;
                hash = web3.utils.sha3("".concat(HASH_PREAMBLE, " ").concat(web3.utils.sha3(challengeRes.data.nonce), " ").concat(web3.utils.sha3('localhost')));
                _context13.next = 8;
                return web3.eth.personal.sign(hash, this.state.address);

              case 8:
                signature = _context13.sent;
                _context13.prev = 9;
                _context13.next = 12;
                return _axios.default.post("".concat(hubUrl, "/auth/response"), {
                  nonce: challengeRes.data.nonce,
                  address: this.state.address,
                  origin: 'localhost',
                  signature: signature
                }, opts);

              case 12:
                authRes = _context13.sent;
                token = authRes.data.token.token;
                document.cookie = "hub.sid=".concat(token);
                console.log("hub authentication cookie set: ".concat(token));
                _context13.next = 18;
                return _axios.default.get("".concat(hubUrl, "/auth/status"), opts);

              case 18:
                res = _context13.sent;

                if (!res.data.success) {
                  _context13.next = 24;
                  break;
                }

                this.setState({
                  authorized: true
                });
                return _context13.abrupt("return", res.data.success);

              case 24:
                this.setState({
                  authorized: false
                });

              case 25:
                console.log("Auth status: ".concat(JSON.stringify(res.data)));
                _context13.next = 31;
                break;

              case 28:
                _context13.prev = 28;
                _context13.t0 = _context13["catch"](9);
                console.log(_context13.t0);

              case 31:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this, [[9, 28]]);
      }));

      function authorizeHandler() {
        return _authorizeHandler.apply(this, arguments);
      }

      return authorizeHandler;
    }()
  }, {
    key: "scanURL",
    value: function () {
      var _scanURL = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee14(amount, recipient) {
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                this.setState({
                  sendScanArgs: {
                    amount: amount,
                    recipient: recipient
                  }
                });

              case 1:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function scanURL(_x4, _x5) {
        return _scanURL.apply(this, arguments);
      }

      return scanURL;
    }()
  }, {
    key: "collateralHandler",
    value: function () {
      var _collateralHandler = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee15() {
        var collateralRes;
        return _regenerator.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                console.log("Requesting Collateral");
                _context15.next = 3;
                return this.state.connext.requestCollateral();

              case 3:
                collateralRes = _context15.sent;
                console.log("Collateral result: ".concat(JSON.stringify(collateralRes, null, 2)));

              case 5:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function collateralHandler() {
        return _collateralHandler.apply(this, arguments);
      }

      return collateralHandler;
    }()
  }, {
    key: "closeConfirmations",
    value: function () {
      var _closeConfirmations = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee16() {
        var deposit, payment, withdraw;
        return _regenerator.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                deposit = null;
                payment = null;
                withdraw = null;
                this.setState({
                  status: {
                    deposit: deposit,
                    payment: payment,
                    withdraw: withdraw
                  }
                });

              case 4:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function closeConfirmations() {
        return _closeConfirmations.apply(this, arguments);
      }

      return closeConfirmations;
    }()
  }]);
  return Card;
}();

var _default = Card;
exports.default = _default;
//# sourceMappingURL=index.js.map