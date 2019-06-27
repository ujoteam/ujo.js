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

var _bn = _interopRequireDefault(require("bn.js"));

var _getDollarSubstring = require("./utils/getDollarSubstring");

var _humanToken = _interopRequireDefault(require("./abi/humanToken.json"));

// import { CurrencyType } from 'connext/dist/state/ConnextState/CurrencyTypes';
// import CurrencyConvertable from 'connext/dist/lib/currency/CurrencyConvertable';
// import ProviderOptions from './utils/ProviderOptions';
// import clientProvider from './utils/web3/clientProvider';
// import createWallet from './walletGen';
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

var validateAmount = function validateAmount(value) {
  // if there are more than 18 digits after the decimal, do not
  // count them.
  // throw a warning in the address error
  // let balanceError = null
  var decimal = value.startsWith('.') ? value.substr(1) : value.split('.')[1]; // let tokenVal = value;

  if (decimal && decimal.length > 18) {
    // tokenVal = value.startsWith('.') ? value.substr(0, 19) : `${value.split('.')[0]}.${decimal.substr(0, 18)}`;
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
                mnemonic = existingMnemonic || localStorage.getItem('mnemonic') || _ethers.ethers.Wallet.createRandom().mnemonic; // otherwise generate wallet in create wallet
                // const delegateSigner = await createWallet(mnemonic);
                // const address = await delegateSigner.getAddressString();
                // this.address = address;
                // set up web3 and connext

                _context.next = 3;
                return this.setWeb3();

              case 3:
                _context.next = 5;
                return this.setConnext(mnemonic);

              case 5:
                _context.next = 7;
                return this.setTokenContract();

              case 7:
                _context.next = 9;
                return this.pollConnextState();

              case 9:
                _context.next = 11;
                return this.setBrowserWalletMinimumBalance();

              case 11:
                _context.next = 13;
                return this.poller();

              case 13:
                return _context.abrupt("return", this.address);

              case 14:
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
                // async setWeb3(delegateSigner) {
                provider = new _ethers.ethers.providers.JsonRpcProvider(this.rpcProvider);
                this.web3 = provider; // const providerOpts = new ProviderOptions(delegateSigner, this.rpcProvider, this.hubUrl).approving();
                // const provider = clientProvider(providerOpts);
                // const customWeb3 = new Web3(provider);
                // this.web3 = customWeb3;

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
                  ethUrl: this.web3,
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
    }() // TODO: figure out why after proposing a deposit
    // it halts awaiting a confirm

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
                return web3.eth.getBalance(address);

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

                if (!Number.isNaN(value)) {
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
                    amount: {
                      amountToken: value,
                      amountWei: '0'
                    },
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
                if (!Number.isNaN(value)) {
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
                    recipient: recipientAddress,
                    // secret: connext.generateSecret(),
                    amount: {
                      amountToken: value,
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
                return connext.recipientNeedsCollateral(payment.payments[0].recipient, convertPayment('str', payment.payments[0].amount));

              case 3:
                needsCollateral = _context14.sent;
                // validate that the token amount is within bounds
                paymentAmount = convertPayment('bn', payment.payments[0].amount);

                if (paymentAmount.amountToken.gt(new _bn.default(channelState.balanceTokenUser))) {
                  balanceError = 'Insufficient balance in channel';
                }

                if (paymentAmount.amountToken.isZero()) {
                  balanceError = 'Please enter a payment amount above 0';
                } // validate recipient is valid address OR the empty address
                // TODO: handle in other functions that structure payment object


                recipient = payment.payments[0].recipient;

                if (!web3.utils.isAddress(recipient) && recipient !== emptyAddress) {
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
                  var _ref4 = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee15(iteration, stop) {
                    return _regenerator.default.wrap(function _callee15$(_context15) {
                      while (1) {
                        switch (_context15.prev = _context15.next) {
                          case 0:
                            _context15.next = 2;
                            return connext.recipientNeedsCollateral(payment.payments[0].recipient, convertPayment('str', payment.payments[0].amount));

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
                    return _ref4.apply(this, arguments);
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
                  return connext.recipientNeedsCollateral(payment.payments[0].recipient, convertPayment('str', payment.payments[0].amount));

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
  }]);
  return Card;
}();

var _default = Card;
exports.default = _default;
//# sourceMappingURL=index.js.map