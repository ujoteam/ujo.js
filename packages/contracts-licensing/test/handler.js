const { assertRevert } = require('./helpers/assertRevert');

const Handler = artifacts.require('./ETHUSDHandler.sol');
const TestNotification = artifacts.require('./TestNotification.sol');
const TestOracle = artifacts.require('./TestOracle.sol');

const BigNumber = require('bignumber.js');

/* function asyncTimeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} */

/*
function pay(string _cid,
address _oracle,
address _buyer, // this is for the case that someone else pays on your your behalf
address[] _beneficiaries,
uint256[] _amounts,
address[] _notifiers,
bytes _data)
*/

contract('EthUSDHandler', accounts => {
  let oracle;
  let handler;
  let testNotification;

  beforeEach(async () => {
    oracle = await TestOracle.new();
    handler = await Handler.new();
    testNotification = await TestNotification.new();
  });

  it('should transfer money to one beneficiary (buyer == msg.sender)', async () => {
    const beneficiarybalance = await web3.eth.getBalance(accounts[0]);
    const twoEther = web3.utils.toBN(web3.utils.toWei('2', 'ether'));

    await handler.pay(
      'cid',
      oracle.address, // which oracle to use for reference
      accounts[3], // buyer
      [accounts[0]], // beneficiaries
      [twoEther], // amounts
      [], // notifiers
      { from: accounts[3], value: web3.utils.toWei('2', 'ether') },
    );
    const postBeneficiarybalance = web3.utils.toBN(beneficiarybalance).add(twoEther);
    const currentBalance = await web3.eth.getBalance(accounts[0]);
    assert.equal(currentBalance.toString(), postBeneficiarybalance.toString());
  });

  it('should transfer money to one beneficiary (buyer == msg.sender & test notification)', async () => {
    const beneficiarybalance = await web3.eth.getBalance(accounts[0]);
    const twoEther = web3.utils.toBN(web3.utils.toWei('2', 'ether'));

    await handler.pay(
      'cid',
      oracle.address, // which oracle to use for reference
      accounts[3], // buyer
      [accounts[0]], // beneficiaries
      [twoEther], // amounts
      [testNotification.address], // notifiers
      { from: accounts[3], value: web3.utils.toWei('2', 'ether') },
    );

    const postBeneficiarybalance = web3.utils.toBN(beneficiarybalance).add(twoEther);
    const currentBalance = await web3.eth.getBalance(accounts[0]);
    assert.equal(currentBalance.toString(), postBeneficiarybalance.toString());

    const cid = await testNotification.getCid.call(0);
    const beneficiaries = await testNotification.getBeneficiaries.call(0);
    const amounts = await testNotification.getAmounts.call(0);
    const oracleAddress = await testNotification.getOracle.call(0);

    assert.equal(cid, 'cid');
    assert.equal(oracleAddress, oracle.address);
    assert.sameDeepMembers(beneficiaries, [accounts[0]]);

    // have to unpack this since sameDeepMembers don't work on big numbers
    const expectedAmounts = [new BigNumber(twoEther)];
    for (let i = 0; i < amounts.length; i += 1) {
      assert.strictEqual(amounts[i].toString(), expectedAmounts[i].toString());
    }
  });

  // transfer to one beneficiary with mismatch of amounts to msg.value (should fail)
  it('transfer to one beneficiary with mismatch of amounts to msg', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');

    await assertRevert(
      handler.pay(
        'cid',
        oracle.address, // which oracle to use for reference
        accounts[3], // buyer
        [accounts[0]], // beneficiaries
        [oneEther], // amounts [mismatch of fund amounts]
        [], // notifiers
        { from: accounts[3], value: web3.utils.toWei('2', 'ether') },
      ),
    );
  });

  // transfer to one beneficiary with mistmatch of amount length (should fail)
  it('transfer to one beneficiary with mismatch of amount length (should fail)', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');

    await assertRevert(
      handler.pay(
        'cid',
        oracle.address, // which oracle to use for reference
        accounts[3], // buyer
        [accounts[0]], // beneficiaries
        [oneEther, oneEther], // amounts [mismatch of amount length
        [], // notifiers
        { from: accounts[3], value: web3.utils.toWei('1', 'ether') },
      ),
    );
  });

  // transfer to one beneficiary with incorrect oracle (should fail)
  it('transfer to one beneficiary with incorrect oracle (should fail)', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');

    await assertRevert(
      handler.pay(
        'cid',
        testNotification.address, // [purposefully incorrect oracle]
        accounts[3], // buyer
        [accounts[0]], // beneficiaries
        [oneEther], // amounts
        [], // notifiers
        { from: accounts[3], value: web3.utils.toWei('1', 'ether') },
      ),
    );
  });

  // transfer to no beneficiaries with zero length arrays
  it('transfer to no beneficiaries with zero length arrays', async () => {
    const preBalance = web3.eth.getBalance(accounts[0]).toString();
    await handler.pay('cid', oracle.address, accounts[3], [], [], [], { from: accounts[3] });

    // todo: verify event logs

    const postBalance = web3.eth.getBalance(accounts[0]).toString();
    assert.equal(preBalance, postBalance);
  });

  // transfer to no beneficiaries with beneficiaries & amounts specified (should fail)
  it('transfer to no beneficiaries with beneficiaries & amounts specified (should fail)', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');

    await assertRevert(
      handler.pay(
        'cid',
        oracle.address, // which oracle to use for reference
        accounts[3], // buyer
        [], // beneficiaries
        [oneEther],
        [],
        { from: accounts[3], value: web3.utils.toWei('1', 'ether') },
      ),
    );
  });

  // transfer to multiple beneficiaries (buyer == msg.sender & badge minted)
  it('transfer to multiple beneficiaries (buyer == msg.sender)', async () => {
    const beneficiaryOneBalance = await web3.eth.getBalance(accounts[0]);
    const beneficiaryTwoBalance = await web3.eth.getBalance(accounts[1]);
    // const twoEther = web3.utils.toWei(2, 'ether');
    const oneEther = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

    await handler.pay(
      'cid',
      oracle.address, // which oracle to use for reference
      accounts[3], // buyer
      [accounts[0], accounts[1]], // beneficiaries
      [oneEther, oneEther], // amounts
      [], // notifiers
      { from: accounts[3], value: web3.utils.toWei('2', 'ether') },
    );

    // first beneficiary
    const postBeneficiaryOneBalance = web3.utils.toBN(beneficiaryOneBalance).add(oneEther);
    let currentBalance = await web3.eth.getBalance(accounts[0]);
    assert.equal(currentBalance.toString(), postBeneficiaryOneBalance.toString());

    // second beneficiary
    const postBeneficiaryTwoBalance = web3.utils.toBN(beneficiaryTwoBalance).add(oneEther);
    currentBalance = await web3.eth.getBalance(accounts[1]);
    assert.equal(currentBalance.toString(), postBeneficiaryTwoBalance.toString());
  });

  // transfer to multiple beneficiaries with amounts mismatch (should fail)
  it(' transfer to multiple beneficiaries with amounts length (fewer) mismatch (should fail)', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');
    const twoEther = web3.utils.toWei('2', 'ether');
    await assertRevert(
      handler.pay(
        'cid',
        oracle.address, // which oracle to use for reference
        accounts[3], // buyer
        [accounts[0]], // beneficiaries
        [oneEther, twoEther], // amounts
        [], // notifiers
        { from: accounts[3], value: web3.utils.toWei('3', 'ether') },
      ),
    );
  });

  it(' transfer to multiple beneficiaries with amounts length (more) mismatch (should fail)', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');
    const twoEther = web3.utils.toWei('2', 'ether');
    await assertRevert(
      handler.pay(
        'cid',
        oracle.address, // which oracle to use for reference
        accounts[3], // buyer
        [accounts[0], accounts[1], accounts[2]], // beneficiaries
        [oneEther, twoEther], // amounts
        [], // notifiers
        { from: accounts[3], value: web3.utils.toWei('3', 'ether') },
      ),
    );
  });

  // transfer to multiple beneficiaries with msg.value mismatch (should fail)
  it('transfer to multiple beneficiaries with msg.value mismatch (should fail)', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');
    await assertRevert(
      handler.pay(
        'cid',
        oracle.address, // which oracle to use for reference
        accounts[3], // buyer
        [accounts[0], accounts[1]], // beneficiaries
        [oneEther, oneEther], // amounts
        [], // notifiers
        { from: accounts[3], value: web3.utils.toWei('3', 'ether') },
      ),
    );
  });

  // transfer to multiple beneficiaries with one throwing
  it('transfer to multiple beneficiaries with one throwing', async () => {
    const oneEther = web3.utils.toWei('1', 'ether');
    await assertRevert(
      handler.pay(
        'cid',
        oracle.address, // which oracle to use for reference
        accounts[3], // buyer
        [accounts[0], testNotification.address], // beneficiaries
        [oneEther, oneEther], // amounts
        [], // notifiers
        { from: accounts[3], value: web3.utils.toWei('2', 'ether') },
      ),
    );
  });
});
