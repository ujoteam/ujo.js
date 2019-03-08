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

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _subprovider = _interopRequireDefault(require("web3-provider-engine/subproviders/subprovider"));

var _bignumber = require("bignumber.js");

var _request = _interopRequireDefault(require("./request"));

var hubUrl = process.env.REACT_APP_HUB_URL;
var GWEI = new _bignumber.BigNumber('1e9');
var MAX_PRICE = GWEI.times(50); // interface Transaction {
//   gasPrice: string
// }

var GaspriceSubprovider =
/*#__PURE__*/
function (_Subprovider) {
  (0, _inherits2.default)(GaspriceSubprovider, _Subprovider);

  function GaspriceSubprovider() {
    (0, _classCallCheck2.default)(this, GaspriceSubprovider);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(GaspriceSubprovider).apply(this, arguments));
  }

  (0, _createClass2.default)(GaspriceSubprovider, [{
    key: "handleRequest",
    value: function () {
      var _handleRequest = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(payload, next, end) {
        var _this = this;

        var gas;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(payload.method !== 'gas-estimate-latest')) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", next());

              case 2:
                gas = this.estimateGasPriceFromHub();
                this.estimateGasPriceFromHub().catch(function (err) {
                  console.warn('Error fetching gas price from the hub (falling back to Web3):', err);
                  return null;
                }).then(function (gasPrice) {
                  if (!gasPrice) return _this.estimateGasPriceFromPreviousBlocks();
                  return gasPrice;
                }).then(function (gasPrice) {
                  return end(null, "0x".concat(gasPrice.toString(16)));
                }, function (err) {
                  return end(err);
                });

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function handleRequest(_x, _x2, _x3) {
        return _handleRequest.apply(this, arguments);
      }

      return handleRequest;
    }()
  }, {
    key: "estimateGasPriceFromHub",
    value: function () {
      var _estimateGasPriceFromHub = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2() {
        var res;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _request.default)("".concat(hubUrl, "/gasPrice/estimate"));

              case 2:
                res = _context2.sent;

                if (!(res && res.gasPrice)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return", new _bignumber.BigNumber(res.gasPrice).times(GWEI));

              case 5:
                return _context2.abrupt("return", null);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function estimateGasPriceFromHub() {
        return _estimateGasPriceFromHub.apply(this, arguments);
      }

      return estimateGasPriceFromHub;
    }()
  }, {
    key: "estimateGasPriceFromPreviousBlocks",
    value: function estimateGasPriceFromPreviousBlocks() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.emitPayload({
          method: 'eth_blockNumber'
        }, function (err, res) {
          var lastBlock = new _bignumber.BigNumber(res.result);
          var blockNums = [];

          for (var i = 0; i < 10; i++) {
            blockNums.push("0x".concat(lastBlock.toString(16)));
            lastBlock = lastBlock.minus(1);
          }

          var gets = blockNums.map(function (item) {
            return _this2.getBlock(item);
          });
          Promise.all(gets).then(function (blocks) {
            resolve(_bignumber.BigNumber.min(_this2.meanGasPrice(blocks), MAX_PRICE));
          }).catch(reject);
        });
      });
    }
  }, {
    key: "getBlock",
    value: function getBlock(item) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        return _this3.emitPayload({
          method: 'eth_getBlockByNumber',
          params: [item, true]
        }, function (err, res) {
          if (err) return reject(err);
          if (!res.result) return resolve([]);
          resolve(res.result.transactions);
        });
      });
    }
  }, {
    key: "meanGasPrice",
    value: function meanGasPrice(blocks) {
      var sum = new _bignumber.BigNumber(0);
      var count = 0;

      for (var i = 0; i < blocks.length; i++) {
        var txns = blocks[i];

        for (var j = 0; j < txns.length; j++) {
          var currPrice = new _bignumber.BigNumber(txns[j].gasPrice);
          sum = sum.plus(currPrice);
          count++;
        }
      }

      return sum.dividedBy(count);
    }
  }]);
  return GaspriceSubprovider;
}(_subprovider.default);

exports.default = GaspriceSubprovider;
//# sourceMappingURL=GaspriceSubprovider.js.map