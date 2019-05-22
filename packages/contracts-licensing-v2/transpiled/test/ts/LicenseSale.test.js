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
const bignumber_js_1 = require("bignumber.js");
const chai_setup_1 = require("./utils/chai_setup");
const artifacts_1 = require("../../util/artifacts");
const assertRevert_1 = require("../helpers/assertRevert");
const eventByName_1 = require("../helpers/eventByName");
const increaseTime_1 = require("../helpers/increaseTime");
const Bluebird = require("bluebird");
const increaseTime_2 = require("../helpers/increaseTime");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new artifacts_1.Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();
const web3 = global.web3;
const web3Eth = Bluebird.promisifyAll(web3.eth);
const latestTime = () => __awaiter(this, void 0, void 0, function* () {
    const block = yield web3Eth.getBlockAsync('latest');
    return block.timestamp;
});
contract('LicenseSale', (accounts) => {
    let token = null;
    const creator = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const owner = accounts[4];
    let p1Created;
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const firstProduct = {
        id: 1,
        price: 1000,
        initialInventory: 2,
        supply: 2,
        interval: 0
    };
    const secondProduct = {
        id: 2,
        price: 2000,
        initialInventory: 3,
        supply: 5,
        interval: increaseTime_1.duration.weeks(4)
    };
    const thirdProduct = {
        id: 3,
        price: 3000,
        initialInventory: 5,
        supply: 10,
        interval: increaseTime_1.duration.weeks(4)
    };
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        token = yield LicenseCore.new({ from: creator });
        yield token.transferOwnership(owner, { from: creator });
        p1Created = yield token.createProduct(firstProduct.id, firstProduct.price, firstProduct.initialInventory, firstProduct.supply, firstProduct.interval, { from: owner });
        yield token.createProduct(secondProduct.id, secondProduct.price, secondProduct.initialInventory, secondProduct.supply, secondProduct.interval, { from: owner });
        yield token.createProduct(thirdProduct.id, thirdProduct.price, thirdProduct.initialInventory, thirdProduct.supply, thirdProduct.interval, { from: owner });
        yield token.unpause({ from: owner });
    }));
    describe('when purchasing', () => __awaiter(this, void 0, void 0, function* () {
        describe('it should fail because it', () => __awaiter(this, void 0, void 0, function* () {
            it('should not sell a product that has no inventory', () => __awaiter(this, void 0, void 0, function* () {
                yield token.clearInventory(firstProduct.id, { from: owner });
                yield assertRevert_1.default(token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: firstProduct.price
                }));
            }));
            it('should not sell a product that was sold out', () => __awaiter(this, void 0, void 0, function* () {
                yield token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: firstProduct.price
                });
                yield token.purchase(firstProduct.id, 1, user2, ZERO_ADDRESS, {
                    from: user2,
                    value: firstProduct.price
                });
                yield assertRevert_1.default(token.purchase(firstProduct.id, 1, user3, ZERO_ADDRESS, {
                    from: user3,
                    value: firstProduct.price
                }));
                (yield token.totalSold(firstProduct.id)).should.be.bignumber.equal(2);
                (yield token.availableInventoryOf(firstProduct.id)).should.be.bignumber.equal(0);
            }));
            it('should not sell at a price too low', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: firstProduct.price - 1
                }));
                yield assertRevert_1.default(token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: 0
                }));
            }));
            it('should not sell at a price too high', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: firstProduct.price + 1
                }));
            }));
            it('should not sell if the contract is paused', () => __awaiter(this, void 0, void 0, function* () {
                yield token.pause({ from: owner });
                yield assertRevert_1.default(token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: firstProduct.price + 1
                }));
            }));
            it('should not sell any product for 0 cycles', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.purchase(firstProduct.id, 0, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: firstProduct.price
                }));
            }));
            it('should not sell a non-subscription product for more cycles than 1', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.purchase(firstProduct.id, 2, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: firstProduct.price
                }));
            }));
            it('should not sell a subscription for a value less than the number of cycles requires', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.purchase(secondProduct.id, 2, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: secondProduct.price
                }));
            }));
            it('should not sell a subscription for a value more than the number of cycles requires', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.purchase(secondProduct.id, 2, user1, ZERO_ADDRESS, {
                    from: user1,
                    value: secondProduct.price * 2 + 1
                }));
            }));
        }));
        describe('and it succeeds as a non-subscription', () => __awaiter(this, void 0, void 0, function* () {
            let tokenId;
            let issuedEvent;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                const { logs } = yield token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    value: firstProduct.price
                });
                issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
                tokenId = issuedEvent.args.licenseId;
            }));
            it('should decrement the inventory', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.availableInventoryOf(firstProduct.id)).should.be.bignumber.equal(1);
            }));
            it('should track the number sold', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.totalSold(firstProduct.id)).should.be.bignumber.equal(1);
            }));
            describe('the resulting License', () => __awaiter(this, void 0, void 0, function* () {
                it('should keep track of the license id', () => __awaiter(this, void 0, void 0, function* () {
                    const owner = yield token.ownerOf(tokenId);
                    owner.should.be.equal(user1);
                }));
                it('should fetch licenseInfo', () => __awaiter(this, void 0, void 0, function* () {
                    const [productId, attributes, issuedTime, expirationTime, affiliate] = yield token.licenseInfo(tokenId);
                    productId.should.be.bignumber.equal(firstProduct.id);
                    attributes.should.not.be.bignumber.equal(0);
                    issuedTime.should.not.be.bignumber.equal(0);
                    expirationTime.should.be.bignumber.equal(0);
                    affiliate.should.be.bignumber.equal(0);
                }));
                it('should emit an Issued event', () => __awaiter(this, void 0, void 0, function* () {
                    issuedEvent.args.owner.should.be.eq(user1);
                    issuedEvent.args.licenseId.should.be.bignumber.equal(tokenId);
                    issuedEvent.args.productId.should.be.bignumber.equal(firstProduct.id);
                }));
                it('should have an issued time', () => __awaiter(this, void 0, void 0, function* () {
                    const issuedTime = yield token.licenseIssuedTime(tokenId);
                    issuedTime.should.not.be.bignumber.equal(0);
                }));
                it('should have attributes', () => __awaiter(this, void 0, void 0, function* () {
                    const attributes = yield token.licenseAttributes(tokenId);
                    attributes.should.not.be.bignumber.equal(0);
                }));
                it('should be able to find the product id', () => __awaiter(this, void 0, void 0, function* () {
                    const productId = yield token.licenseProductId(tokenId);
                    productId.should.be.bignumber.equal(firstProduct.id);
                }));
                it('should not have an expiration time', () => __awaiter(this, void 0, void 0, function* () {
                    const productId = yield token.licenseExpirationTime(tokenId);
                    productId.should.be.bignumber.equal(0);
                }));
                it('should not have an affiliate', () => __awaiter(this, void 0, void 0, function* () {
                    const productId = yield token.licenseAffiliate(tokenId);
                    productId.should.be.bignumber.equal(ZERO_ADDRESS);
                }));
                it('should transfer the license to the new owner', () => __awaiter(this, void 0, void 0, function* () {
                    const originalOwner = yield token.ownerOf(tokenId);
                    originalOwner.should.be.equal(user1);
                    yield token.transfer(user3, tokenId, { from: user1 });
                    const newOwner = yield token.ownerOf(tokenId);
                    newOwner.should.be.equal(user3);
                    const productId = yield token.licenseProductId(tokenId);
                    productId.should.be.bignumber.equal(firstProduct.id);
                }));
                it('should set an expiration time of 0', () => __awaiter(this, void 0, void 0, function* () {
                    const expirationTime = yield token.licenseExpirationTime(tokenId);
                    expirationTime.should.be.bignumber.equal(0);
                }));
            }));
        }));
        describe('and it succeeds as a subscription', () => __awaiter(this, void 0, void 0, function* () {
            let tokenId;
            let issuedEvent;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                const { logs } = yield token.purchase(secondProduct.id, 1, user1, ZERO_ADDRESS, {
                    value: secondProduct.price
                });
                issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
                tokenId = issuedEvent.args.licenseId;
            }));
            it('should set an appropriate expiration time', () => __awaiter(this, void 0, void 0, function* () {
                let now = yield latestTime();
                let expectedTime = now + secondProduct.interval;
                let actualTime = yield token.licenseExpirationTime(tokenId);
                actualTime.should.be.bignumber.equal(expectedTime);
            }));
            it('should allow buying for multiple cycles', () => __awaiter(this, void 0, void 0, function* () {
                const { logs } = yield token.purchase(thirdProduct.id, 3, user1, ZERO_ADDRESS, {
                    value: thirdProduct.price * 3
                });
                issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
                tokenId = issuedEvent.args.licenseId;
                let now = yield latestTime();
                let expectedTime = now + thirdProduct.interval * 3;
                let actualTime = yield token.licenseExpirationTime(tokenId);
                actualTime.should.be.bignumber.equal(expectedTime);
            }));
        }));
    }));
    describe('when creating a promotional purchase', () => __awaiter(this, void 0, void 0, function* () {
        describe('if a rando is trying it', () => __awaiter(this, void 0, void 0, function* () {
            it('should not be allowed', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
                    from: user3
                }));
            }));
        }));
        describe('if the owner is creating it', () => __awaiter(this, void 0, void 0, function* () {
            it('should not allow violation of the total inventory', () => __awaiter(this, void 0, void 0, function* () {
                yield token.purchase(firstProduct.id, 1, user3, ZERO_ADDRESS, {
                    from: user3,
                    value: firstProduct.price
                });
                yield token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
                    from: owner
                });
                yield assertRevert_1.default(token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
                    from: owner
                }));
            }));
            it('should not allow violation of the total supply', () => __awaiter(this, void 0, void 0, function* () {
                yield token.purchase(firstProduct.id, 1, user3, ZERO_ADDRESS, {
                    from: user3,
                    value: firstProduct.price
                });
                yield token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
                    from: owner
                });
                yield assertRevert_1.default(token.incrementInventory(firstProduct.id, 1, {
                    from: owner
                }));
            }));
            it('should decrement the inventory', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.availableInventoryOf(firstProduct.id)).should.be.bignumber.equal(2);
                yield token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
                    from: owner
                });
                (yield token.availableInventoryOf(firstProduct.id)).should.be.bignumber.equal(1);
            }));
            it('should count the amount sold', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.totalSold(firstProduct.id)).should.be.bignumber.equal(0);
                yield token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
                    from: owner
                });
                (yield token.totalSold(firstProduct.id)).should.be.bignumber.equal(1);
            }));
        }));
    }));
    describe('when renewing a subscription', () => __awaiter(this, void 0, void 0, function* () {
        let tokenId;
        let issuedEvent;
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            const { logs } = yield token.purchase(secondProduct.id, 1, user1, ZERO_ADDRESS, {
                value: secondProduct.price
            });
            issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
            tokenId = issuedEvent.args.licenseId;
        }));
        describe('it fails because', () => __awaiter(this, void 0, void 0, function* () {
            it('should not allow zero cycles', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.renew(tokenId, 0, {
                    value: secondProduct.price
                }));
            }));
            it('should require that the token has an owner', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.renew(100, 1, {
                    value: secondProduct.price
                }));
            }));
            it('should not allow renewing a non-subscription product', () => __awaiter(this, void 0, void 0, function* () {
                const { logs } = yield token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    value: firstProduct.price
                });
                const issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
                const tokenId = issuedEvent.args.licenseId;
                yield assertRevert_1.default(token.renew(tokenId, 1, {
                    value: firstProduct.price
                }));
            }));
            describe('and the admins set a product to be unrenewable', () => __awaiter(this, void 0, void 0, function* () {
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    let isRenewable = yield token.renewableOf(secondProduct.id);
                    isRenewable.should.be.true();
                    yield token.setRenewable(secondProduct.id, false, { from: owner });
                    isRenewable = yield token.renewableOf(secondProduct.id);
                    isRenewable.should.be.false();
                }));
                it('should not allow renewing a non-renewable product', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.renew(tokenId, 1, {
                        value: secondProduct.price
                    }));
                }));
            }));
            it('should not allow an underpaid value', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.renew(tokenId, 2, {
                    value: secondProduct.price * 2 - 1
                }));
            }));
            it('should not allow an overpaid value', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.renew(tokenId, 2, {
                    value: secondProduct.price * 2 + 1
                }));
            }));
            describe('and the contract is paused it', () => __awaiter(this, void 0, void 0, function* () {
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield token.pause({ from: owner });
                }));
                it('should not work', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.renew(tokenId, 2, {
                        value: secondProduct.price * 2
                    }));
                }));
            }));
        }));
        describe('and succeeds', () => __awaiter(this, void 0, void 0, function* () {
            describe('when the renewal time is in the past', () => __awaiter(this, void 0, void 0, function* () {
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    const originalExpirationTime = yield token.licenseExpirationTime(tokenId);
                    yield increaseTime_2.default(secondProduct.interval + increaseTime_1.duration.days(1));
                    originalExpirationTime.should.be.bignumber.greaterThan(0);
                    let now = yield latestTime();
                    now.should.be.bignumber.greaterThan(originalExpirationTime);
                }));
                it('should renew from now forward', () => __awaiter(this, void 0, void 0, function* () {
                    let now = yield latestTime();
                    yield token.renew(tokenId, 2, {
                        value: secondProduct.price * 2
                    });
                    const expectedExpirationTime = new bignumber_js_1.default(now).add(secondProduct.interval * 2);
                    const actualExpirationTime = yield token.licenseExpirationTime(tokenId);
                    actualExpirationTime.should.be.bignumber.equal(expectedExpirationTime);
                }));
            }));
            describe('when the renewal time is in the future', () => __awaiter(this, void 0, void 0, function* () {
                let originalExpirationTime;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    originalExpirationTime = yield token.licenseExpirationTime(tokenId);
                    originalExpirationTime.should.be.bignumber.greaterThan(0);
                    yield token.renew(tokenId, 2, {
                        value: secondProduct.price * 2
                    });
                }));
                it('should add time to the existing renewal time', () => __awaiter(this, void 0, void 0, function* () {
                    let expectedTime = originalExpirationTime.add(secondProduct.interval * 2);
                    let actualTime = yield token.licenseExpirationTime(tokenId);
                    actualTime.should.be.bignumber.equal(expectedTime);
                }));
            }));
            it('should emit a LicenseRenewal event', () => __awaiter(this, void 0, void 0, function* () {
                const originalExpirationTime = yield token.licenseExpirationTime(tokenId);
                const expectedExpirationTime = originalExpirationTime.add(secondProduct.interval * 2);
                const { logs } = yield token.renew(tokenId, 2, {
                    value: secondProduct.price * 2
                });
                const renewalEvent = eventByName_1.default(logs, 'LicenseRenewal');
                renewalEvent.args.licenseId.should.be.bignumber.equal(tokenId);
                renewalEvent.args.productId.should.be.bignumber.equal(secondProduct.id);
                renewalEvent.args.expirationTime.should.be.bignumber.equal(expectedExpirationTime);
            }));
        }));
    }));
    describe('when renewing a promotional subscription', () => __awaiter(this, void 0, void 0, function* () {
        describe('and an admin is sending', () => __awaiter(this, void 0, void 0, function* () {
            it('should not allow renewing a non-subscription product', () => __awaiter(this, void 0, void 0, function* () {
                const { logs } = yield token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
                    value: firstProduct.price
                });
                const issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
                const tokenId = issuedEvent.args.licenseId;
                yield assertRevert_1.default(token.createPromotionalRenewal(tokenId, 1, { from: owner }));
            }));
            describe('and the product is a subscription product', () => __awaiter(this, void 0, void 0, function* () {
                let tokenId;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    const { logs } = yield token.purchase(secondProduct.id, 1, user1, ZERO_ADDRESS, {
                        value: secondProduct.price
                    });
                    const issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
                    tokenId = issuedEvent.args.licenseId;
                }));
                describe('if the admins have set a product to be unrenewable', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        let isRenewable = yield token.renewableOf(secondProduct.id);
                        isRenewable.should.be.true();
                        yield token.setRenewable(secondProduct.id, false, { from: owner });
                        isRenewable = yield token.renewableOf(secondProduct.id);
                        isRenewable.should.be.false();
                    }));
                    it('should not allow renewing a non-renewable product', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.createPromotionalRenewal(tokenId, 1, { from: owner }));
                    }));
                }));
                describe('and the contract is paused', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        yield token.pause({ from: owner });
                    }));
                    it('should not work', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.createPromotionalRenewal(tokenId, 1, { from: owner }));
                    }));
                }));
                it('should renew according to the product time', () => __awaiter(this, void 0, void 0, function* () {
                    const originalExpirationTime = yield token.licenseExpirationTime(tokenId);
                    originalExpirationTime.should.be.bignumber.greaterThan(0);
                    token.createPromotionalRenewal(tokenId, 1, { from: owner });
                    let expectedTime = originalExpirationTime.add(secondProduct.interval);
                    let actualTime = yield token.licenseExpirationTime(tokenId);
                    actualTime.should.be.bignumber.equal(expectedTime);
                }));
            }));
        }));
        describe('and a rando is sending', () => __awaiter(this, void 0, void 0, function* () {
            let tokenId;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                const { logs } = yield token.purchase(secondProduct.id, 1, user1, ZERO_ADDRESS, {
                    value: secondProduct.price
                });
                const issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
                tokenId = issuedEvent.args.licenseId;
            }));
            it('should not be allowed', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.createPromotionalRenewal(tokenId, 1, { from: user1 }));
            }));
        }));
    }));
});
///
//# sourceMappingURL=LicenseSale.test.js.map