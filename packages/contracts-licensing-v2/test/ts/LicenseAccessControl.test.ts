import * as chai from 'chai';
import * as BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import ethUtil = require('ethereumjs-util');
import { chaiSetup } from './utils/chai_setup';
import { Artifacts } from '../../util/artifacts';
import assertRevert from '../helpers/assertRevert';

chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();

const web3: Web3 = (global as any).web3;

contract('LicenseAccessControl', (accounts: string[]) => {
  let token: any = null;
  const creator = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const owner = accounts[4];

  beforeEach(async () => {
    token = await LicenseCore.new({ from: creator });
  });

  describe('when setting addresses', async () => {
    it('should transferOwnership', async () => {
      (await token.owner()).should.be.equal(creator);
      await token.transferOwnership(owner);
      (await token.owner()).should.be.equal(owner);
    });

    describe('when an owner is set', async () => {
      beforeEach(async () => {
        await token.transferOwnership(owner);
      });

      // it('should setWithdrawalAddress', async () => {
      //   (await token.withdrawalAddress()).should.be.equal(creator);
      //   await token.setWithdrawalAddress(cfo, { from: owner });
      //   (await token.withdrawalAddress()).should.be.equal(cfo);
      // });
    });

    describe('when a rando is sending', async () => {
      const sender = user1;
      beforeEach(async () => {
        await token.transferOwnership(owner);
      });

      it('should not transferOwnership', async () => {
        await assertRevert(token.transferOwnership(owner, { from: sender }));
      });

      it('should not setWithdrawalAddress', async () => {
        await assertRevert(
          token.setWithdrawalAddress(sender, { from: sender })
        );
      });
    });
  });

  describe('when setting the withdrawal address', async () => {
    it('should not allow a rando', async () => {
      await assertRevert(token.setWithdrawalAddress(user1, { from: user1 }));
    });
  });

  describe('when withdrawing the balance', async () => {
    beforeEach(async () => {
      await token.transferOwnership(owner);
    });
    it('should not allow a rando', async () => {
      await assertRevert(token.setWithdrawalAddress(user1, { from: user1 }));
    });
  });

  describe('when pausing and unpausing', async () => {
    beforeEach(async () => {
      await token.transferOwnership(owner);
    });
    it('should not allow a random person to pause', async () => {
      await assertRevert(token.pause({ from: user1 }));
    });
    it('should not allow a random person to unpause', async () => {
      await assertRevert(token.unpause({ from: user1 }));
    });
    it('should allow the owner', async () => {
      (await token.paused()).should.be.false();
      await token.pause({ from: owner });
      (await token.paused()).should.be.true();
    });
  });
});
