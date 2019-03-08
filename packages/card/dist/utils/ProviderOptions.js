"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DEFAULT_RPC_URL = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _ethereumjsUtil = _interopRequireDefault(require("ethereumjs-util"));

var _ethSigUtil = _interopRequireDefault(require("eth-sig-util"));

var _ethereumjsTx = _interopRequireDefault(require("ethereumjs-tx"));

var _buffer = require("buffer");

// require('dotenv').config()
// TODO: fix hardcoded hub & rpc urls
var rpcUrl = 'http://localhost:8545';
var hubUrl = 'http://localhost:8080';
var DEFAULT_RPC_URL = rpcUrl; // const DEFAULT_NETWORK = 'ropsten'
// export const DEFAULT_RPC_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_RINKEBY_RPC_URL : process.env.REACT_APP_LOCAL_RPC_URL

exports.DEFAULT_RPC_URL = DEFAULT_RPC_URL;
if (!DEFAULT_RPC_URL) throw new Error('Missing default ethereum provider url'); // export type ApproveTransactionCallback = (error: string | null, isApproved?: boolean) => void
// export type ApproveSignCallback = (error: string | null, rawMsgSig?: string) => void

var ProviderOptions =
/*#__PURE__*/
function () {
  function ProviderOptions(wallet, rpcUrl) {
    (0, _classCallCheck2.default)(this, ProviderOptions);
    this.wallet = wallet;
    this.rpcUrl = rpcUrl || DEFAULT_RPC_URL;
  }

  (0, _createClass2.default)(ProviderOptions, [{
    key: "getAccounts",
    value: function getAccounts(callback) {
      var address = this.wallet.getAddressString();
      console.log('address', address);
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

      if (!key) {
        return callback('Wallet is locked.');
      }

      var tx = new _ethereumjsTx.default(rawTx);
      tx.sign(key);

      var txHex = '0x' + _buffer.Buffer.from(tx.serialize()).toString('hex');

      callback(null, txHex);
    }
  }, {
    key: "signMessageAlways",
    value: function signMessageAlways(messageParams, callback) {
      var key = this.wallet.getPrivateKey();

      if (!key) {
        return callback('Wallet is locked.');
      }

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