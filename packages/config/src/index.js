import Web3 from 'web3';

import { USDETHOracle, TestOracle } from '../../contracts-oracle';
import { getContractAddress } from '../../utils';

import ujoStorage from './ujoStorage';

let oracle;

class Config {
  constructor(web3Provider, dataStorageProvider, opts = {}) {
    // TODO - add network validations (rinkeby or mainnet)
    this.web3 = new Web3(web3Provider);
    this.storageProvider = ujoStorage(dataStorageProvider);
    oracle = opts.test ? TestOracle : USDETHOracle;
  }

  async getOracleAddress() {
    return new Promise((resolve, reject) => {
      this.web3.eth.net.getId((err, networkId) => {
        if (err) reject(err);
        else resolve(getContractAddress(oracle, networkId));
      });
    });
  }

  async getExchangeRate() {
    return new Promise((resolve, reject) => {
      this.web3.eth.net.getId(async (err, networkId) => {
        if (err) reject(err);
        try {
          const oracleAddress = getContractAddress(oracle, networkId);
          const oracleInstance = new this.web3.eth.Contract(oracle.abi, oracleAddress);
          const exchangeRate = await oracleInstance.methods.getUintPrice().call();
          resolve(exchangeRate.toString(10));
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // return the accounts given by the provider
  getAccounts() {
    return new Promise((resolve, reject) => {
      this.web3.eth.getAccounts((err, accounts) => {
        if (err) reject(err);
        else resolve(accounts);
      });
    });
  }

  // returns the network id
  getNetwork() {
    return new Promise((resolve, reject) => {
      this.web3.eth.net.getId((err, networkId) => {
        if (err) reject(err);
        else resolve(networkId);
      });
    });
  }

  getBlockNumber() {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBlockNumber((err, result) => {
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
  async getTransactionReceipt(txHash) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransactionReceipt(txHash, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
}

export default Config;
