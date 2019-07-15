"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var Connext = _interopRequireWildcard(require("connext"));

var _ethers = require("ethers");

var _web = _interopRequireDefault(require("web3"));

var _intervalPromise = _interopRequireDefault(require("interval-promise"));

var _getDollarSubstring = require("./utils/getDollarSubstring");

var _humanToken = _interopRequireDefault(require("./abi/humanToken.json"));

// set constants
var Big = function Big(n) {
  return _ethers.ethers.utils.bigNumberify(n.toString());
};

var _ref = new Connext.Utils(),
    getExchangeRates = _ref.getExchangeRates,
    hasPendingOps = _ref.hasPendingOps;

var emptyAddress = _ethers.ethers.constants.AddressZero;
var convertPayment = Connext.convert.Payment;
var DEPOSIT_ESTIMATED_GAS = Big('700000'); // 700k gas

var HUB_EXCHANGE_CEILING = _ethers.ethers.constants.WeiPerEther.mul(Big(69)); // 69 TST


var CHANNEL_DEPOSIT_MAX = _ethers.ethers.constants.WeiPerEther.mul(Big(30)); // 30 TST


var constructorError = 'Card constructor takes one object as an argument with "hubUrl", "rpcProvider", and "onStateUpdate" as properties.';
var CollateralStates = {
  PaymentMade: 0,
  Timeout: 1,
  Success: 2
};

var validateAmount = function validateAmount(ogValue) {
  var value = ogValue.toString();
  var decimal = value.startsWith('.') ? value.substr(1) : value.split('.')[1]; // if there are more than 18 digits after the decimal, do not count them

  if (decimal && decimal.length > 18) {
    throw new Error('Value is too precise. Please keep it to maximum 18 decimal points'); // balanceError = `Value too precise! Using ${tokenVal}`
  } else return _web.default.utils.toWei("".concat(value), 'ether');
}; // define class


var Card =
/*#__PURE__*/
function () {
  function Card(opts) {
    (0, _classCallCheck2.default)(this, Card);
    if ((0, _typeof2.default)(opts) !== 'object') throw new Error(constructorError); // passed in options

    this.onStateUpdate = opts.onStateUpdate ? opts.onStateUpdate : function () {};
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

  (0, _createClass2.default)(Card, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(existingMnemonic) {
        var mnemonic;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // check if mnemonic is passed or exists in LS
                mnemonic = existingMnemonic || localStorage.getItem('mnemonic') || _ethers.ethers.Wallet.createRandom().mnemonic;
                if (!localStorage.getItem('mnemonic')) localStorage.setItem('mnemonic', mnemonic); // set up web3 and connext

                _context.next = 4;
                return this.setWeb3();

              case 4:
                _context.next = 6;
                return this.setConnext(mnemonic);

              case 6:
                _context.next = 8;
                return this.setTokenContract();

              case 8:
                _context.next = 10;
                return this.pollConnextState();

              case 10:
                _context.next = 12;
                return this.setBrowserWalletMinimumBalance();

              case 12:
                _context.next = 14;
                return this.poller();

              case 14:
                return _context.abrupt("return", this.address);

              case 15:
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
      _regenerator.default.mark(function _callee2() {
        var provider;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                provider = new _ethers.ethers.providers.JsonRpcProvider(this.rpcProvider);
                this.web3 = provider;

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function setWeb3() {
        return _setWeb.apply(this, arguments);
      }

      return setWeb3;
    }()
  }, {
    key: "setConnext",
    value: function () {
      var _setConnext = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(mnemonic) {
        var options;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = {
                  hubUrl: this.hubUrl,
                  mnemonic: mnemonic,
                  ethUrl: this.rpcProvider,
                  // Note: can use hubs eth provider by omitting this as well
                  logLevel: 5 // user: this.address,
                  // origin: this.domain,

                }; // *** Instantiate the connext client ***
                // *** Create Address ***

                _context3.next = 3;
                return Connext.createClient(options);

              case 3:
                this.connext = _context3.sent;
                this.tokenAddress = this.connext.opts.tokenAddress;
                _context3.next = 7;
                return this.connext.wallet.getAddress();

              case 7:
                this.address = _context3.sent;

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function setConnext(_x2) {
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
                  tokenContract = new _ethers.ethers.Contract(this.tokenAddress, _humanToken.default, this.web3);
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
                  that.exchangeRate = state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.DAI : 0;
                  that.runtime = state.runtime;
                  console.log('Connext updated:', state);
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
        var web3, connextState, gasPrice, totalDepositGasWei;
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
                _context9.next = 5;
                return this.web3.getGasPrice();

              case 5:
                gasPrice = _context9.sent;
                // default connext multiple is 1.5, leave 2x for safety
                totalDepositGasWei = DEPOSIT_ESTIMATED_GAS.mul(Big(2)).mul(gasPrice);
                this.minDeposit = Connext.Currency.WEI(totalDepositGasWei, function () {
                  return getExchangeRates(connextState);
                });
                this.maxDeposit = Connext.Currency.DEI(CHANNEL_DEPOSIT_MAX, function () {
                  return getExchangeRates(connextState);
                });

              case 9:
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
    }()
  }, {
    key: "autoDeposit",
    value: function () {
      var _autoDeposit = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee10() {
        var address, tokenContract, connextState, tokenAddress, rpcProvider, web3, minDeposit, balance, gasPrice, tokenBalance, minWei, channelDeposit;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                address = this.address, tokenContract = this.tokenContract, connextState = this.connextState, tokenAddress = this.tokenAddress, rpcProvider = this.rpcProvider, web3 = this.web3, minDeposit = this.minDeposit;

                if (!(!rpcProvider || !minDeposit)) {
                  _context10.next = 3;
                  break;
                }

                return _context10.abrupt("return");

              case 3:
                _context10.next = 5;
                return web3.getBalance(address);

              case 5:
                balance = _context10.sent;
                _context10.next = 8;
                return web3.getGasPrice();

              case 8:
                gasPrice = _context10.sent.toHexString();
                tokenBalance = '0';
                _context10.prev = 10;
                _context10.next = 13;
                return tokenContract.balanceOf(address);

              case 13:
                tokenBalance = _context10.sent;
                _context10.next = 29;
                break;

              case 16:
                _context10.prev = 16;
                _context10.t0 = _context10["catch"](10);
                _context10.t1 = console;
                _context10.t2 = "Error fetching token balance, are you sure the token address (addr: ".concat(tokenAddress, ") is correct for the selected network (id: ");
                _context10.t3 = JSON;
                _context10.next = 23;
                return web3.getNetwork();

              case 23:
                _context10.t4 = _context10.sent;
                _context10.t5 = _context10.t3.stringify.call(_context10.t3, _context10.t4);
                _context10.t6 = _context10.t0.message;
                _context10.t7 = _context10.t2.concat.call(_context10.t2, _context10.t5, "))? Error: ").concat(_context10.t6);

                _context10.t1.warn.call(_context10.t1, _context10.t7);

                return _context10.abrupt("return");

              case 29:
                if (!(balance.gt(_ethers.ethers.constants.Zero) || tokenBalance.gt(_ethers.ethers.constants.Zero))) {
                  _context10.next = 43;
                  break;
                }

                minWei = minDeposit.toWEI().floor(); // don't autodeposit anything under the threshold
                // update the refunding variable before returning

                if (!balance.lt(minWei)) {
                  _context10.next = 33;
                  break;
                }

                return _context10.abrupt("return");

              case 33:
                if (connextState) {
                  _context10.next = 35;
                  break;
                }

                return _context10.abrupt("return");

              case 35:
                if (!( // something was submitted
                connextState.runtime.deposit.submitted || connextState.runtime.withdrawal.submitted || connextState.runtime.collateral.submitted)) {
                  _context10.next = 38;
                  break;
                }

                console.log("Deposit or withdrawal transaction in progress, will not auto-deposit");
                return _context10.abrupt("return");

              case 38:
                channelDeposit = {
                  amountWei: balance.sub(minWei),
                  amountToken: tokenBalance
                };

                if (!(channelDeposit.amountWei.eq(_ethers.ethers.constants.Zero) && channelDeposit.amountToken.eq(_ethers.ethers.constants.Zero))) {
                  _context10.next = 41;
                  break;
                }

                return _context10.abrupt("return");

              case 41:
                _context10.next = 43;
                return this.connext.deposit({
                  amountWei: channelDeposit.amountWei.toString(),
                  amountToken: channelDeposit.amountToken.toString()
                }, {
                  gasPrice: gasPrice
                });

              case 43:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[10, 16]]);
      }));

      function autoDeposit() {
        return _autoDeposit.apply(this, arguments);
      }

      return autoDeposit;
    }() // swapping wei for dai

  }, {
    key: "autoSwap",
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

                if (!(!connextState || hasPendingOps(channelState))) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt("return");

              case 3:
                weiBalance = Big(channelState.balanceWeiUser);
                tokenBalance = Big(channelState.balanceTokenUser);

                if (!(channelState && weiBalance.gt(Big('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING))) {
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

                if (!isNaN(value)) {
                  _context12.next = 3;
                  break;
                }

                throw new Error('Value is not a number');

              case 3:
                value = this.validateAmount(value); // generate secret, set type, and set
                // recipient to empty address

                payment = {
                  meta: {
                    purchaseId: 'ujo'
                  },
                  payments: [{
                    type: 'PT_LINK',
                    recipient: emptyAddress,
                    amountToken: value,
                    amountWei: '0',
                    meta: {
                      secret: connext.generateSecret()
                    }
                  }]
                };
                return _context12.abrupt("return", this.paymentHandler(payment));

              case 6:
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
        var payment, act;
        return _regenerator.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                if (!isNaN(value)) {
                  _context13.next = 2;
                  break;
                }

                throw new Error('Value is not a number');

              case 2:
                value = this.validateAmount(value); // generate secret, set type, and set

                payment = {
                  meta: {
                    purchaseId: 'ujo'
                  },
                  payments: [{
                    type: 'PT_OPTIMISTIC',
                    // only optimistic for now 'PT_CHANNEL',
                    recipient: recipientAddress,
                    amountToken: value,
                    amountWei: '0'
                  }]
                };
                _context13.next = 6;
                return this.paymentHandler(payment);

              case 6:
                act = _context13.sent;
                return _context13.abrupt("return", act);

              case 8:
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
      _regenerator.default.mark(function _callee14(paymentVal) {
        var connext, channelState, balanceError, addressError, paymentAmount, recipient, errorMessage, needsCollateral, collateralizationStatus;
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                connext = this.connext, channelState = this.channelState;
                // validate that the token amount is within bounds
                paymentAmount = convertPayment('bn', paymentVal.payments[0]);

                if (paymentAmount.amountToken.gt(Big(channelState.balanceTokenUser))) {
                  balanceError = 'Insufficient balance in channel';
                }

                if (paymentAmount.amountToken.isZero()) {
                  balanceError = 'Please enter a payment amount above 0';
                } // validate recipient is valid address OR the empty address
                // TODO: handle in other functions that structure payment object


                recipient = paymentVal.payments[0].recipient;

                if (!_web.default.utils.isAddress(recipient) && recipient !== emptyAddress) {
                  addressError = 'Please use a valid address';
                } // return if either errors exist


                if (!(balanceError || addressError)) {
                  _context14.next = 9;
                  break;
                }

                errorMessage = balanceError || addressError;
                throw new Error(errorMessage);

              case 9:
                _context14.next = 11;
                return connext.recipientNeedsCollateral(paymentVal.payments[0].recipient, convertPayment('str', {
                  amountWei: paymentVal.payments[0].amountWei,
                  amountToken: paymentVal.payments[0].amountToken
                }));

              case 11:
                needsCollateral = _context14.sent;

                if (!(needsCollateral && paymentVal.payments[0].type !== 'PT_LINK')) {
                  _context14.next = 30;
                  break;
                }

                _context14.next = 15;
                return this.collateralizeRecipient(paymentVal);

              case 15:
                collateralizationStatus = _context14.sent;
                _context14.t0 = collateralizationStatus;
                _context14.next = _context14.t0 === CollateralStates.PaymentMade ? 19 : _context14.t0 === CollateralStates.Timeout ? 20 : _context14.t0 === CollateralStates.Success ? 21 : 24;
                break;

              case 19:
                return _context14.abrupt("return", true);

              case 20:
                throw new Error('Collateralization of recipient timed out. Please try again.');

              case 21:
                _context14.next = 23;
                return this.sendPayment(paymentVal);

              case 23:
                return _context14.abrupt("return", _context14.sent);

              case 24:
                console.log('GOT In DEFAULT');
                _context14.next = 27;
                return this.sendPayment(paymentVal);

              case 27:
                return _context14.abrupt("return", _context14.sent);

              case 28:
                _context14.next = 33;
                break;

              case 30:
                _context14.next = 32;
                return this.sendPayment(paymentVal);

              case 32:
                return _context14.abrupt("return", _context14.sent);

              case 33:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function paymentHandler(_x6) {
        return _paymentHandler.apply(this, arguments);
      }

      return paymentHandler;
    }()
  }, {
    key: "sendPayment",
    value: function () {
      var _sendPayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee15(paymentVal) {
        var connext, paymentRes;
        return _regenerator.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                connext = this.connext;
                _context15.prev = 1;
                _context15.next = 4;
                return connext.buy(paymentVal);

              case 4:
                paymentRes = _context15.sent;

                if (!(paymentVal.payments[0].type === 'PT_LINK')) {
                  _context15.next = 7;
                  break;
                }

                return _context15.abrupt("return", paymentVal.payments[0].meta.secret);

              case 7:
                return _context15.abrupt("return", true);

              case 10:
                _context15.prev = 10;
                _context15.t0 = _context15["catch"](1);
                console.log('error with payment', _context15.t0);
                throw new Error(_context15.t0);

              case 14:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this, [[1, 10]]);
      }));

      function sendPayment(_x7) {
        return _sendPayment.apply(this, arguments);
      }

      return sendPayment;
    }()
  }, {
    key: "collateralizeRecipient",
    value: function () {
      var _collateralizeRecipient = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee17(paymentVal) {
        var connext, success, needsCollateral;
        return _regenerator.default.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                connext = this.connext; // collateralize by sending payment

                _context17.prev = 1;
                _context17.next = 4;
                return this.sendPayment(paymentVal);

              case 4:
                success = _context17.sent;

                if (!success) {
                  _context17.next = 7;
                  break;
                }

                return _context17.abrupt("return", CollateralStates.PaymentMade);

              case 7:
                _context17.next = 11;
                break;

              case 9:
                _context17.prev = 9;
                _context17.t0 = _context17["catch"](1);

              case 11:
                _context17.next = 13;
                return (0, _intervalPromise.default)(
                /*#__PURE__*/
                function () {
                  var _ref4 = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee16(iteration, stop) {
                    return _regenerator.default.wrap(function _callee16$(_context16) {
                      while (1) {
                        switch (_context16.prev = _context16.next) {
                          case 0:
                            _context16.next = 2;
                            return connext.recipientNeedsCollateral(paymentVal.payments[0].recipient, convertPayment('str', {
                              amountWei: paymentVal.payments[0].amountWei,
                              amountToken: paymentVal.payments[0].amountToken
                            }));

                          case 2:
                            needsCollateral = _context16.sent;

                            if (!needsCollateral || iteration > 20) {
                              stop();
                            }

                          case 4:
                          case "end":
                            return _context16.stop();
                        }
                      }
                    }, _callee16);
                  }));

                  return function (_x9, _x10) {
                    return _ref4.apply(this, arguments);
                  };
                }(), 5000, {
                  iterations: 20
                });

              case 13:
                if (!needsCollateral) {
                  _context17.next = 15;
                  break;
                }

                return _context17.abrupt("return", CollateralStates.Timeout);

              case 15:
                return _context17.abrupt("return", CollateralStates.Success);

              case 16:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this, [[1, 9]]);
      }));

      function collateralizeRecipient(_x8) {
        return _collateralizeRecipient.apply(this, arguments);
      }

      return collateralizeRecipient;
    }()
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

      function redeemPayment(_x11) {
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
      _regenerator.default.mark(function _callee19(originalRecipient) {
        var withdrawEth,
            connext,
            recipient,
            withdrawalVal,
            _args19 = arguments;
        return _regenerator.default.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                withdrawEth = _args19.length > 1 && _args19[1] !== undefined ? _args19[1] : true;
                // TODO: add value to withdraw and check the input balance is under channel balance
                connext = this.connext;
                recipient = originalRecipient.toLowerCase(); // check for valid address

                if (_ethers.ethers.utils.isHexString(recipient)) {
                  _context19.next = 5;
                  break;
                }

                throw new Error("Invalid recipient. Invalid hex string: ".concat(originalRecipient));

              case 5:
                if (!(_ethers.ethers.utils.arrayify(recipient).length !== 20)) {
                  _context19.next = 7;
                  break;
                }

                throw new Error("Invalid recipient. Invalid length: ".concat(originalRecipient));

              case 7:
                withdrawalVal = this.createWithdrawValues(recipient, withdrawEth);
                console.log("Withdrawing: ".concat(JSON.stringify(withdrawalVal, null, 2)));
                _context19.next = 11;
                return connext.withdraw(withdrawalVal);

              case 11:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));

      function withdrawalAllFunds(_x12) {
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
          connextState = this.connextState,
          exchangeRate = this.exchangeRate;
      var withdrawalVal = {
        recipient: recipient,
        exchangeRate: exchangeRate,
        tokensToSell: '0',
        withdrawalWeiUser: '0',
        weiToSell: '0',
        withdrawalTokenUser: '0'
      };

      if (withdrawEth && channelState && connextState) {
        var custodialBalance = connextState.persistent.custodialBalance;
        var amountToken = Big(channelState.balanceTokenUser).add(custodialBalance.balanceToken);
        var amountWei = Big(channelState.balanceWeiUser).add(custodialBalance.balanceWei); // withdraw all channel balance in eth

        withdrawalVal = (0, _objectSpread2.default)({}, withdrawalVal, {
          tokensToSell: amountToken.toString(),
          withdrawalWeiUser: amountWei.toString(),
          weiToSell: '0',
          withdrawalTokenUser: '0'
        });
      } else {
        throw new Error('Not permitting withdrawal of tokens at this time'); // // handle withdrawing all channel balance in dai
        // withdrawalVal = {
        //   ...withdrawalVal,
        //   tokensToSell: '0',
        //   withdrawalWeiUser: '0',
        //   weiToSell: channelState.balanceWeiUser,
        //   withdrawalTokenUser: channelState.balanceTokenUser,
        // };
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
  }]);
  return Card;
}();

var _default = Card;
exports.default = _default;
//# sourceMappingURL=index.js.map