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
const find = require("lodash/find");
const increaseTime_2 = require("../helpers/increaseTime");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest, AffiliateProgram } = new artifacts_1.Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();
const web3 = global.web3;
const web3Eth = Bluebird.promisifyAll(web3.eth);
contract('AffiliateProgram', (accounts) => {
    let token = null;
    let affiliate = null;
    const creator = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const user4 = accounts[4];
    const user5 = accounts[5];
    const affiliate1 = accounts[6];
    const affiliate2 = accounts[7];
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
        interval: increaseTime_2.duration.weeks(4)
    };
    const thirdProduct = {
        id: 3,
        price: 3000,
        initialInventory: 5,
        supply: 10,
        interval: increaseTime_2.duration.weeks(4)
    };
    const purchase = (product, user, opts = {}) => __awaiter(this, void 0, void 0, function* () {
        const affiliate = opts.affiliate || ZERO_ADDRESS;
        const { logs } = yield token.purchase(product.id, 1, user, affiliate, {
            value: product.price,
            gasPrice: 0
        });
        const issuedEvent = eventByName_1.default(logs, 'LicenseIssued');
        return issuedEvent.args.licenseId;
    });
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        token = yield LicenseCore.new({ from: creator });
        yield token.transferOwnership(creator, { from: creator });
        yield token.createProduct(firstProduct.id, firstProduct.price, firstProduct.initialInventory, firstProduct.supply, firstProduct.interval, { from: creator });
        yield token.createProduct(secondProduct.id, secondProduct.price, secondProduct.initialInventory, secondProduct.supply, secondProduct.interval, { from: creator });
        yield token.unpause({ from: creator });
        affiliate = yield AffiliateProgram.new(token.address, { from: creator });
        yield token.setAffiliateProgramAddress(affiliate.address, {
            from: creator
        });
        yield affiliate.unpause({ from: creator });
    }));
    describe('in AffiliateProgram', () => __awaiter(this, void 0, void 0, function* () {
        it('should have a storeAddress', () => __awaiter(this, void 0, void 0, function* () {
            (yield affiliate.storeAddress()).should.be.eq(token.address);
        }));
        it('should report that it isAffiliateProgram', () => __awaiter(this, void 0, void 0, function* () {
            (yield affiliate.isAffiliateProgram()).should.be.true();
        }));
        describe('when setting the baselineRate', () => __awaiter(this, void 0, void 0, function* () {
            describe('when the owner sets a new rate', () => __awaiter(this, void 0, void 0, function* () {
                let event;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.baselineRate()).should.be.bignumber.equal(0);
                    const { logs } = yield affiliate.setBaselineRate(1000, {
                        from: creator
                    });
                    event = eventByName_1.default(logs, 'RateChanged');
                }));
                it('the owner should set a new rate', () => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.baselineRate()).should.be.bignumber.equal(1000);
                }));
                it('should emit a RateChanged event', () => __awaiter(this, void 0, void 0, function* () {
                    event.args.rate.should.be.bignumber.equal(0);
                    event.args.amount.should.be.bignumber.equal(1000);
                }));
            }));
            it('the owner should not be able to set it too high', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.setBaselineRate(5100, { from: creator }));
            }));
            it('a random user should not be able to change the rate', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.setBaselineRate(1000, { from: user1 }));
            }));
        }));
        describe('when setting the maximumRate', () => __awaiter(this, void 0, void 0, function* () {
            describe('when the owner is setting the new rate', () => __awaiter(this, void 0, void 0, function* () {
                let event;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.maximumRate()).should.be.bignumber.equal(5000);
                    const { logs } = yield affiliate.setMaximumRate(1000, {
                        from: creator
                    });
                    event = eventByName_1.default(logs, 'RateChanged');
                }));
                it('should allow the owner to set a new rate', () => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.maximumRate()).should.be.bignumber.equal(1000);
                }));
                it('should emit a RateChanged event', () => __awaiter(this, void 0, void 0, function* () {
                    event.args.rate.should.be.bignumber.equal(1);
                    event.args.amount.should.be.bignumber.equal(1000);
                }));
            }));
            it('should not allow the owner to set a new rate too high', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.setMaximumRate(5100, { from: creator }));
            }));
            it('should not allow a rando to change the maximumRate', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.setMaximumRate(1000, { from: user1 }));
            }));
        }));
        describe('when whitelisting affiliates', () => __awaiter(this, void 0, void 0, function* () {
            describe('when the owner is whitelisting', () => __awaiter(this, void 0, void 0, function* () {
                let event;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.whitelistRates(affiliate1)).should.be.bignumber.equal(0);
                    let { logs } = yield affiliate.whitelist(affiliate1, 2500, {
                        from: creator
                    });
                    event = eventByName_1.default(logs, 'Whitelisted');
                }));
                it('should allow the owner to whitelist affiliates', () => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.whitelistRates(affiliate1)).should.be.bignumber.equal(2500);
                }));
                it('should emit a Whitelisted event', () => __awaiter(this, void 0, void 0, function* () {
                    event.args.affiliate.should.be.equal(affiliate1);
                    event.args.amount.should.be.bignumber.equal(2500);
                }));
            }));
            it('should not allow the owner to whitelist with too high of a rate', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.whitelist(affiliate1, 5100, { from: creator }));
            }));
            it('should not allow a rando to whitelist', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.whitelist(affiliate1, 1000, { from: user1 }));
            }));
        }));
        describe('when using rateFor', () => __awaiter(this, void 0, void 0, function* () {
            describe('when affiliates are whitelisted', () => __awaiter(this, void 0, void 0, function* () {
                it('should return the correct rate for affiliates', () => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.rateFor(affiliate1, 0, 0, 0)).should.be.bignumber.equal(0);
                    yield affiliate.whitelist(affiliate1, 2500, { from: creator });
                    (yield affiliate.rateFor(affiliate1, 0, 0, 0)).should.be.bignumber.equal(2500);
                }));
                describe('if the maximumRate is lower than the whitelisted rate', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        yield affiliate.whitelist(affiliate1, 2500, { from: creator });
                        yield affiliate.setMaximumRate(1000, { from: creator });
                    }));
                    it('should return the maximumRate', () => __awaiter(this, void 0, void 0, function* () {
                        (yield affiliate.rateFor(affiliate1, 0, 0, 0)).should.be.bignumber.equal(1000);
                    }));
                }));
                describe('when an affiliate is blacklisted', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        yield affiliate.whitelist(affiliate1, 1, { from: creator });
                    }));
                    it('should return zero for that affiliate', () => __awaiter(this, void 0, void 0, function* () {
                        (yield affiliate.rateFor(affiliate1, 0, 0, 0)).should.be.bignumber.equal(0);
                    }));
                }));
            }));
        }));
        describe('when calculating cuts for an affiliate', () => __awaiter(this, void 0, void 0, function* () {
            const priceTests = [
                {
                    price: web3.toWei(1, 'ether'),
                    rate: 1000,
                    actual: web3.toWei(0.1, 'ether')
                },
                {
                    price: web3.toWei(0.5, 'ether'),
                    rate: 2500,
                    actual: web3.toWei(0.125, 'ether')
                },
                {
                    price: 1000,
                    rate: 2,
                    actual: 0
                },
                {
                    price: 1234,
                    rate: 123,
                    actual: 15
                },
                {
                    price: 1234,
                    rate: 129,
                    actual: 15
                }
            ];
            priceTests.forEach(test => {
                it(`should calculate the correct cut for price ${test.price} at rate ${test.rate / 100}%`, () => __awaiter(this, void 0, void 0, function* () {
                    yield affiliate.whitelist(affiliate1, test.rate, { from: creator });
                    const givenCut = yield affiliate.cutFor(affiliate1, 0, 0, test.price, {
                        from: creator
                    });
                    givenCut.should.be.bignumber.equal(new bignumber_js_1.default(test.actual));
                }));
            });
        }));
        describe('when making deposits for affiliates', () => __awaiter(this, void 0, void 0, function* () {
            const purchaseId = 1;
            const valueAmount = 12345;
            describe('in a valid way', () => __awaiter(this, void 0, void 0, function* () {
                let logs;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    const result = yield affiliate.credit(affiliate1, purchaseId, {
                        from: creator,
                        value: valueAmount
                    });
                    logs = result.logs;
                }));
                it('should add to the balance of that affiliate', () => __awaiter(this, void 0, void 0, function* () {
                    (yield affiliate.balances(affiliate1)).should.be.bignumber.equal(valueAmount);
                    yield affiliate.credit(affiliate1, purchaseId, {
                        from: creator,
                        value: valueAmount
                    });
                    (yield affiliate.balances(affiliate1)).should.be.bignumber.equal(valueAmount * 2);
                }));
                it('should record the lastDeposit for that affiliate', () => __awaiter(this, void 0, void 0, function* () {
                    const block = yield web3Eth.getBlockAsync('latest');
                    const lastDepositTime = yield affiliate.lastDepositTimes(affiliate1);
                    lastDepositTime.should.be.bignumber.equal(block.timestamp);
                }));
                it('should record the lastDeposit for the contract overall', () => __awaiter(this, void 0, void 0, function* () {
                    const block = yield web3Eth.getBlockAsync('latest');
                    const lastDepositTime = yield affiliate.lastDepositTime();
                    lastDepositTime.should.be.bignumber.equal(block.timestamp);
                }));
                it('emit an AffiliateCredit', () => __awaiter(this, void 0, void 0, function* () {
                    let event = eventByName_1.default(logs, 'AffiliateCredit');
                    event.args.affiliate.should.be.equal(affiliate1);
                    event.args.productId.should.be.bignumber.equal(purchaseId);
                    event.args.amount.should.be.bignumber.equal(valueAmount);
                }));
            }));
            it('should not allow deposits when paused', () => __awaiter(this, void 0, void 0, function* () {
                yield affiliate.pause({ from: creator });
                yield assertRevert_1.default(affiliate.credit(affiliate1, purchaseId, {
                    from: creator,
                    value: valueAmount
                }));
            }));
            it('should not allow deposits from a rando', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.credit(affiliate1, purchaseId, {
                    from: user1,
                    value: valueAmount
                }));
            }));
            it('should not allow deposits without a value', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.credit(affiliate1, purchaseId, {
                    from: creator,
                    value: 0
                }));
            }));
            it('should not allow deposits to an affiliate with a zero address', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.credit(ZERO_ADDRESS, purchaseId, {
                    from: creator,
                    value: valueAmount
                }));
            }));
        }));
        describe('when withdrawing', () => __awaiter(this, void 0, void 0, function* () {
            describe('and the affiliate has a balance', () => __awaiter(this, void 0, void 0, function* () {
                const valueAf1 = 10000;
                const valueAf2 = 30000;
                const purchaseId1 = 1;
                const purchaseId2 = 2;
                let affiliateContractBalance;
                let originalAccountBalance1;
                let originalAccountBalance2;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield affiliate.credit(affiliate1, purchaseId1, {
                        from: creator,
                        value: valueAf1
                    });
                    yield affiliate.credit(affiliate2, purchaseId2, {
                        from: creator,
                        value: valueAf2
                    });
                    // the affiliate balances are credited
                    (yield affiliate.balances(affiliate1)).should.be.bignumber.equal(valueAf1);
                    (yield affiliate.balances(affiliate2)).should.be.bignumber.equal(valueAf2);
                    // and the contract actually holds the ETH balance
                    affiliateContractBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                    affiliateContractBalance.should.be.bignumber.equal(valueAf1 + valueAf2);
                    originalAccountBalance1 = yield web3Eth.getBalanceAsync(affiliate1);
                    originalAccountBalance2 = yield web3Eth.getBalanceAsync(affiliate2);
                }));
                describe('and the affiliate withdraws', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        yield affiliate.withdraw({
                            from: affiliate1,
                            gasPrice: 0
                        });
                    }));
                    it('should clear the balance', () => __awaiter(this, void 0, void 0, function* () {
                        (yield affiliate.balances(affiliate1)).should.be.bignumber.equal(0);
                    }));
                    it('should give the affiliate ETH', () => __awaiter(this, void 0, void 0, function* () {
                        const newBalance = yield web3Eth.getBalanceAsync(affiliate1);
                        newBalance.should.be.bignumber.equal(originalAccountBalance1.plus(valueAf1));
                    }));
                    it('should deduct the amount from the affiliate contract balance', () => __awaiter(this, void 0, void 0, function* () {
                        const newAffiliateContractBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                        newAffiliateContractBalance.should.be.bignumber.equal(affiliateContractBalance.minus(valueAf1));
                    }));
                    it('should not affect another account', () => __awaiter(this, void 0, void 0, function* () {
                        (yield affiliate.balances(affiliate2)).should.be.bignumber.equal(valueAf2);
                        (yield web3Eth.getBalanceAsync(affiliate2)).should.be.bignumber.equal(originalAccountBalance2);
                    }));
                    it('should not allow a withdraw when there is a zero balance', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(affiliate.withdraw({
                            from: affiliate1
                        }));
                    }));
                }));
                describe('and it is paused', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        yield affiliate.pause({ from: creator });
                    }));
                    it('should not work', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(affiliate.withdraw({
                            from: affiliate1
                        }));
                    }));
                }));
                describe('when the owner is withdrawing', () => __awaiter(this, void 0, void 0, function* () {
                    it('should not be allowed before the expiry time', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(affiliate.withdrawFrom(affiliate1, creator, { from: creator }));
                    }));
                    describe('and the expiry time has passed', () => __awaiter(this, void 0, void 0, function* () {
                        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                            yield increaseTime_1.default(60 * 60 * 24 * 31);
                        }));
                        describe('and the creator withdraws', () => __awaiter(this, void 0, void 0, function* () {
                            let creatorBalance;
                            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                                creatorBalance = yield web3Eth.getBalanceAsync(creator);
                                yield affiliate.withdrawFrom(affiliate1, creator, {
                                    from: creator,
                                    gasPrice: 0
                                });
                            }));
                            it('should clear the balance', () => __awaiter(this, void 0, void 0, function* () {
                                (yield affiliate.balances(affiliate1)).should.be.bignumber.equal(0);
                            }));
                            it('should give the creator ETH', () => __awaiter(this, void 0, void 0, function* () {
                                const newBalance = yield web3Eth.getBalanceAsync(creator);
                                newBalance.should.be.bignumber.equal(creatorBalance.plus(valueAf1));
                            }));
                            it('should deduct the amount from the affiliate contract balance', () => __awaiter(this, void 0, void 0, function* () {
                                const newAffiliateContractBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                                newAffiliateContractBalance.should.be.bignumber.equal(affiliateContractBalance.minus(valueAf1));
                            }));
                        }));
                    }));
                }));
                describe('when a rando is withdrawing', () => __awaiter(this, void 0, void 0, function* () {
                    it('should not work to withdraw', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(affiliate.withdraw({ from: user1 }));
                    }));
                    it('should not work to withdrawFrom', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(affiliate.withdrawFrom(affiliate1, user1, { from: user1 }));
                    }));
                }));
            }));
        }));
    }));
    describe('when shutting down', () => __awaiter(this, void 0, void 0, function* () {
        describe('and it is before the expiry time', () => __awaiter(this, void 0, void 0, function* () {
            it('should not allow the creator to retire', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.retire(creator, { from: creator }));
            }));
            it('should not allow the a rando to retire', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.retire(user1, { from: user1 }));
            }));
        }));
        describe('and it is after the expiry time', () => __awaiter(this, void 0, void 0, function* () {
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                yield increaseTime_1.default(60 * 60 * 24 * 31);
            }));
            it('should allow the creator to retire', () => __awaiter(this, void 0, void 0, function* () {
                const creatorBalance = yield web3Eth.getBalanceAsync(creator);
                const affiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                yield affiliate.pause({ from: creator, gasPrice: 0 });
                yield affiliate.retire(creator, { from: creator, gasPrice: 0 });
                const newCreatorBalance = yield web3Eth.getBalanceAsync(creator);
                newCreatorBalance.should.be.bignumber.equal(creatorBalance.plus(affiliateBalance));
                yield assertRevert_1.default(affiliate.unpause({ from: creator }));
            }));
            it('should not allow the a rando to retire', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(affiliate.retire(user1, { from: user1 }));
            }));
        }));
    }));
    const productsOwnedBy = (owner) => __awaiter(this, void 0, void 0, function* () {
        const tokenIds = yield token.tokensOf(owner);
        let tokenProductIds = [];
        for (let i = 0; i < tokenIds.length; i++) {
            tokenProductIds.push(yield token.licenseProductId(tokenIds[i]));
        }
        return tokenProductIds;
    });
    const assertOwns = (owner, productId) => __awaiter(this, void 0, void 0, function* () {
        const products = yield productsOwnedBy(owner);
        const matchingId = find(products, id => id.equals(productId));
        (matchingId || false).should.be.bignumber.equal(productId);
    });
    const assertDoesNotOwn = (owner, productId) => __awaiter(this, void 0, void 0, function* () {
        const products = yield productsOwnedBy(owner);
        const matchingId = find(products, id => id.equals(productId));
        (matchingId || false).should.be.false();
    });
    describe('when making a sale', () => __awaiter(this, void 0, void 0, function* () {
        const assertPurchaseWorks = () => __awaiter(this, void 0, void 0, function* () {
            const originalLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
            yield assertDoesNotOwn(user3, secondProduct.id);
            yield token.purchase(secondProduct.id, 1, user3, affiliate1, {
                from: user3,
                value: secondProduct.price,
                gasPrice: 0
            });
            const newLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
            newLicenseBalance.should.be.bignumber.equal(originalLicenseBalance.add(secondProduct.price));
            yield assertOwns(user3, secondProduct.id);
        });
        describe('and the affiliate program is inoperational because', () => __awaiter(this, void 0, void 0, function* () {
            describe('and the affiliate program was retired', () => __awaiter(this, void 0, void 0, function* () {
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield increaseTime_1.default(60 * 60 * 24 * 31);
                    yield affiliate.pause({ from: creator, gasPrice: 0 });
                    yield affiliate.retire(creator, { from: creator });
                }));
                it('should work just fine', assertPurchaseWorks);
            }));
            describe('and the affiliate program is paused', () => __awaiter(this, void 0, void 0, function* () {
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield affiliate.pause({ from: creator, gasPrice: 0 });
                }));
                it('should work just fine', assertPurchaseWorks);
            }));
        }));
        describe('and the affiliate program is operational', () => __awaiter(this, void 0, void 0, function* () {
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                yield token.setPrice(secondProduct.id, web3.toWei(new bignumber_js_1.default(1), 'ether'), {
                    from: creator
                });
                secondProduct.price = web3.toWei(new bignumber_js_1.default(1), 'ether').toNumber();
            }));
            describe('and the product is free', () => __awaiter(this, void 0, void 0, function* () {
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield token.setPrice(secondProduct.id, 0, {
                        from: creator
                    });
                    secondProduct.price = 0;
                }));
                it('should work just fine', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertDoesNotOwn(user3, secondProduct.id);
                    // make a purchase
                    yield token.purchase(secondProduct.id, 1, user3, affiliate1, {
                        from: user3,
                        value: secondProduct.price,
                        gasPrice: 0
                    });
                    // check the new balances
                    yield assertOwns(user3, secondProduct.id);
                }));
            }));
            describe('and the affiliate is missing', () => __awaiter(this, void 0, void 0, function* () {
                it('should work just fine', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertDoesNotOwn(user3, secondProduct.id);
                    // make a purchase
                    yield token.purchase(secondProduct.id, 1, user3, ZERO_ADDRESS, {
                        from: user3,
                        value: secondProduct.price,
                        gasPrice: 0
                    });
                    // check the new balances
                    yield assertOwns(user3, secondProduct.id);
                }));
            }));
            describe('and the affiliate is unknown', () => __awaiter(this, void 0, void 0, function* () {
                let expectedComission;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield affiliate.setBaselineRate(100, { from: creator });
                    expectedComission = web3.toWei(new bignumber_js_1.default(0.01), 'ether');
                }));
                it('should give the affiliate his credit', () => __awaiter(this, void 0, void 0, function* () {
                    // check original balances
                    const originalLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                    const originalAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                    yield assertDoesNotOwn(user3, secondProduct.id);
                    // make a purchase
                    yield token.purchase(secondProduct.id, 1, user3, affiliate1, {
                        from: user3,
                        value: secondProduct.price,
                        gasPrice: 0
                    });
                    // check the new balances
                    yield assertOwns(user3, secondProduct.id);
                    const newLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                    newLicenseBalance.should.be.bignumber.equal(originalLicenseBalance
                        .add(secondProduct.price)
                        .sub(expectedComission));
                    const newAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                    newAffiliateBalance.should.be.bignumber.equal(originalAffiliateBalance.add(expectedComission));
                }));
            }));
            describe('and the affiliate is whitelisted', () => __awaiter(this, void 0, void 0, function* () {
                let expectedComission;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield affiliate.whitelist(affiliate1, 2000, { from: creator });
                    expectedComission = web3.toWei(new bignumber_js_1.default(0.2), 'ether');
                }));
                it('should give the affiliate her credit', () => __awaiter(this, void 0, void 0, function* () {
                    // check original balances
                    const originalLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                    const originalAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                    yield assertDoesNotOwn(user3, secondProduct.id);
                    // make a purchase
                    yield token.purchase(secondProduct.id, 1, user3, affiliate1, {
                        from: user3,
                        value: secondProduct.price,
                        gasPrice: 0
                    });
                    // check the new balances
                    yield assertOwns(user3, secondProduct.id);
                    const newLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                    newLicenseBalance.should.be.bignumber.equal(originalLicenseBalance
                        .add(secondProduct.price)
                        .sub(expectedComission));
                    const newAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                    newAffiliateBalance.should.be.bignumber.equal(originalAffiliateBalance.add(expectedComission));
                }));
            }));
        }));
        describe('and the affiliate is operational on renew', () => __awaiter(this, void 0, void 0, function* () {
            describe('and the product is free', () => __awaiter(this, void 0, void 0, function* () {
                let tokenId;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    tokenId = yield purchase(secondProduct, user1, {
                        affiliate: affiliate1
                    });
                    yield token.setPrice(secondProduct.id, 0, {
                        from: creator
                    });
                    secondProduct.price = 0;
                }));
                it('should work just fine', () => __awaiter(this, void 0, void 0, function* () {
                    yield token.renew(tokenId, 1, {
                        from: user3
                    });
                }));
            }));
            describe('and the affiliate might receive a credit', () => __awaiter(this, void 0, void 0, function* () {
                let tokenId;
                let expectedComission;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield token.setPrice(secondProduct.id, web3.toWei(new bignumber_js_1.default(1), 'ether'), {
                        from: creator
                    });
                    secondProduct.price = web3
                        .toWei(new bignumber_js_1.default(1), 'ether')
                        .toNumber();
                    yield affiliate.setBaselineRate(100, { from: creator });
                    expectedComission = web3.toWei(new bignumber_js_1.default(0.01), 'ether');
                    tokenId = yield purchase(secondProduct, user1, {
                        affiliate: affiliate1
                    });
                }));
                describe("and it's within the renewal timeframe", () => __awaiter(this, void 0, void 0, function* () {
                    it('should give the affiliate his credit', () => __awaiter(this, void 0, void 0, function* () {
                        // check original balances
                        const originalLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                        const originalAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                        yield assertOwns(user1, secondProduct.id);
                        // make a renewal
                        yield token.renew(tokenId, 1, {
                            from: user3,
                            value: secondProduct.price,
                            gasPrice: 0
                        });
                        const newLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                        newLicenseBalance.should.be.bignumber.equal(originalLicenseBalance
                            .add(secondProduct.price)
                            .sub(expectedComission));
                        const newAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                        newAffiliateBalance.should.be.bignumber.equal(originalAffiliateBalance.add(expectedComission));
                    }));
                }));
                describe('and the token was sold a long time ago', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        yield token.setRenewalsCreditAffiliatesFor(increaseTime_2.duration.days(1), {
                            from: creator
                        });
                        let renewalsTimeframe = yield token.renewalsCreditAffiliatesFor();
                        renewalsTimeframe.should.be.bignumber.equal(increaseTime_2.duration.days(1));
                        yield increaseTime_1.default(increaseTime_2.duration.days(2));
                    }));
                    it('should not pay an affiliate', () => __awaiter(this, void 0, void 0, function* () {
                        const originalLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                        const originalAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                        yield assertOwns(user1, secondProduct.id);
                        // make a renewal
                        yield token.renew(tokenId, 1, {
                            from: user3,
                            value: secondProduct.price,
                            gasPrice: 0
                        });
                        const newLicenseBalance = yield web3Eth.getBalanceAsync(token.address);
                        newLicenseBalance.should.be.bignumber.equal(originalLicenseBalance.add(secondProduct.price));
                        const newAffiliateBalance = yield web3Eth.getBalanceAsync(affiliate.address);
                        newAffiliateBalance.should.be.bignumber.equal(originalAffiliateBalance);
                    }));
                }));
            }));
        }));
    }));
});
//# sourceMappingURL=AffiliateProgram.test.js.map