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

var _web = _interopRequireDefault(require("web3"));

var _contractsOracle = require("../../contracts-oracle");

var _utils = require("../../utils");

var _ujoStorage = _interopRequireDefault(require("./ujoStorage"));

var oracle;

var Config =
/*#__PURE__*/
function () {
  function Config(web3Provider, dataStorageProvider) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck2.default)(this, Config);
    // TODO - add network validations (rinkeby or mainnet)
    this.web3 = new _web.default(web3Provider);
    this.storageProvider = (0, _ujoStorage.default)(dataStorageProvider);
    oracle = opts.test ? _contractsOracle.TestOracle : _contractsOracle.USDETHOracle;
  }

  (0, _createClass2.default)(Config, [{
    key: "getOracleAddress",
    value: function () {
      var _getOracleAddress = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee() {
        var _this = this;

        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  _this.web3.eth.net.getId(function (err, networkId) {
                    if (err) reject(err);else resolve((0, _utils.getContractAddress)(oracle, networkId));
                  });
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getOracleAddress() {
        return _getOracleAddress.apply(this, arguments);
      }

      return getOracleAddress;
    }()
  }, {
    key: "getExchangeRate",
    value: function () {
      var _getExchangeRate = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3() {
        var _this2 = this;

        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  _this2.web3.eth.net.getId(
                  /*#__PURE__*/
                  function () {
                    var _ref = (0, _asyncToGenerator2.default)(
                    /*#__PURE__*/
                    _regenerator.default.mark(function _callee2(err, networkId) {
                      var oracleAddress, oracleInstance, exchangeRate;
                      return _regenerator.default.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if (err) reject(err);
                              _context2.prev = 1;
                              oracleAddress = (0, _utils.getContractAddress)(oracle, networkId);
                              oracleInstance = new _this2.web3.eth.Contract(oracle.abi, oracleAddress);
                              _context2.next = 6;
                              return oracleInstance.methods.getUintPrice().call();

                            case 6:
                              exchangeRate = _context2.sent;
                              resolve(exchangeRate.toString(10));
                              _context2.next = 13;
                              break;

                            case 10:
                              _context2.prev = 10;
                              _context2.t0 = _context2["catch"](1);
                              reject(_context2.t0);

                            case 13:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2, null, [[1, 10]]);
                    }));

                    return function (_x, _x2) {
                      return _ref.apply(this, arguments);
                    };
                  }());
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function getExchangeRate() {
        return _getExchangeRate.apply(this, arguments);
      }

      return getExchangeRate;
    }() // return the accounts given by the provider

  }, {
    key: "getAccounts",
    value: function getAccounts() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.web3.eth.getAccounts(function (err, accounts) {
          if (err) reject(err);else resolve(accounts);
        });
      });
    } // returns the network id

  }, {
    key: "getNetwork",
    value: function getNetwork() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.web3.eth.net.getId(function (err, networkId) {
          if (err) reject(err);else resolve(networkId);
        });
      });
    }
  }, {
    key: "getBlockNumber",
    value: function getBlockNumber() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.web3.eth.getBlockNumber(function (err, result) {
          if (err) reject(err);
          resolve(result);
        });
      });
    }
    /**
     * Determines the ethereum block to begin event log search from
     *
     * @param {string} param - txHash of the transaction to check.
     * returns modified version of https://web3js.readthedocs.io/en/1.0/web3-eth.html#eth-gettransactionreceipt-return
     */

  }, {
    key: "getTransactionReceipt",
    value: function () {
      var _getTransactionReceipt = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4(txHash) {
        var _this6 = this;

        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  _this6.web3.eth.getTransactionReceipt(txHash, function (err, result) {
                    if (err) reject(err);
                    resolve(result);
                  });
                }));

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function getTransactionReceipt(_x3) {
        return _getTransactionReceipt.apply(this, arguments);
      }

      return getTransactionReceipt;
    }()
  }]);
  return Config;
}();

var _default = Config;
exports.default = _default;
//# sourceMappingURL=index.js.map