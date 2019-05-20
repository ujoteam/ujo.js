"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

require("babel-polyfill");

var _Connext = require("connext/dist/Connext");

var _web = _interopRequireDefault(require("web3"));

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
var DEPOSIT_ESTIMATED_GAS = new _bignumber.default('700000'); // 700k gas

var HUB_EXCHANGE_CEILING = new _bignumber.default(_web.default.utils.toWei('69', 'ether')); // 69 TST

var CHANNEL_DEPOSIT_MAX = new _bignumber.default(_web.default.utils.toWei('30', 'ether')); // 30 TST=

var constructorError = 'Card constructor takes one object as an argument with "hubUrl", "rpcProvider", and "onStateUpdate" as properties.'; // define class

var Card =
/*#__PURE__*/
function () {
  function Card(opts) {
    (0, _classCallCheck2.default)(this, Card);
    if ((0, _typeof2.default)(opts) !== 'object') throw new Error(constructorError); // passed in options

    this.onStateUpdate = opts.onStateUpdate ? opts.onStateUpdate : function () {};
    this.hubUrl = opts.hubUrl ? opts.hubUrl : 'http://localhost:8080';
    this.rpcProvider = opts.rpcProvider ? opts.rpcProvider : 'http://localhost:8545';
    this.domain = opts.domain ? opts.domain : 'localhost'; // might not need

    this.address = '';
    this.web3 = {};
    this.connext = {};
    this.tokenAddress = null;
    this.tokenContract = null;
    this.channelState = null;
    this.connextState = null;
    this.exchangeRate = '0.00';
  } // TODO: take in mnemonic so that users can
  // generate wallet from another dapplication


  (0, _createClass2.default)(Card, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(existingMnemonic) {
        var mnemonic, delegateSigner, address;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // check if mnemonic exists in LS
                mnemonic = existingMnemonic || localStorage.getItem('mnemonic'); // otherwise generate wallet in create wallet

                _context.next = 3;
                return (0, _walletGen.default)(mnemonic);

              case 3:
                delegateSigner = _context.sent;
                _context.next = 6;
                return delegateSigner.getAddressString();

              case 6:
                address = _context.sent;
                this.address = address; // set up web3 and connext

                _context.next = 10;
                return this.setWeb3(delegateSigner);

              case 10:
                _context.next = 12;
                return this.setConnext();

              case 12:
                _context.next = 14;
                return this.setTokenContract();

              case 14:
                _context.next = 16;
                return this.pollConnextState();

              case 16:
                _context.next = 18;
                return this.setBrowserWalletMinimumBalance();

              case 18:
                _context.next = 20;
                return this.poller();

              case 20:
                return _context.abrupt("return", address);

              case 21:
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
    key: "setWeb3",
    value: function () {
      var _setWeb = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(delegateSigner) {
        var providerOpts, provider, customWeb3;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                providerOpts = new _ProviderOptions.default(delegateSigner, this.rpcProvider, this.hubUrl).approving();
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

      function setWeb3(_x2) {
        return _setWeb.apply(this, arguments);
      }

      return setWeb3;
    }()
  }, {
    key: "setConnext",
    value: function () {
      var _setConnext = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3() {
        var options, connext;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = {
                  web3: this.web3,
                  hubUrl: this.hubUrl,
                  user: this.address,
                  origin: this.domain
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

      function setConnext() {
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
                  if (state.persistent.channel) {
                    var balance = state.persistent.channel.balanceTokenUser; // balance is in Dai, return via callback so app/service can process usd amount

                    that.onStateUpdate(balance);
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

                if (!(!rpcProvider || !browserMinimumBalance)) {
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
                  amountWei: new _bignumber.default(new _bignumber.default(balance).minus(minWei)).toFixed(0),
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
    //                  Send Funds                       //
    // ************************************************* //

  }, {
    key: "generateRedeemableLink",
    value: function () {
      var _generateRedeemableLink = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee12(value) {
        var connext, payment;
        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                connext = this.connext;

                if (!Number.isNaN(value)) {
                  _context12.next = 3;
                  break;
                }

                throw new Error('Value is not a number');

              case 3:
                // generate secret, set type, and set
                // recipient to empty address
                payment = {
                  meta: {
                    purchaseId: 'ujo'
                  },
                  payments: [{
                    type: 'PT_LINK',
                    recipient: _Utils.emptyAddress,
                    amount: {
                      amountToken: connext.opts.web3.utils.toWei(value.toString(), "ether"),
                      amountWei: '0'
                    },
                    meta: {
                      secret: connext.generateSecret()
                    }
                  }]
                };
                return _context12.abrupt("return", this.paymentHandler(payment));

              case 5:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function generateRedeemableLink(_x3) {
        return _generateRedeemableLink.apply(this, arguments);
      }

      return generateRedeemableLink;
    }()
  }, {
    key: "generatePayment",
    value: function () {
      var _generatePayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee13(value, recipientAddress) {
        var connext, payment, act;
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
                payment = {
                  meta: {
                    purchaseId: 'ujo'
                  },
                  payments: [{
                    type: 'PT_CHANNEL',
                    recipient: recipientAddress,
                    // secret: connext.generateSecret(),
                    amount: {
                      amountToken: connext.opts.web3.utils.toWei(value.toString(), "ether"),
                      amountWei: '0'
                    }
                  }]
                };
                _context13.next = 6;
                return this.paymentHandler(payment);

              case 6:
                act = _context13.sent;
                console.log('act', act);
                return _context13.abrupt("return", act);

              case 9:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function generatePayment(_x4, _x5) {
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
      _regenerator.default.mark(function _callee14(payment) {
        var connext, web3, channelState, needsCollateral, balanceError, addressError, paymentAmount, recipient, errorMessage, paymentRes;
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                connext = this.connext, web3 = this.web3, channelState = this.channelState; // check if the recipient needs collateral
                // is utilized later in fn. Consider in a v2

                _context14.next = 3;
                return connext.recipientNeedsCollateral(payment.payments[0].recipient, (0, _types.convertPayment)('str', payment.payments[0].amount));

              case 3:
                needsCollateral = _context14.sent;
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
                  _context14.next = 12;
                  break;
                }

                errorMessage = balanceError || addressError;
                throw new Error(errorMessage);

              case 12:
                _context14.prev = 12;
                _context14.next = 15;
                return connext.buy(payment);

              case 15:
                paymentRes = _context14.sent;

                if (!(payment.payments[0].type === 'PT_LINK')) {
                  _context14.next = 18;
                  break;
                }

                return _context14.abrupt("return", payment.payments[0].meta.secret);

              case 18:
                return _context14.abrupt("return", true);

              case 21:
                _context14.prev = 21;
                _context14.t0 = _context14["catch"](12);
                throw new Error(_context14.t0);

              case 24:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this, [[12, 21]]);
      }));

      function paymentHandler(_x6) {
        return _paymentHandler.apply(this, arguments);
      }

      return paymentHandler;
    }()
  }, {
    key: "collateralizeRecipient",
    value: function () {
      var _collateralizeRecipient = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee16(payment) {
        var connext, success, needsCollateral;
        return _regenerator.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                connext = this.connext; // do not collateralize on pt link payments

                if (!(payment.payments[0].type === 'PT_LINK')) {
                  _context16.next = 3;
                  break;
                }

                return _context16.abrupt("return");

              case 3:
                _context16.next = 5;
                return connext.buy(payment);

              case 5:
                success = _context16.sent;

                if (!success) {
                  _context16.next = 8;
                  break;
                }

                return _context16.abrupt("return");

              case 8:
                _context16.next = 10;
                return setInterval(
                /*#__PURE__*/
                function () {
                  var _ref3 = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee15(iteration, stop) {
                    return _regenerator.default.wrap(function _callee15$(_context15) {
                      while (1) {
                        switch (_context15.prev = _context15.next) {
                          case 0:
                            _context15.next = 2;
                            return connext.recipientNeedsCollateral(payment.payments[0].recipient, (0, _types.convertPayment)('str', payment.payments[0].amount));

                          case 2:
                            needsCollateral = _context15.sent;

                            if (!needsCollateral || iteration > 20) {
                              stop();
                            }

                          case 4:
                          case "end":
                            return _context15.stop();
                        }
                      }
                    }, _callee15);
                  }));

                  return function (_x8, _x9) {
                    return _ref3.apply(this, arguments);
                  };
                }(), 5000, {
                  iterations: 20
                });

              case 10:
                if (!needsCollateral) {
                  _context16.next = 13;
                  break;
                }

                this.setState({
                  showReceipt: true,
                  paymentState: PaymentStates.CollateralTimeout
                });
                return _context16.abrupt("return", CollateralStates.Timeout);

              case 13:
                return _context16.abrupt("return", CollateralStates.Success);

              case 14:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function collateralizeRecipient(_x7) {
        return _collateralizeRecipient.apply(this, arguments);
      }

      return collateralizeRecipient;
    }() // not utilized yet

  }, {
    key: "tryToCollateralize",
    value: function tryToCollateralize(payment) {
      var connext = this.connext;
      var iteration = 0;
      return new Promise(function (res, rej) {
        var collateralizeInterval = setInterval(
        /*#__PURE__*/
        (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee17() {
          var needsCollateral;
          return _regenerator.default.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  console.log('interval', iteration);
                  _context17.next = 3;
                  return connext.recipientNeedsCollateral(payment.payments[0].recipient, (0, _types.convertPayment)('str', payment.payments[0].amount));

                case 3:
                  needsCollateral = _context17.sent;

                  if (!needsCollateral) {
                    console.log('successfulyl collateralized');
                    res(true);
                    clearInterval(collateralizeInterval);
                  } else if (iteration >= 20) {
                    rej(new Error('Unable to collateralize'));
                    clearInterval(collateralizeInterval);
                  }

                  iteration += 1;

                case 6:
                case "end":
                  return _context17.stop();
              }
            }
          }, _callee17);
        })), 5000);
      });
    }
  }, {
    key: "redeemPayment",
    value: function () {
      var _redeemPayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee18(secret) {
        var connext, channelState, connextState;
        return _regenerator.default.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                connext = this.connext, channelState = this.channelState, connextState = this.connextState;

                if (!(!connext || !channelState || !connextState)) {
                  _context18.next = 3;
                  break;
                }

                throw new Error('Connext not configured');

              case 3:
                if (secret) {
                  _context18.next = 5;
                  break;
                }

                throw new Error('No secret detected, cannot redeem payment.');

              case 5:
                _context18.prev = 5;
                return _context18.abrupt("return", connext.redeem(secret));

              case 9:
                _context18.prev = 9;
                _context18.t0 = _context18["catch"](5);
                throw new Error(_context18.t0);

              case 12:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this, [[5, 9]]);
      }));

      function redeemPayment(_x10) {
        return _redeemPayment.apply(this, arguments);
      }

      return redeemPayment;
    }() // ************************************************* //
    //                 Withdraw Funds                    //
    // ************************************************* //

  }, {
    key: "withdrawalAllFunds",
    value: function () {
      var _withdrawalAllFunds = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee19(recipient) {
        var withdrawEth,
            connext,
            web3,
            withdrawalVal,
            _args19 = arguments;
        return _regenerator.default.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                withdrawEth = _args19.length > 1 && _args19[1] !== undefined ? _args19[1] : true;
                connext = this.connext, web3 = this.web3;
                withdrawalVal = this.createWithdrawValues(recipient, withdrawEth); // check for valid address
                // let addressError = null
                // let balanceError = null

                if (web3.utils.isAddress(recipient)) {
                  _context19.next = 5;
                  break;
                }

                throw new Error("".concat(withdrawalVal.recipient, " is not a valid address"));

              case 5:
                // TODO: check the input balance is under channel balance
                // TODO: allow partial withdrawals?
                console.log("Withdrawing: ".concat(JSON.stringify(withdrawalVal, null, 2)));
                _context19.next = 8;
                return connext.withdraw(withdrawalVal);

              case 8:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function withdrawalAllFunds(_x11) {
        return _withdrawalAllFunds.apply(this, arguments);
      }

      return withdrawalAllFunds;
    }()
  }, {
    key: "createWithdrawValues",
    value: function createWithdrawValues(recipient, withdrawEth) {
      // set the state to contain the proper withdrawal args for
      // eth or dai withdrawal
      var channelState = this.channelState,
          exchangeRate = this.exchangeRate;
      var withdrawalVal = {
        recipient: recipient,
        exchangeRate: exchangeRate,
        tokensToSell: '0',
        withdrawalWeiUser: '0',
        weiToSell: '0',
        withdrawalTokenUser: '0'
      };

      if (withdrawEth) {
        // withdraw all channel balance in eth
        withdrawalVal = (0, _objectSpread2.default)({}, withdrawalVal, {
          tokensToSell: channelState.balanceTokenUser,
          withdrawalWeiUser: channelState.balanceWeiUser,
          weiToSell: '0',
          withdrawalTokenUser: '0'
        });
      } else {
        // handle withdrawing all channel balance in dai
        withdrawalVal = (0, _objectSpread2.default)({}, withdrawalVal, {
          tokensToSell: '0',
          withdrawalWeiUser: '0',
          weiToSell: channelState.balanceWeiUser,
          withdrawalTokenUser: channelState.balanceTokenUser
        });
      }

      return withdrawalVal;
    } // ************************************************* //
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