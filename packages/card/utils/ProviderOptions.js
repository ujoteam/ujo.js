import ethUtil from 'ethereumjs-util';
import sigUtil from 'eth-sig-util';
import Tx from 'ethereumjs-tx';
import { Buffer } from 'buffer';
// require('dotenv').config()

// TODO: fix hardcoded hub & rpc urls
const rpcUrl = 'http://localhost:8545';
const hubUrl = 'http://localhost:8080';
export const DEFAULT_RPC_URL = rpcUrl;
// const DEFAULT_NETWORK = 'ropsten'
// export const DEFAULT_RPC_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_RINKEBY_RPC_URL : process.env.REACT_APP_LOCAL_RPC_URL

if (!DEFAULT_RPC_URL)
  throw new Error('Missing default ethereum provider url')

// export type ApproveTransactionCallback = (error: string | null, isApproved?: boolean) => void
// export type ApproveSignCallback = (error: string | null, rawMsgSig?: string) => void

export default class ProviderOptions {

  constructor(wallet, rpcUrl) {
    this.wallet = wallet;
    this.rpcUrl = rpcUrl || DEFAULT_RPC_URL;
  }

  getAccounts(callback) {
    callback(null, this.address ? [this.address] : [])
  }

  approveTransactionAlways(txParams, callback) {
    callback(null, true)
  }

  signTransaction(rawTx, callback) {
    const key = this.wallet.getPrivateKey()

    if (!key) {
      return callback('Wallet is locked.')
    }

    let tx = new Tx(rawTx)
    tx.sign(key)
    let txHex = '0x' + Buffer.from(tx.serialize()).toString('hex')
    callback(null, txHex)
  }

  signMessageAlways(messageParams, callback) {
    const key = this.wallet.getPrivateKey()

    if (!key) {
      return callback('Wallet is locked.')
    }

    const msg = messageParams.data

    const hashBuf = new Buffer(msg.split('x')[1], 'hex')
    const prefix = new Buffer('\x19Ethereum Signed Message:\n')
    const buf = Buffer.concat([
      prefix,
      new Buffer(String(hashBuf.length)),
      hashBuf
    ])

    const data = ethUtil.sha3(buf)
    const msgSig = ethUtil.ecsign(data, key)
    const rawMsgSig = ethUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    callback(null, rawMsgSig)
  }

  approving() {
    return {
      static: {
        eth_syncing: false,
        web3_clientVersion: `LiteratePayments/v${1.0}`
      },
      rpcUrl: this.rpcUrl,
      getAccounts: this.getAccounts,
      approveTransaction: this.approveTransactionAlways,
      signTransaction: this.signTransaction,
      signMessage: this.signMessageAlways,
      signPersonalMessage: this.signMessageAlways,
    }
  }

}
