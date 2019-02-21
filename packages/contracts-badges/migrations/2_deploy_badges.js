const TestOracle = require('../../contracts-oracle/build/contracts/TestOracle.json');
const { getContractAddress } = require('../../utils/dist');

const BadgesProxy = artifacts.require('./UjoPatronageBadges.sol');
const Functions = artifacts.require('./UjoPatronageBadgesFunctions.sol');

module.exports = (deployer, network, accounts) => {
  // currently this migration script only supports ganache
  if (network === 'development') {
    deployer
      .deploy(Functions)
      .then(deployedFunctions => deployer.deploy(BadgesProxy, accounts[0], deployedFunctions.address))
      .then(deployedProxy => Functions.at(deployedProxy.address))
      .then(deployedBadgesProxy => {
        const testOracleAddress = getContractAddress(TestOracle, '1234');
        return deployedBadgesProxy.setupBadges('0x0000000000000000000000000000000000000000', testOracleAddress);
      });
  }
};
