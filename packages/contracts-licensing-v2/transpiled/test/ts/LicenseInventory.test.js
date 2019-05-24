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
const expectThrow_1 = require("../helpers/expectThrow");
const increaseTime_1 = require("../helpers/increaseTime");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new artifacts_1.Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();
const web3 = global.web3;
contract('LicenseInventory', (accounts) => {
    let token = null;
    const creator = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const owner = accounts[4];
    let p1Created;
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
    }));
    describe('when creating products', () => __awaiter(this, void 0, void 0, function* () {
        it('should create the first product', () => __awaiter(this, void 0, void 0, function* () {
            const [price, inventory, supply, interval, renewable] = yield token.productInfo(firstProduct.id);
            price.toNumber().should.equal(firstProduct.price);
            inventory.toNumber().should.equal(firstProduct.initialInventory);
            supply.toNumber().should.equal(firstProduct.supply);
            interval.toNumber().should.equal(firstProduct.interval);
            renewable.should.be.false();
        }));
        it('should create the second product', () => __awaiter(this, void 0, void 0, function* () {
            const [price, inventory, supply, interval, renewable] = yield token.productInfo(secondProduct.id);
            price.toNumber().should.equal(secondProduct.price);
            inventory.toNumber().should.equal(secondProduct.initialInventory);
            supply.toNumber().should.equal(secondProduct.supply);
            interval.toNumber().should.equal(secondProduct.interval);
            renewable.should.be.true();
        }));
        it('should emit a ProductCreated event', () => __awaiter(this, void 0, void 0, function* () {
            const { logs } = p1Created;
            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('ProductCreated');
            logs[0].args.id.should.be.bignumber.equal(firstProduct.id);
            logs[0].args.price.should.be.bignumber.equal(firstProduct.price);
            logs[0].args.available.should.be.bignumber.equal(firstProduct.initialInventory);
            logs[0].args.supply.should.be.bignumber.equal(firstProduct.supply);
            logs[0].args.interval.should.be.bignumber.equal(firstProduct.interval);
            logs[0].args.renewable.should.be.false();
        }));
        it('should not create a product with the same id', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.createProduct(firstProduct.id, firstProduct.price, firstProduct.initialInventory, firstProduct.supply, firstProduct.interval, { from: owner }));
        }));
        it('should not create a product with more inventory than the total supply', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.createProduct(thirdProduct.id, thirdProduct.price, thirdProduct.supply + 1, thirdProduct.supply, thirdProduct.interval, { from: owner }));
        }));
        describe('and minding permissions', () => __awaiter(this, void 0, void 0, function* () {
            it('should not allow a rando to create a product', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.createProduct(thirdProduct.id, thirdProduct.price, thirdProduct.initialInventory, thirdProduct.supply, thirdProduct.interval, { from: user1 }));
            }));
        }));
    }));
    describe('when changing inventories', () => __awaiter(this, void 0, void 0, function* () {
        it('should increment the inventory', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.availableInventoryOf(secondProduct.id)).should.be.bignumber.equal(3);
            yield token.incrementInventory(secondProduct.id, 2, { from: owner });
            (yield token.availableInventoryOf(secondProduct.id)).should.be.bignumber.equal(5);
        }));
        it('should decrement the inventory', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.availableInventoryOf(secondProduct.id)).should.be.bignumber.equal(3);
            yield token.decrementInventory(secondProduct.id, 3, { from: owner });
            (yield token.availableInventoryOf(secondProduct.id)).should.be.bignumber.equal(0);
        }));
        describe('if the product does not exist', () => __awaiter(this, void 0, void 0, function* () {
            it('should not increment the inventory', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.incrementInventory(1298120398, 2, { from: owner }));
            }));
            it('should not decrement the inventory', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.decrementInventory(1298120398, 2, { from: owner }));
            }));
        }));
        it('should not decrement below zero', () => __awaiter(this, void 0, void 0, function* () {
            yield expectThrow_1.default(token.decrementInventory(secondProduct.id, secondProduct.initialInventory + 1, { from: owner }));
        }));
        it('allow clearing inventory to zero', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.availableInventoryOf(secondProduct.id)).should.be.bignumber.equal(3);
            yield token.clearInventory(secondProduct.id, { from: owner });
            (yield token.availableInventoryOf(secondProduct.id)).should.be.bignumber.equal(0);
        }));
        it('should not allow setting the inventory greater than the total supply', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.incrementInventory(secondProduct.id, 3, { from: owner }));
        }));
        it('should emit a ProductInventoryAdjusted event', () => __awaiter(this, void 0, void 0, function* () {
            const { logs } = yield token.incrementInventory(secondProduct.id, 2, {
                from: owner
            });
            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('ProductInventoryAdjusted');
            logs[0].args.productId.should.be.bignumber.equal(secondProduct.id);
            logs[0].args.available.should.be.bignumber.equal(secondProduct.initialInventory + 2);
        }));
        describe('and minding permissions', () => __awaiter(this, void 0, void 0, function* () {
            it('should not allow a rando to change inventory', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.incrementInventory(secondProduct.id, 1, { from: user1 }));
            }));
        }));
    }));
    describe('when changing prices', () => __awaiter(this, void 0, void 0, function* () {
        it('should change the price', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.priceOf(secondProduct.id)).should.be.bignumber.equal(secondProduct.price);
            token.setPrice(secondProduct.id, 1234567, { from: owner });
            (yield token.priceOf(secondProduct.id)).should.be.bignumber.equal(1234567);
        }));
        it('should not allow a rando to change the price', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.setPrice(secondProduct.id, 1, { from: user1 }));
        }));
        it('should emit a ProductPriceChanged event', () => __awaiter(this, void 0, void 0, function* () {
            const { logs } = yield token.setPrice(secondProduct.id, 1234567, {
                from: owner
            });
            logs.length.should.be.equal(1);
            logs[0].event.should.be.eq('ProductPriceChanged');
            logs[0].args.productId.should.be.bignumber.equal(secondProduct.id);
            logs[0].args.price.should.be.bignumber.equal(1234567);
        }));
    }));
    describe('when changing renewable', () => __awaiter(this, void 0, void 0, function* () {
        describe('and an executive is changing renewable', () => __awaiter(this, void 0, void 0, function* () {
            it('should be allowed', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.renewableOf(secondProduct.id)).should.be.true();
                yield token.setRenewable(secondProduct.id, false, { from: owner });
                (yield token.renewableOf(secondProduct.id)).should.be.false();
            }));
            it('should emit a ProductRenewableChanged event', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.renewableOf(secondProduct.id)).should.be.true();
                const { logs } = yield token.setRenewable(secondProduct.id, false, {
                    from: owner
                });
                logs.length.should.be.equal(1);
                logs[0].event.should.be.eq('ProductRenewableChanged');
                logs[0].args.productId.should.be.bignumber.equal(secondProduct.id);
                logs[0].args.renewable.should.be.false();
            }));
        }));
        describe('and a rando is changing renewable', () => __awaiter(this, void 0, void 0, function* () {
            it('should not be allowed', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.setRenewable(secondProduct.id, false, { from: user1 }));
            }));
        }));
    }));
    describe('when reading product information', () => __awaiter(this, void 0, void 0, function* () {
        it('should get all products that exist', () => __awaiter(this, void 0, void 0, function* () {
            const productIds = yield token.getAllProductIds();
            productIds[0].should.be.bignumber.equal(firstProduct.id);
            productIds[1].should.be.bignumber.equal(secondProduct.id);
        }));
        describe('and calling costForProductCycles', () => __awaiter(this, void 0, void 0, function* () {
            it('should know the price for one cycle', () => __awaiter(this, void 0, void 0, function* () {
                const cost = yield token.costForProductCycles(secondProduct.id, 1);
                cost.should.not.be.bignumber.equal(0);
                cost.should.be.bignumber.equal(secondProduct.price);
            }));
            it('should know the price for two cycles', () => __awaiter(this, void 0, void 0, function* () {
                const cost = yield token.costForProductCycles(secondProduct.id, 3);
                cost.should.not.be.bignumber.equal(0);
                cost.should.be.bignumber.equal(secondProduct.price * 3);
            }));
        }));
        describe('and calling isSubscriptionProduct', () => __awaiter(this, void 0, void 0, function* () {
            it('should be true for a subscription', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.isSubscriptionProduct(secondProduct.id)).should.be.true();
            }));
            it('should be false for a non-subscription', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.isSubscriptionProduct(firstProduct.id)).should.be.false();
            }));
        }));
    }));
});
///
//# sourceMappingURL=LicenseInventory.test.js.map