"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _bip = _interopRequireDefault(require("bip39"));

var _hdkey = _interopRequireDefault(require("ethereumjs-wallet/hdkey"));

var createWallet =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(existingMnemonic) {
    var mnemonic, wallet;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            mnemonic = existingMnemonic ? existingMnemonic : _bip.default.generateMnemonic();
            console.log("Creating Wallet");
            console.log("mnemonic", mnemonic); // let mnemonic = existingMnenomic ? existingMnenomic : bip39.generateMnemonic();

            _context.next = 5;
            return _hdkey.default.fromMasterSeed(mnemonic).getWallet();

          case 5:
            wallet = _context.sent;
            // const wallet = await web3.eth.accounts.create()
            localStorage.setItem("delegateSigner", wallet.getAddressString());
            localStorage.setItem("mnemonic", mnemonic);
            localStorage.setItem("privateKey", wallet.getPrivateKeyString());
            return _context.abrupt("return", wallet);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function createWallet(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _default = createWallet;
exports.default = _default;
//# sourceMappingURL=walletGen.js.map