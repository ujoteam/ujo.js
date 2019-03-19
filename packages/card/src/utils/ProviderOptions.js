import ethUtil from 'ethereumjs-util';
import sigUtil from 'eth-sig-util';
import Tx from 'ethereumjs-tx';
import { Buffer } from 'buffer';
// require('dotenv').config()

export default class ProviderOptions {

  constructor(wallet, rpcUrl, hubUrl) {
    this.wallet = wallet;
    this.rpcUrl = rpcUrl;
    this.hubUrl = hubUrl;
  }

  getAccounts(callback) {
    const address = this.wallet.getAddressString();
    callback(null, address ? [address] : []);
  }

  approveTransactionAlways(txParams, callback) {
    callback(null, true)
  }

  signTransaction(rawTx, callback) {
    const key = this.wallet.getPrivateKey();

    if (!key) return callback('Wallet is locked.');

    const tx = new Tx(rawTx);
    tx.sign(key);
    const txHex = `0x${Buffer.from(tx.serialize()).toString('hex')}`;
    callback(null, txHex);
  }

  signMessageAlways(messageParams, callback) {
    const key = this.wallet.getPrivateKey();

    if (!key) return callback('Wallet is locked.');

    const msg = messageParams.data;

    const hashBuf = Buffer.from(msg.split('x')[1], 'hex');
    const prefix = Buffer.from('\x19Ethereum Signed Message:\n');
    const buf = Buffer.concat([prefix, Buffer.from(String(hashBuf.length)), hashBuf]);

    const data = ethUtil.sha3(buf);
    const msgSig = ethUtil.ecsign(data, key);
    const rawMsgSig = ethUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s));
    callback(null, rawMsgSig);
  }

  approving() {
    return {
      static: {
        eth_syncing: false,
        web3_clientVersion: `LiteratePayments/v${1.0}`,
      },
      rpcUrl: this.rpcUrl,
      getAccounts: this.getAccounts.bind(this),
      approveTransaction: this.approveTransactionAlways.bind(this),
      signTransaction: this.signTransaction.bind(this),
      signMessage: this.signMessageAlways.bind(this),
      signPersonalMessage: this.signMessageAlways.bind(this),
    }
  }

}
