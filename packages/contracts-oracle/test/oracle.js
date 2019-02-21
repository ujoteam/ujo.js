// const { assertRevert } = require('./helpers/assertRevert');

// const delay = duration => new Promise(resolve => setTimeout(resolve, duration));
const TestLighthouse = artifacts.require('./TestLighthouse.sol');
const Oracle = artifacts.require('./USDETHOracle.sol');

/* eslint-disable arrow-parens */
contract('USDETHOracle', accounts => {
  it('should fetch the price from the lighthouse', async () => {
    const l = await TestLighthouse.new({ from: accounts[0] });
    const o = await Oracle.new(l.address, { from: accounts[0] });
    const price = await o.getUintPrice.call();
    assert.equal(price.toString(), '121');
  });
});
