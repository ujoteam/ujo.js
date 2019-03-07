"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWallet = createWallet;
exports.createWalletFromMnemonic = createWalletFromMnemonic;
exports.getStore = getStore;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _App = require("./App");

// import * as ethers from "ethers";
var bip39 = require('bip39');

var hdkey = require('ethereumjs-wallet/hdkey');

function createWallet(_x) {
  return _createWallet.apply(this, arguments);
} // export async function findOrCreateWallet(web3) {
//   //let privateKey = localStorage.getItem("privateKey");
//   let mnemonic = localStorage.getItem("mnemonic")
//   let wallet;
//   if (mnemonic) {
//     wallet = await hdkey.fromMasterSeed(mnemonic).getWallet()
//     console.log("found existing wallet:", wallet.getAddressString());
//   } else {
//     wallet = await createWallet(web3);
//   }
//   store.dispatch({
//     type: "SET_WALLET",
//     text: wallet //Buffer.from(String(privKey.private),'hex')
//   });
//   return wallet;
// }


function _createWallet() {
  _createWallet = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(web3) {
    var mnemonic, wallet;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log('Creating new random wallet');
            mnemonic = bip39.generateMnemonic();
            _context.next = 4;
            return hdkey.fromMasterSeed(mnemonic).getWallet();

          case 4:
            wallet = _context.sent;
            // const wallet = await web3.eth.accounts.create()
            localStorage.setItem('delegateSigner', wallet.getAddressString());
            localStorage.setItem('mnemonic', mnemonic);
            localStorage.setItem('privateKey', wallet.getPrivateKeyString());
            return _context.abrupt("return", wallet);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createWallet.apply(this, arguments);
}

function createWalletFromMnemonic(_x2) {
  return _createWalletFromMnemonic.apply(this, arguments);
}

function _createWalletFromMnemonic() {
  _createWalletFromMnemonic = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(mnemonic) {
    var wallet;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return hdkey.fromMasterSeed(mnemonic).getWallet();

          case 3:
            wallet = _context2.sent;
            console.log("Found wallet from mnemonic");
            localStorage.setItem('delegateSigner', wallet.getAddressString());
            localStorage.setItem('mnemonic', mnemonic);
            localStorage.setItem('privateKey', wallet.getPrivateKeyString());
            return _context2.abrupt("return", wallet);

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](0);
            console.log("error in WalletGen");
            console.log(_context2.t0);

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 11]]);
  }));
  return _createWalletFromMnemonic.apply(this, arguments);
}

function getStore() {
  if (_App.store) {
    return _App.store;
  } else {
    console.log('no store found');
  }
}
//# sourceMappingURL=walletGen.js.map