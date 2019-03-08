import Subprovider from 'web3-provider-engine/subproviders/subprovider';
import { BigNumber } from 'bignumber.js';
import requestJson from './request';

const hubUrl = process.env.REACT_APP_HUB_URL

const GWEI = new BigNumber('1e9')
const MAX_PRICE = GWEI.times(50)

// interface Transaction {
//   gasPrice: string
// }

export default class GaspriceSubprovider extends Subprovider {
  async handleRequest(payload, next, end) {
    if (payload.method !== 'gas-estimate-latest') {
      return next();
    }

    let gas = this.estimateGasPriceFromHub()

    this.estimateGasPriceFromHub()
      .catch(err => {
        console.warn('Error fetching gas price from the hub (falling back to Web3):', err);
        return null;
      })
      .then(gasPrice => {
        if (!gasPrice) return this.estimateGasPriceFromPreviousBlocks();
        return gasPrice;
      })
      .then(gasPrice => end(null, `0x${gasPrice.toString(16)}`), err => end(err))
  }

  async estimateGasPriceFromHub() {
    const res = await requestJson(`${hubUrl}/gasPrice/estimate`);
    if (res && res.gasPrice) return new BigNumber(res.gasPrice).times(GWEI);
    return null
  }

  estimateGasPriceFromPreviousBlocks() {
    return new Promise((resolve, reject) => {
      this.emitPayload({ method: 'eth_blockNumber'}, (err, res) => {
        let lastBlock = new BigNumber(res.result)
        const blockNums = []

        for (let i = 0; i < 10; i++) {
          blockNums.push(`0x${lastBlock.toString(16)}`)
          lastBlock = lastBlock.minus(1)
        }

        const gets = blockNums.map((item) => this.getBlock(item))

        Promise.all(gets)
          .then((blocks) => {
            resolve(BigNumber.min(this.meanGasPrice(blocks), MAX_PRICE))
          })
          .catch(reject)
      })
    })
  }

  getBlock(item) {
    return new Promise((resolve, reject) => this.emitPayload({ method: 'eth_getBlockByNumber', params: [ item, true ] }, (err, res) => {
      if (err) return reject(err);

      if (!res.result) return resolve([]);

      resolve(res.result.transactions)
    }));
  }

  meanGasPrice(blocks) {
    let sum = new BigNumber(0)
    let count = 0

    for (let i = 0; i < blocks.length; i++) {
      const txns = blocks[i]

      for (let j = 0; j < txns.length; j++) {
        const currPrice = new BigNumber(txns[j].gasPrice)
        sum = sum.plus(currPrice)
        count++
      }
    }

    return sum.dividedBy(count)
  }
}
