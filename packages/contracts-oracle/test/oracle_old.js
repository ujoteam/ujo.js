/* eslint-disable */
// was for oraclize oracle
/* const { assertRevert } = require('./helpers/assertRevert');

const USDETHOracleLocalhost = artifacts.require('./USDETHOracleLocalhost.sol');

const delay = duration => new Promise(resolve => setTimeout(resolve, duration));

contract('USDETHOracleLocalhost', (accounts) => {
  it('Should insert price twice over 1 minutes and prices should not match (most of the time) for USD/ETH.', async () => {
    // interval is 10 seconds
    const oracle = await USDETHOracleLocalhost.new(accounts[0], 10, { from: accounts[0] });

    await oracle.update({ value: web3.toWei(1, 'ether'), from: accounts[0] });
    await delay(20000); // 20 seconds
    const firstPrice = await oracle.getPrice.call();
    const firstPriceUint = await oracle.getUintPrice.call();
    await delay(40000); // 20 seconds
    const secondPrice = await oracle.getPrice.call();
    const secondPriceUint = await oracle.getUintPrice.call();
    assert.notEqual(firstPrice, secondPrice);
    assert.notEqual(firstPriceUint, secondPriceUint);
  });

  it('Should allow admin and admin only to change URL', async () => {
    const oracle = await USDETHOracleLocalhost.new(accounts[0], 10, { from: accounts[0] });
    await oracle.changeURL('insertURLhere', { from: accounts[0] });
    const url = await oracle.url.call();
    assert.equal(url, 'insertURLhere');
    await assertRevert(oracle.changeURL('newURL', { from: accounts[1] }));
  });

  // updateInterval
  it('Should allow admin and admin only to change interval', async () => {
    const oracle = await USDETHOracleLocalhost.new(accounts[0], 10, { from: accounts[0] });
    await oracle.updateInterval(20, { from: accounts[0] });
    assert.equal(await oracle.intervalInSeconds.call(), 20);
    await assertRevert(oracle.updateInterval(30, { from: accounts[1] }));
  });

  // lockOracle
  it('Should allow admin and admin only to lock oracle', async () => {
    const oracle = await USDETHOracleLocalhost.new(accounts[0], 10, { from: accounts[0] });
    await oracle.lockOracle({ from: accounts[0] });
    assert.equal(await oracle.lock.call(), true);
    await assertRevert(oracle.lockOracle({ from: accounts[1] }));
  });

  it('Should allow admin and admin only to change admin', async () => {
    const oracle = await USDETHOracleLocalhost.new(accounts[0], 10, { from: accounts[0] });
    await oracle.changeAdmin(accounts[1], { from: accounts[0] });
    assert.equal(await oracle.admin.call(), accounts[1]);
    await assertRevert(oracle.changeAdmin(accounts[2], { from: accounts[0] }));
  });
}); */
