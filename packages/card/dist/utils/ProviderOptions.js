"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _ethereumjsUtil = _interopRequireDefault(require("ethereumjs-util"));

var _ethSigUtil = _interopRequireDefault(require("eth-sig-util"));

var _ethereumjsTx = _interopRequireDefault(require("ethereumjs-tx"));

var _buffer = require("buffer");

// require('dotenv').config()
var ProviderOptions =
/*#__PURE__*/
function () {
  function ProviderOptions(wallet, rpcUrl) {
    (0, _classCallCheck2.default)(this, ProviderOptions);
    this.wallet = wallet;
    this.rpcUrl = rpcUrl;
  }

  (0, _createClass2.default)(ProviderOptions, [{
    key: "getAccounts",
    value: function getAccounts(callback) {
      var address = this.wallet.getAddressString();
      callback(null, address ? [address] : []);
    }
  }, {
    key: "approveTransactionAlways",
    value: function approveTransactionAlways(txParams, callback) {
      callback(null, true);
    }
  }, {
    key: "signTransaction",
    value: function signTransaction(rawTx, callback) {
      var key = this.wallet.getPrivateKey();
      if (!key) return callback('Wallet is locked.');
      var tx = new _ethereumjsTx.default(rawTx);
      tx.sign(key);
      var txHex = "0x".concat(_buffer.Buffer.from(tx.serialize()).toString('hex'));
      callback(null, txHex);
    }
  }, {
    key: "signMessageAlways",
    value: function signMessageAlways(messageParams, callback) {
      var key = this.wallet.getPrivateKey();
      if (!key) return callback('Wallet is locked.');
      var msg = messageParams.data;

      var hashBuf = _buffer.Buffer.from(msg.split('x')[1], 'hex');

      var prefix = _buffer.Buffer.from('\x19Ethereum Signed Message:\n');

      var buf = _buffer.Buffer.concat([prefix, _buffer.Buffer.from(String(hashBuf.length)), hashBuf]);

      var data = _ethereumjsUtil.default.sha3(buf);

      var msgSig = _ethereumjsUtil.default.ecsign(data, key);

      var rawMsgSig = _ethereumjsUtil.default.bufferToHex(_ethSigUtil.default.concatSig(msgSig.v, msgSig.r, msgSig.s));

      callback(null, rawMsgSig);
    }
  }, {
    key: "approving",
    value: function approving() {
      return {
        static: {
          eth_syncing: false,
          web3_clientVersion: "LiteratePayments/v".concat(1.0)
        },
        rpcUrl: this.rpcUrl,
        getAccounts: this.getAccounts.bind(this),
        approveTransaction: this.approveTransactionAlways.bind(this),
        signTransaction: this.signTransaction.bind(this),
        signMessage: this.signMessageAlways.bind(this),
        signPersonalMessage: this.signMessageAlways.bind(this)
      };
    }
  }]);
  return ProviderOptions;
}();

exports.default = ProviderOptions;
//# sourceMappingURL=ProviderOptions.js.map