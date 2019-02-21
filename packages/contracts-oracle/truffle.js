const HDWalletProvider = require('truffle-hdwallet-provider');
const { toWei, toHex } = require('web3-utils');

// Get our mnemonic and create an hdwallet
const mnemonic = ''; // this mnemonic for deployment is secret.

// Get the first account using the standard hd path.
const rinkebyProviderUrl = 'https://rinkeby.infura.io';
const mainnetProviderUrl = 'https://mainnet.infura.io';

module.exports = {
  compilers: {
    solc: {
      version: '0.5.0',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  networks: {
    mainnet: {
      network_id: 1,
      provider: new HDWalletProvider(mnemonic, mainnetProviderUrl, 1),
      gas: 4700000,
      gasPrice: 20000000000, // 20 gwei. Adjust before deploying/migrating.
    },
    rinkeby: {
      network_id: 4,
      provider: new HDWalletProvider(mnemonic, rinkebyProviderUrl, 1),
      gas: 4700000,
      gasPrice: 20000000000,
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555, // If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
    development: {
      host: '127.0.0.1',
      gas: 4700000,
      gasPrice: toHex(toWei('1', 'gwei')),
      network_id: 1234, // eslint-disable-line camelcase
      port: 8545,
    },
    ganachecli: {
      host: '127.0.0.1',
      gas: 4700000,
      gasPrice: toHex(toWei('1', 'gwei')),
      network_id: 1234, // eslint-disable-line camelcase
      port: 8545,
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 10,
    },
  },
};
