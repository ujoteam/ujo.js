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

require("babel-polyfill");

var _Connext = require("connext/dist/Connext");

var _axios = _interopRequireDefault(require("axios"));

var _web = _interopRequireDefault(require("web3"));

var _ethers = require("ethers");

var _Utils = require("connext/dist/Utils");

var _types = require("connext/dist/types");

var _getExchangeRates = _interopRequireDefault(require("connext/dist/lib/getExchangeRates"));

var _CurrencyTypes = require("connext/dist/state/ConnextState/CurrencyTypes");

var _CurrencyConvertable = _interopRequireDefault(require("connext/dist/lib/currency/CurrencyConvertable"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _bn = _interopRequireDefault(require("bn.js"));

var _ProviderOptions = _interopRequireDefault(require("./utils/ProviderOptions"));

var _clientProvider = _interopRequireDefault(require("./utils/web3/clientProvider"));

var _getDollarSubstring = require("./utils/getDollarSubstring");

var _walletGen = _interopRequireDefault(require("./walletGen"));

var _humanToken = _interopRequireDefault(require("./abi/humanToken.json"));

// set constants
var HASH_PREAMBLE = 'SpankWallet authentication message:'; // const DEPOSIT_MINIMUM_WEI = ethers.utils.parseEther('0.03'); // 30 FIN

var DEPOSIT_ESTIMATED_GAS = new _bignumber.default('700000'); // 700k gas

var HUB_EXCHANGE_CEILING = new _bignumber.default(_web.default.utils.toWei('69', 'ether')); // 69 TST

var CHANNEL_DEPOSIT_MAX = new _bignumber.default(_web.default.utils.toWei('30', 'ether')); // 30 TST

var opts = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: 'Bearer foo'
  },
  withCredentials: true
}; // define class

var Card =
/*#__PURE__*/
function () {
  function Card(cb) {
    (0, _classCallCheck2.default)(this, Card);
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
  } // TODO: take in mnemonic so that users can
  // generate wallet from another dapplication


  (0, _createClass2.default)(Card, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        var hubUrl,
            rpcProvider,
            mnemonic,
            delegateSigner,
            address,
            _args = arguments;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                hubUrl = _args.length > 0 && _args[0] !== undefined ? _args[0] : 'http://localhost:8080';
                rpcProvider = _args.length > 1 && _args[1] !== undefined ? _args[1] : 'http://localhost:8545';
                // Set up wallet
                mnemonic = localStorage.getItem('mnemonic');
                _context.next = 5;
                return (0, _walletGen.default)(mnemonic);

              case 5:
                delegateSigner = _context.sent;
                _context.next = 8;
                return delegateSigner.getAddressString();

              case 8:
                address = _context.sent;
                this.address = address;
                this.hubUrl = hubUrl;
                this.rpcProvider = rpcProvider; // set up web3 and connext

                _context.next = 14;
                return this.setWeb3(delegateSigner, rpcProvider, hubUrl);

              case 14:
                _context.next = 16;
                return this.setConnext(hubUrl);

              case 16:
                _context.next = 18;
                return this.setTokenContract();

              case 18:
                _context.next = 20;
                return this.authorizeHandler();

              case 20:
                _context.next = 22;
                return this.pollConnextState();

              case 22:
                _context.next = 24;
                return this.setBrowserWalletMinimumBalance();

              case 24:
                _context.next = 26;
                return this.poller();

              case 26:
                return _context.abrupt("return", address);

              case 27:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }() // ************************************************* //
    //                State setters                      //
    // ************************************************* //

  }, {
    key: "setWeb3",
    value: function () {
      var _setWeb = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(address, rpcUrl, hubUrl) {
        var providerOpts, provider, customWeb3;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                providerOpts = new _ProviderOptions.default(address, rpcUrl, hubUrl).approving();
                provider = (0, _clientProvider.default)(providerOpts);
                customWeb3 = new _web.default(provider);
                this.web3 = customWeb3;

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setWeb3(_x, _x2, _x3) {
        return _setWeb.apply(this, arguments);
      }

      return setWeb3;
    }()
  }, {
    key: "setConnext",
    value: function () {
      var _setConnext = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(hubUrl) {
        var options, connext;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = {
                  web3: this.web3,
                  hubUrl: hubUrl,
                  user: this.address
                }; // *** Instantiate the connext client ***

                _context3.next = 3;
                return (0, _Connext.getConnextClient)(options);

              case 3:
                connext = _context3.sent;
                // console.log(`Successfully set up connext! Connext config:`);
                // console.log(`  - tokenAddress: ${connext.opts.tokenAddress}`);
                // console.log(`  - hubAddress: ${connext.opts.hubAddress}`);
                // console.log(`  - contractAddress: ${connext.opts.contractAddress}`);
                // console.log(`  - ethNetworkId: ${connext.opts.ethNetworkId}`);
                this.connext = connext;
                this.tokenAddress = connext.opts.tokenAddress;

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setConnext(_x4) {
        return _setConnext.apply(this, arguments);
      }

      return setConnext;
    }()
  }, {
    key: "setTokenContract",
    value: function () {
      var _setTokenContract = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4() {
        var tokenContract;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                try {
                  tokenContract = new this.web3.eth.Contract(_humanToken.default, this.tokenAddress);
                  this.tokenContract = tokenContract;
                } catch (e) {
                  console.log('Error setting token contract', e); // eslint-disable-line
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
    }() // ************************************************* //
    //                    Pollers                        //
    // ************************************************* //

  }, {
    key: "pollConnextState",
    value: function () {
      var _pollConnextState = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5() {
        var that;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                that = this; // register listeners

                this.connext.on('onStateChange', function (state) {
                  // console.log('STATE cHANEGE', state)
                  if (state.persistent.channel) {
                    var balance = state.persistent.channel.balanceTokenUser; // balance is in Dai, return via callback so app/service can process usd amount

                    that.stateUpdateCallback(balance);
                  }

                  that.channelState = state.persistent.channel;
                  that.connextState = state;
                  that.exchangeRate = state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0;
                  that.runtime = state.runtime;
                }); // start polling

                _context5.next = 4;
                return this.connext.start();

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
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
      _regenerator.default.mark(function _callee8() {
        var _this = this;

        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.autoDeposit();

              case 2:
                _context8.next = 4;
                return this.autoSwap();

              case 4:
                // await this.connext.requestCollateral();
                setInterval(
                /*#__PURE__*/
                (0, _asyncToGenerator2.default)(
                /*#__PURE__*/
                _regenerator.default.mark(function _callee6() {
                  return _regenerator.default.wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          _context6.next = 2;
                          return _this.autoDeposit();

                        case 2:
                        case "end":
                          return _context6.stop();
                      }
                    }
                  }, _callee6);
                })), 5000);
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
                          return _this.autoSwap();

                        case 2:
                        case "end":
                          return _context7.stop();
                      }
                    }
                  }, _callee7);
                })), 500); // setInterval(async () => {
                //   await this.checkStatus();
                // }, 400)

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function poller() {
        return _poller.apply(this, arguments);
      }

      return poller;
    }()
  }, {
    key: "setBrowserWalletMinimumBalance",
    value: function () {
      var _setBrowserWalletMinimumBalance = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee9() {
        var web3, connextState, defaultGas, depositGasPrice, minConvertable, browserMinimumBalance;
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                web3 = this.web3, connextState = this.connextState;

                if (!(!web3 || !connextState)) {
                  _context9.next = 3;
                  break;
                }

                return _context9.abrupt("return");

              case 3:
                _context9.t0 = _bn.default;
                _context9.next = 6;
                return web3.eth.getGasPrice();

              case 6:
                _context9.t1 = _context9.sent;
                defaultGas = new _context9.t0(_context9.t1);
                // default connext multiple is 1.5, leave 2x for safety
                depositGasPrice = DEPOSIT_ESTIMATED_GAS.multipliedBy(new _bignumber.default(2)).multipliedBy(defaultGas); // add dai conversion

                minConvertable = new _CurrencyConvertable.default(_CurrencyTypes.CurrencyType.WEI, depositGasPrice, function () {
                  return (0, _getExchangeRates.default)(connextState);
                });
                browserMinimumBalance = {
                  wei: minConvertable.toWEI().amount,
                  dai: minConvertable.toUSD().amount
                };
                this.browserMinimumBalance = browserMinimumBalance;

              case 12:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function setBrowserWalletMinimumBalance() {
        return _setBrowserWalletMinimumBalance.apply(this, arguments);
      }

      return setBrowserWalletMinimumBalance;
    }() // TODO: figure out why after proposing a deposit
    // it halts awaiting a confirm 

  }, {
    key: "autoDeposit",
    value: function () {
      var _autoDeposit = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee10() {
        var address, tokenContract, connextState, tokenAddress, exchangeRate, rpcProvider, web3, browserMinimumBalance, balance, tokenBalance, minWei, channelDeposit, weiDeposit;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                address = this.address, tokenContract = this.tokenContract, connextState = this.connextState, tokenAddress = this.tokenAddress, exchangeRate = this.exchangeRate, rpcProvider = this.rpcProvider, web3 = this.web3, browserMinimumBalance = this.browserMinimumBalance;

                if (rpcProvider) {
                  _context10.next = 3;
                  break;
                }

                return _context10.abrupt("return");

              case 3:
                _context10.next = 5;
                return web3.eth.getBalance(address);

              case 5:
                balance = _context10.sent;
                tokenBalance = '0';
                _context10.prev = 7;
                _context10.next = 10;
                return tokenContract.methods.balanceOf(address).call();

              case 10:
                tokenBalance = _context10.sent;
                _context10.next = 23;
                break;

              case 13:
                _context10.prev = 13;
                _context10.t0 = _context10["catch"](7);
                _context10.t1 = console;
                _context10.t2 = "Error fetching token balance, are you sure the token address (addr: ".concat(tokenAddress, ") is correct for the selected network (id: ");
                _context10.next = 19;
                return web3.eth.net.getId();

              case 19:
                _context10.t3 = _context10.sent;
                _context10.t4 = _context10.t0.message;
                _context10.t5 = _context10.t2.concat.call(_context10.t2, _context10.t3, "))? Error: ").concat(_context10.t4);

                _context10.t1.warn.call(_context10.t1, _context10.t5);

              case 23:
                if (!(balance !== '0' || tokenBalance !== '0')) {
                  _context10.next = 36;
                  break;
                }

                minWei = new _bignumber.default(browserMinimumBalance.wei); // don't autodeposit anything under the threshold
                // update the refunding variable before returning

                if (!new _bignumber.default(balance).lt(minWei)) {
                  _context10.next = 27;
                  break;
                }

                return _context10.abrupt("return");

              case 27:
                if (!(!connextState || !connextState.runtime.canDeposit || exchangeRate === '0.00')) {
                  _context10.next = 29;
                  break;
                }

                return _context10.abrupt("return");

              case 29:
                // if (!connextState || exchangeRate === '0.00') return;
                channelDeposit = {
                  amountWei: new _bignumber.default(balance).toFixed(0),
                  amountToken: tokenBalance
                };

                if (!(channelDeposit.amountWei === '0' && channelDeposit.amountToken === '0')) {
                  _context10.next = 32;
                  break;
                }

                return _context10.abrupt("return");

              case 32:
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
                weiDeposit = new _bignumber.default(channelDeposit.amountWei);
                channelDeposit.amountWei = weiDeposit.toFixed(0);
                _context10.next = 36;
                return this.connext.deposit(channelDeposit);

              case 36:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[7, 13]]);
      }));

      function autoDeposit() {
        return _autoDeposit.apply(this, arguments);
      }

      return autoDeposit;
    }() // returns a BigNumber

  }, {
    key: "autoSwap",
    // swapping wei for dai
    value: function () {
      var _autoSwap = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee11() {
        var channelState, connextState, weiBalance, tokenBalance;
        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                channelState = this.channelState, connextState = this.connextState;

                if (!(!connextState || !connextState.runtime.canExchange)) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt("return");

              case 3:
                weiBalance = new _bignumber.default(channelState.balanceWeiUser);
                tokenBalance = new _bignumber.default(channelState.balanceTokenUser);

                if (!(channelState && weiBalance.gt(new _bignumber.default('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING))) {
                  _context11.next = 8;
                  break;
                }

                _context11.next = 8;
                return this.connext.exchange(channelState.balanceWeiUser, 'wei');

              case 8:
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
    }() // ************************************************* //
    //                    Handlers                       //
    // ************************************************* //

  }, {
    key: "authorizeHandler",
    value: function () {
      var _authorizeHandler = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee12() {
        var web3, challengeRes, data, hash, signature, authRes, token, res;
        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                web3 = this.web3;
                _context12.next = 3;
                return _axios.default.post("".concat(this.hubUrl, "/auth/challenge"), {}, opts);

              case 3:
                challengeRes = _context12.sent;
                data = "".concat(HASH_PREAMBLE, " ").concat(web3.utils.sha3(challengeRes.data.nonce), " ").concat(web3.utils.sha3('localhost'));
                hash = web3.utils.sha3(data);
                _context12.next = 8;
                return web3.eth.personal.sign(hash, this.address, null);

              case 8:
                signature = _context12.sent;
                _context12.prev = 9;
                _context12.next = 12;
                return _axios.default.post("".concat(this.hubUrl, "/auth/response"), {
                  nonce: challengeRes.data.nonce,
                  address: this.address,
                  origin: 'localhost',
                  signature: signature
                }, opts);

              case 12:
                authRes = _context12.sent;
                token = authRes.data.token;
                document.cookie = "hub.sid=".concat(token); // console.log(`hub authentication cookie set: ${token}`);

                _context12.next = 17;
                return _axios.default.get("".concat(this.hubUrl, "/auth/status"), opts);

              case 17:
                res = _context12.sent;
                _context12.next = 23;
                break;

              case 20:
                _context12.prev = 20;
                _context12.t0 = _context12["catch"](9);
                console.log(_context12.t0);

              case 23:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[9, 20]]);
      }));

      function authorizeHandler() {
        return _authorizeHandler.apply(this, arguments);
      }

      return authorizeHandler;
    }() // ************************************************* //
    //                  Send Funds                       //
    // ************************************************* //

  }, {
    key: "generateRedeemableLink",
    value: function () {
      var _generateRedeemableLink = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee13(value) {
        var connext, payment;
        return _regenerator.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                connext = this.connext;

                if (!Number.isNaN(value)) {
                  _context13.next = 3;
                  break;
                }

                throw new Error('Value is not a number');

              case 3:
                // generate secret, set type, and set
                // recipient to empty address
                payment = {
                  meta: {
                    purchaseId: 'payment'
                  },
                  payments: [{
                    type: 'PT_LINK',
                    recipient: _Utils.emptyAddress,
                    secret: connext.generateSecret(),
                    amount: {
                      amountToken: (value * Math.pow(10, 18)).toString(),
                      amountWei: '0'
                    }
                  }]
                };
                return _context13.abrupt("return", this.paymentHandler(payment));

              case 5:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function generateRedeemableLink(_x5) {
        return _generateRedeemableLink.apply(this, arguments);
      }

      return generateRedeemableLink;
    }()
  }, {
    key: "generatePayment",
    value: function () {
      var _generatePayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee14(value, recipientAddress) {
        var connext, payment;
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                connext = this.connext;

                if (!Number.isNaN(value)) {
                  _context14.next = 3;
                  break;
                }

                throw new Error('Value is not a number');

              case 3:
                // generate secret, set type, and set
                payment = {
                  meta: {
                    purchaseId: 'payment'
                  },
                  payments: [{
                    type: 'PT_CHANNEL',
                    recipient: recipientAddress,
                    secret: connext.generateSecret(),
                    amount: {
                      amountToken: (value * Math.pow(10, 18)).toString(),
                      amountWei: '0'
                    }
                  }]
                };
                return _context14.abrupt("return", this.paymentHandler(payment));

              case 5:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function generatePayment(_x6, _x7) {
        return _generatePayment.apply(this, arguments);
      }

      return generatePayment;
    }() // returns true on a successful payment to address
    // return the secret on a successful link generation
    // otherwise throws an error

  }, {
    key: "paymentHandler",
    value: function () {
      var _paymentHandler = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee15(payment) {
        var connext, web3, channelState, balanceError, addressError, paymentAmount, recipient, errorMessage, paymentRes;
        return _regenerator.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                connext = this.connext, web3 = this.web3, channelState = this.channelState; // check if the recipient needs collateral

                _context15.next = 3;
                return connext.recipientNeedsCollateral(payment.payments[0].recipient, (0, _types.convertPayment)('str', payment.payments[0].amount));

              case 3:
                // validate that the token amount is within bounds
                paymentAmount = (0, _types.convertPayment)('bn', payment.payments[0].amount);

                if (paymentAmount.amountToken.gt(new _bn.default(channelState.balanceTokenUser))) {
                  balanceError = 'Insufficient balance in channel';
                }

                if (paymentAmount.amountToken.isZero()) {
                  balanceError = 'Please enter a payment amount above 0';
                } // validate recipient is valid address OR the empty address
                // TODO: handle in other functions that structure payment object


                recipient = payment.payments[0].recipient;

                if (!web3.utils.isAddress(recipient) && recipient !== _Utils.emptyAddress) {
                  addressError = 'Please choose a valid address';
                } // return if either errors exist


                if (!(balanceError || addressError)) {
                  _context15.next = 11;
                  break;
                }

                errorMessage = balanceError || addressError;
                throw new Error(errorMessage);

              case 11:
                _context15.prev = 11;
                _context15.next = 14;
                return connext.buy(payment);

              case 14:
                paymentRes = _context15.sent;

                if (!(payment.payments[0].type === 'PT_LINK')) {
                  _context15.next = 17;
                  break;
                }

                return _context15.abrupt("return", payment.payments[0].secret);

              case 17:
                return _context15.abrupt("return", true);

              case 20:
                _context15.prev = 20;
                _context15.t0 = _context15["catch"](11);
                throw new Error(_context15.t0);

              case 23:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this, [[11, 20]]);
      }));

      function paymentHandler(_x8) {
        return _paymentHandler.apply(this, arguments);
      }

      return paymentHandler;
    }()
  }, {
    key: "redeemPayment",
    value: function () {
      var _redeemPayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee16(secret) {
        var connext, channelState, connextState;
        return _regenerator.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                connext = this.connext, channelState = this.channelState, connextState = this.connextState;

                if (!(!connext || !channelState || !connextState)) {
                  _context16.next = 3;
                  break;
                }

                throw new Error('Connext not configured');

              case 3:
                if (secret) {
                  _context16.next = 5;
                  break;
                }

                throw new Error('No secret detected, cannot redeem payment.');

              case 5:
                _context16.prev = 5;
                return _context16.abrupt("return", connext.redeem(secret));

              case 9:
                _context16.prev = 9;
                _context16.t0 = _context16["catch"](5);
                throw new Error(_context16.t0);

              case 12:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this, [[5, 9]]);
      }));

      function redeemPayment(_x9) {
        return _redeemPayment.apply(this, arguments);
      }

      return redeemPayment;
    }() // ************************************************* //
    //                    Helper                         //
    // ************************************************* //

  }, {
    key: "convertDaiToUSDString",
    value: function convertDaiToUSDString(dai) {
      // const balance = state.persistent.channel.balanceTokenUser;
      var substr = dai ? (0, _getDollarSubstring.getDollarSubstring)(dai) : ['0', '00'];
      var cents = substr[1].substring(0, 2);
      if (cents.length === 1) cents = "".concat(cents, "0");
      return "".concat(substr[0], ".").concat(cents);
    }
  }], [{
    key: "calculateWeiToRefund",
    value: function calculateWeiToRefund(wei, connextState) {
      // channel max tokens is minimum of the ceiling that
      // the hub would exchange, or a set deposit max
      var ceilingWei = new _CurrencyConvertable.default(_CurrencyTypes.CurrencyType.BEI, _bignumber.default.min(HUB_EXCHANGE_CEILING, CHANNEL_DEPOSIT_MAX), function () {
        return (0, _getExchangeRates.default)(connextState);
      }).toWEI().amountBigNumber;

      var weiToRefund = _bignumber.default.max(new _bn.default(wei).minus(ceilingWei), new _bn.default(0));

      return weiToRefund.toFixed(0);
    }
  }]);
  return Card;
}();

var _default = Card;
exports.default = _default;
//# sourceMappingURL=index.js.map