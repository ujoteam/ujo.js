"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chai_setup_1 = require("./utils/chai_setup");
const artifacts_1 = require("../../util/artifacts");
const assertRevert_1 = require("../helpers/assertRevert");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new artifacts_1.Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();
const web3 = global.web3;
contract('LicenseAccessControl', (accounts) => {
    let token = null;
    const creator = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const owner = accounts[4];
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        token = yield LicenseCore.new({ from: creator });
    }));
    describe('when setting addresses', () => __awaiter(this, void 0, void 0, function* () {
        it('should transferOwnership', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.owner()).should.be.equal(creator);
            yield token.transferOwnership(owner);
            (yield token.owner()).should.be.equal(owner);
        }));
        describe('when an owner is set', () => __awaiter(this, void 0, void 0, function* () {
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                yield token.transferOwnership(owner);
            }));
            // it('should setWithdrawalAddress', async () => {
            //   (await token.withdrawalAddress()).should.be.equal(creator);
            //   await token.setWithdrawalAddress(cfo, { from: owner });
            //   (await token.withdrawalAddress()).should.be.equal(cfo);
            // });
        }));
        describe('when a rando is sending', () => __awaiter(this, void 0, void 0, function* () {
            const sender = user1;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                yield token.transferOwnership(owner);
            }));
            it('should not transferOwnership', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.transferOwnership(owner, { from: sender }));
            }));
            it('should not setWithdrawalAddress', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.setWithdrawalAddress(sender, { from: sender }));
            }));
        }));
    }));
    describe('when setting the withdrawal address', () => __awaiter(this, void 0, void 0, function* () {
        it('should not allow a rando', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.setWithdrawalAddress(user1, { from: user1 }));
        }));
    }));
    describe('when withdrawing the balance', () => __awaiter(this, void 0, void 0, function* () {
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            yield token.transferOwnership(owner);
        }));
        it('should not allow a rando', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.setWithdrawalAddress(user1, { from: user1 }));
        }));
    }));
    describe('when pausing and unpausing', () => __awaiter(this, void 0, void 0, function* () {
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            yield token.transferOwnership(owner);
        }));
        it('should not allow a random person to pause', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.pause({ from: user1 }));
        }));
        it('should not allow a random person to unpause', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.unpause({ from: user1 }));
        }));
        it('should allow the owner', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.paused()).should.be.true();
            yield token.unpause({ from: owner });
            (yield token.paused()).should.be.false();
            yield token.pause({ from: owner });
            (yield token.paused()).should.be.true();
        }));
    }));
});
//# sourceMappingURL=LicenseAccessControl.test.js.map