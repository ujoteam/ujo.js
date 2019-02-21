const ETHUSDHandler = artifacts.require('./ETHUSDHandler.sol');

module.exports = (deployer, network) => {
  console.log('avvav');
  if (network === 'development') {
    console.log('asdf');
    deployer.deploy(ETHUSDHandler);
  }

  if (network === 'rinkeby') {
    deployer.deploy(ETHUSDHandler);
  }

  if (network === 'mainnet') {
    deployer.deploy(ETHUSDHandler);
  }
};
