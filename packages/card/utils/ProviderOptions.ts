const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
import Tx from 'ethereumjs-tx';
import { Buffer } from 'buffer';
import { getStore } from "../walletGen";
import store from '../App';
require('dotenv').config()

const DEFAULT_NETWORK = 'ropsten'
export const DEFAULT_RPC_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_RINKEBY_RPC_URL : process.env.REACT_APP_LOCAL_RPC_URL

if (!DEFAULT_RPC_URL)
  throw new Error('Missing default ethereum provider url')

export type ApproveTransactionCallback = (error: string | null, isApproved?: boolean) => void
export type ApproveSignCallback = (error: string | null, rawMsgSig?: string) => void

export default class ProviderOptions {
  store: any
  rpcUrl: string | undefined

  constructor(store: any, rpcUrl?: string) {
    this.store = store
    this.rpcUrl = rpcUrl || DEFAULT_RPC_URL
  }

  getAccounts = (callback: (err: string | null, accounts?: string[]) => void) => {
    const state = this.store.getState()
    const addr = state[0] ? state[0].getAddressString() : null
    callback(null, addr ? [addr] : [])
  }

  approveTransactionAlways = (txParams: any, callback: ApproveTransactionCallback) => {
    callback(null, true)
  }

  signTransaction = (rawTx: any, callback: ApproveSignCallback) => {
    const key = this.getPrivateKey()

    if (!key) {
      return callback('Wallet is locked.')
    }

    let tx = new Tx(rawTx)
    tx.sign(key)
    let txHex = '0x' + Buffer.from(tx.serialize()).toString('hex')
    callback(null, txHex)
  }

  signMessageAlways = (messageParams: any, callback: ApproveSignCallback) => {
    const key = this.getPrivateKey()

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

  approving = () => {
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

  //likely needs updates 
  private getPrivateKey = (): Buffer | null => {
    const state = this.store.getState()
    return state[0] ? state[0].getPrivateKey() : null
  }

  private getPublicKey = (): String | null => {
    const state = this.store.getState()
    return state[0] ? state[0].getAddressString() : null
  }

}
