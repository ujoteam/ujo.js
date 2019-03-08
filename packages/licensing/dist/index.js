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

var _dist = require("../../utils/dist");

var _contractsLicensing = require("../../contracts-licensing");

var Licensor =
/*#__PURE__*/
function () {
  function Licensor() {
    (0, _classCallCheck2.default)(this, Licensor);
  }

  (0, _createClass2.default)(Licensor, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee(config) {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.web3 = config.web3;
                _context.next = 3;
                return config.getNetwork();

              case 3:
                this.networkId = _context.sent;
                this.licensingHandlerAddress = (0, _dist.getContractAddress)(_contractsLicensing.ETHUSDHandler, this.networkId);
                this.LicensingHandler = new this.web3.eth.Contract(_contractsLicensing.ETHUSDHandler.abi, this.licensingHandlerAddress);
                _context.next = 8;
                return config.getOracleAddress();

              case 8:
                this.oracleAddress = _context.sent;

              case 9:
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
    }()
  }, {
    key: "license",
    value: function () {
      var _license = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee2(cid, buyer, beneficiaries, amounts, notifiers, eth) {
        var _this = this;

        var wei, amountsInWei, gasRequired, gas;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (eth) wei = this.web3.utils.toWei(eth, 'ether'); // Convert ether amounts to wei

                amountsInWei = amounts.map(function (amount) {
                  return _this.web3.utils.toWei(amount, 'ether');
                });
                _context2.next = 4;
                return this.LicensingHandler.methods.pay(cid, this.oracleAddress, // which oracle to use for reference
                buyer, // address
                beneficiaries, // addresses
                amountsInWei, // in wei
                notifiers // contract notifiers [none in this case]
                ).estimateGas({
                  from: buyer,
                  value: wei
                });

              case 4:
                gasRequired = _context2.sent;
                gas = (0, _dist.boostGas)(gasRequired);
                return _context2.abrupt("return", this.LicensingHandler.methods.pay(cid, this.oracleAddress, buyer, beneficiaries, amountsInWei, []).send({
                  from: buyer,
                  value: wei,
                  gas: gas
                }));

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function license(_x2, _x3, _x4, _x5, _x6, _x7) {
        return _license.apply(this, arguments);
      }

      return license;
    }()
  }]);
  return Licensor;
}();

var _default = Licensor;
exports.default = _default;
//# sourceMappingURL=index.js.map