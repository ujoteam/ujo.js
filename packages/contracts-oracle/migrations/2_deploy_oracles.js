const USDETHOracle = artifacts.require('./USDETHOracle.sol');
const TestOracle = artifacts.require('./TestOracle.sol');

module.exports = (deployer, network) => {
  // rhombus lighthouse contracts
  const rinkebyAddress = '0x24051B4f96726EAaDcE6c577d8C20Ab7157FC4eB';
  const mainnetAddress = '0xBb0cAfA84fd26F81B6DdC9Eb82F6627ccb5a5514';
  if (network === 'rinkeby') {
    deployer.deploy(USDETHOracle, rinkebyAddress);
  } else if (network === 'mainnet') {
    deployer.deploy(USDETHOracle, mainnetAddress);
  } else if (network === 'development') {
    deployer.deploy(TestOracle);
  }
};
