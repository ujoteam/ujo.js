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

var _bn = _interopRequireDefault(require("bn.js"));

var _ProviderOptions = _interopRequireDefault(require("./utils/ProviderOptions"));

var _clientProvider = _interopRequireDefault(require("./utils/web3/clientProvider"));

var _getDollarSubstring = require("./utils/getDollarSubstring");

var _walletGen = _interopRequireDefault(require("./walletGen"));

var _humanToken = _interopRequireDefault(require("./abi/humanToken.json"));

// set constants
var HASH_PREAMBLE = 'SpankWallet authentication message:';

var DEPOSIT_MINIMUM_WEI = _ethers.ethers.utils.parseEther('0.03'); // 30 FIN


var HUB_EXCHANGE_CEILING = _ethers.ethers.utils.parseEther('69'); // 69 TST


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
                return this.setWeb3(delegateSigner, rpcProvider);

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
                return this.poller();

              case 24:
                return _context.abrupt("return", address);

              case 25:
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
      _regenerator.default.mark(function _callee2(address, rpcUrl) {
        var providerOpts, provider, customWeb3;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                providerOpts = new _ProviderOptions.default(address, rpcUrl).approving();
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

      function setWeb3(_x, _x2) {
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

      function setConnext(_x3) {
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
                    var balance = state.persistent.channel.balanceTokenUser;
                    var substr = balance ? (0, _getDollarSubstring.getDollarSubstring)(balance) : ['0', '00'];
                    var cents = substr[1].substring(0, 2);
                    if (cents.length === 1) cents = "".concat(cents, "0"); // call cb passed into creator fn with updated amount in card

                    that.stateUpdateCallback("$".concat(substr[0], ".").concat(cents));
                  }

                  that.channelState = state.persistent.channel;
                  that.connextState = state;
                  that.exchangeRate = state.runtime.exchangeRate ? state.runtime.exchangeRate.rates.USD : 0;
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
      _regenerator.default.mark(function _callee7() {
        var _this = this;

        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.autoDeposit();

              case 2:
                _context7.next = 4;
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
                          _context6.next = 4;
                          return _this.autoSwap();

                        case 4:
                        case "end":
                          return _context6.stop();
                      }
                    }
                  }, _callee6);
                })), 10000);

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
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
      _regenerator.default.mark(function _callee8() {
        var connextState, tokenAddress, balance, tokenBalance, actualDeposit, depositRes;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                connextState = this.connextState, tokenAddress = this.tokenAddress;
                _context8.next = 3;
                return this.web3.eth.getBalance(this.address);

              case 3:
                balance = _context8.sent;
                tokenBalance = '0';
                _context8.prev = 5;
                _context8.next = 8;
                return this.tokenContract.methods.balanceOf(this.address).call();

              case 8:
                tokenBalance = _context8.sent;
                _context8.next = 21;
                break;

              case 11:
                _context8.prev = 11;
                _context8.t0 = _context8["catch"](5);
                _context8.t1 = console;
                _context8.t2 = "Error fetching token balance, are you sure the token address (addr: ".concat(tokenAddress, ") is correct for the selected network (id: ");
                _context8.next = 17;
                return this.web3.eth.net.getId();

              case 17:
                _context8.t3 = _context8.sent;
                _context8.t4 = _context8.t0.message;
                _context8.t5 = _context8.t2.concat.call(_context8.t2, _context8.t3, "))? Error: ").concat(_context8.t4);

                _context8.t1.warn.call(_context8.t1, _context8.t5);

              case 21:
                if (!(balance !== '0' || tokenBalance !== '0')) {
                  _context8.next = 32;
                  break;
                }

                if (!_ethers.ethers.utils.bigNumberify(balance).lte(DEPOSIT_MINIMUM_WEI)) {
                  _context8.next = 24;
                  break;
                }

                return _context8.abrupt("return");

              case 24:
                if (!(!connextState || !connextState.runtime.canDeposit)) {
                  _context8.next = 26;
                  break;
                }

                return _context8.abrupt("return");

              case 26:
                actualDeposit = {
                  amountWei: _ethers.ethers.utils.bigNumberify(balance).sub(DEPOSIT_MINIMUM_WEI).toString(),
                  amountToken: tokenBalance
                };

                if (!(actualDeposit.amountWei === '0' && actualDeposit.amountToken === '0')) {
                  _context8.next = 29;
                  break;
                }

                return _context8.abrupt("return");

              case 29:
                _context8.next = 31;
                return this.connext.deposit(actualDeposit);

              case 31:
                depositRes = _context8.sent;

              case 32:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[5, 11]]);
      }));

      function autoDeposit() {
        return _autoDeposit.apply(this, arguments);
      }

      return autoDeposit;
    }() // not totally sure what happens here

  }, {
    key: "autoSwap",
    value: function () {
      var _autoSwap = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee9() {
        var channelState, connextState, weiBalance, tokenBalance;
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                channelState = this.channelState, connextState = this.connextState; // const { channelState, connextState } = this.state;

                if (!(!connextState || !connextState.runtime.canExchange)) {
                  _context9.next = 3;
                  break;
                }

                return _context9.abrupt("return");

              case 3:
                weiBalance = _ethers.ethers.utils.bigNumberify(channelState.balanceWeiUser);
                tokenBalance = _ethers.ethers.utils.bigNumberify(channelState.balanceTokenUser);

                if (!(channelState && weiBalance.gt(_ethers.ethers.utils.bigNumberify('0')) && tokenBalance.lte(HUB_EXCHANGE_CEILING))) {
                  _context9.next = 9;
                  break;
                }

                console.log("Exchanging ".concat(channelState.balanceWeiUser, " wei")); // eslint-disable-line

                _context9.next = 9;
                return this.connext.exchange(channelState.balanceWeiUser, 'wei');

              case 9:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
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
      _regenerator.default.mark(function _callee10() {
        var web3, challengeRes, data, hash, signature, authRes, token, res;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                web3 = this.web3;
                _context10.next = 3;
                return _axios.default.post("".concat(this.hubUrl, "/auth/challenge"), {}, opts);

              case 3:
                challengeRes = _context10.sent;
                data = "".concat(HASH_PREAMBLE, " ").concat(web3.utils.sha3(challengeRes.data.nonce), " ").concat(web3.utils.sha3('localhost'));
                hash = web3.utils.sha3(data);
                _context10.next = 8;
                return web3.eth.personal.sign(hash, this.address, null);

              case 8:
                signature = _context10.sent;
                _context10.prev = 9;
                _context10.next = 12;
                return _axios.default.post("".concat(this.hubUrl, "/auth/response"), {
                  nonce: challengeRes.data.nonce,
                  address: this.address,
                  origin: 'localhost',
                  signature: signature
                }, opts);

              case 12:
                authRes = _context10.sent;
                token = authRes.data.token;
                document.cookie = "hub.sid=".concat(token); // console.log(`hub authentication cookie set: ${token}`);

                _context10.next = 17;
                return _axios.default.get("".concat(this.hubUrl, "/auth/status"), opts);

              case 17:
                res = _context10.sent;
                _context10.next = 23;
                break;

              case 20:
                _context10.prev = 20;
                _context10.t0 = _context10["catch"](9);
                console.log(_context10.t0);

              case 23:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[9, 20]]);
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
      _regenerator.default.mark(function _callee11(value) {
        var connext, payment;
        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                connext = this.connext; // const { paymentVal } = this.state;
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
                }; // refactored to avoid race conditions around
                // setting state

                return _context11.abrupt("return", this.paymentHandler(payment));

              case 3:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function generateRedeemableLink(_x4) {
        return _generateRedeemableLink.apply(this, arguments);
      }

      return generateRedeemableLink;
    }()
  }, {
    key: "generatePayment",
    value: function () {
      var _generatePayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee12(value, recipientAddress) {
        var connext, payment;
        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                connext = this.connext; // const { paymentVal } = this.state;
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
                }; // refactored to avoid race conditions around
                // setting state

                _context12.next = 4;
                return this.paymentHandler(payment);

              case 4:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function generatePayment(_x5, _x6) {
        return _generatePayment.apply(this, arguments);
      }

      return generatePayment;
    }()
  }, {
    key: "paymentHandler",
    value: function () {
      var _paymentHandler = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee13(payment) {
        var connext, web3, channelState, balanceError, addressError, paymentAmount, recipient, paymentRes;
        return _regenerator.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                connext = this.connext, web3 = this.web3, channelState = this.channelState; // const { connext, web3, channelState } = this.props;

                console.log("Submitting payment: ".concat(JSON.stringify(payment, null, 2)));
                // validate that the token amount is within bounds
                paymentAmount = (0, _types.convertPayment)('bn', payment.payments[0].amount);

                if (paymentAmount.amountToken.gt(new _bn.default(channelState.balanceTokenUser))) {
                  console.log('Insufficient balance in channel'); // balanceError = 'Insufficient balance in channel';
                }

                if (paymentAmount.amountToken.isZero()) {
                  console.log('Please enter a payment amount above 0'); // balanceError = 'Please enter a payment amount above 0';
                } // validate recipient is valid address OR the empty address
                // TODO: handle in other functions that structure payment object


                recipient = payment.payments[0].recipient;

                if (!web3.utils.isAddress(recipient) && recipient !== _Utils.emptyAddress) {
                  addressError = 'Please choose a valid address';
                } // return if either errors exist


                if (!(balanceError || addressError)) {
                  _context13.next = 9;
                  break;
                }

                return _context13.abrupt("return", false);

              case 9:
                _context13.prev = 9;
                _context13.next = 12;
                return connext.buy(payment);

              case 12:
                paymentRes = _context13.sent;
                console.log("Payment result: ".concat(JSON.stringify(paymentRes, null, 2)));

                if (!(payment.payments[0].type === 'PT_LINK')) {
                  _context13.next = 16;
                  break;
                }

                return _context13.abrupt("return", payment.payments[0].secret);

              case 16:
                return _context13.abrupt("return", true);

              case 19:
                _context13.prev = 19;
                _context13.t0 = _context13["catch"](9);

              case 21:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this, [[9, 19]]);
      }));

      function paymentHandler(_x7) {
        return _paymentHandler.apply(this, arguments);
      }

      return paymentHandler;
    }()
  }, {
    key: "redeemPayment",
    value: function () {
      var _redeemPayment = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee14(secret) {
        var connext, channelState, connextState, updated;
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                // const { isConfirm, purchaseId, retryCount } = this.state;
                connext = this.connext, channelState = this.channelState, connextState = this.connextState;

                if (!(!connext || !channelState || !connextState)) {
                  _context14.next = 4;
                  break;
                }

                console.log('Connext or channel object not detected');
                return _context14.abrupt("return");

              case 4:
                if (secret) {
                  _context14.next = 7;
                  break;
                }

                console.log('No secret detected, cannot redeem payment.');
                return _context14.abrupt("return");

              case 7:
                _context14.prev = 7;
                _context14.next = 10;
                return connext.redeem(secret);

              case 10:
                updated = _context14.sent;
                console.log('redeemed successs?', updated); // if (!purchaseId && retryCount < 5) {
                //   console.log('Redeeming linked payment with secret', secret)
                //   if (updated.purchaseId == null) {
                //     this.setState({ retryCount: retryCount + 1})
                //   }
                //   this.setState({ purchaseId: updated.purchaseId, amount: updated.amount, showReceipt: true });
                // }
                // if (retryCount >= 5) {
                //   this.setState({ purchaseId: 'failed', sendError: true, showReceipt: true });
                // }

                _context14.next = 16;
                break;

              case 14:
                _context14.prev = 14;
                _context14.t0 = _context14["catch"](7);

              case 16:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this, [[7, 14]]);
      }));

      function redeemPayment(_x8) {
        return _redeemPayment.apply(this, arguments);
      }

      return redeemPayment;
    }()
  }]);
  return Card;
}();

var _default = Card;
exports.default = _default;
//# sourceMappingURL=index.js.map