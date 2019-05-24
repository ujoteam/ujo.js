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
const eventByName_1 = require("../helpers/eventByName");
const increaseTime_1 = require("../helpers/increaseTime");
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest, AffiliateProgram, MockTokenReceiver } = new artifacts_1.Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();
const web3 = global.web3;
contract('LicenseOwnership (ERC721)', (accounts) => {
    let token = null;
    const creator = accounts[0];
    const _creator = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const owner = accounts[4];
    const user4 = accounts[7];
    const user5 = accounts[8];
    const operator = accounts[9];
    const _zeroethTokenId = 0;
    const _firstTokenId = 1;
    const _secondTokenId = 2;
    const _unknownTokenId = 312389234752;
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
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        token = yield LicenseCore.new({ from: creator });
        yield token.transferOwnership(owner, { from: creator });
        yield token.createProduct(firstProduct.id, firstProduct.price, firstProduct.initialInventory, firstProduct.supply, firstProduct.interval, { from: owner });
        yield token.createProduct(secondProduct.id, secondProduct.price, secondProduct.initialInventory, secondProduct.supply, secondProduct.interval, { from: owner });
        yield token.setTokenMetadataBaseURI('http://localhost/', { from: owner });
        yield token.unpause({ from: owner });
        yield token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price
        });
        yield token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price
        });
        yield token.purchase(secondProduct.id, 1, user2, ZERO_ADDRESS, {
            from: user1,
            value: secondProduct.price
        });
    }));
    describe('name', () => __awaiter(this, void 0, void 0, function* () {
        it('it has a name', () => __awaiter(this, void 0, void 0, function* () {
            const name = yield token.name();
            name.should.be.eq('Ujo');
        }));
    }));
    describe('symbol', () => __awaiter(this, void 0, void 0, function* () {
        it('it has a symbol', () => __awaiter(this, void 0, void 0, function* () {
            const symbol = yield token.symbol();
            symbol.should.be.eq('UJO');
        }));
    }));
    describe('when detecting implementations', () => __awaiter(this, void 0, void 0, function* () {
        it('it implementsERC721', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.implementsERC721()).should.be.true();
        }));
    }));
    describe('totalSupply', () => __awaiter(this, void 0, void 0, function* () {
        it('has a total supply equivalent to the inital supply', () => __awaiter(this, void 0, void 0, function* () {
            const totalSupply = yield token.totalSupply();
            totalSupply.should.be.bignumber.equal(3);
        }));
    }));
    describe('balanceOf', () => __awaiter(this, void 0, void 0, function* () {
        describe('when the given address owns some tokens', () => __awaiter(this, void 0, void 0, function* () {
            it('returns the amount of tokens owned by the given address', () => __awaiter(this, void 0, void 0, function* () {
                const balance = yield token.balanceOf(user1);
                balance.should.be.bignumber.equal(2);
            }));
        }));
        describe('when the given address does not own any tokens', () => __awaiter(this, void 0, void 0, function* () {
            it('returns 0', () => __awaiter(this, void 0, void 0, function* () {
                const balance = yield token.balanceOf(user3);
                balance.should.be.bignumber.equal(0);
            }));
        }));
    }));
    describe('ownerOf', () => __awaiter(this, void 0, void 0, function* () {
        describe('when the given token ID was tracked by this token', () => __awaiter(this, void 0, void 0, function* () {
            it('returns the owner of the given token ID', () => __awaiter(this, void 0, void 0, function* () {
                const owner = yield token.ownerOf(_firstTokenId);
                owner.should.be.equal(user1);
            }));
        }));
        describe('when the given token ID was not tracked by this token', () => __awaiter(this, void 0, void 0, function* () {
            it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.ownerOf(_unknownTokenId));
            }));
        }));
    }));
    describe('tokenMetadataBaseURI', () => __awaiter(this, void 0, void 0, function* () {
        it('should return the base URL', () => __awaiter(this, void 0, void 0, function* () {
            const baseUrl = yield token.tokenMetadataBaseURI();
            baseUrl.should.be.equal('http://localhost/');
        }));
    }));
    describe('minting', () => {
        describe('when the given token ID was not tracked by this contract', () => {
            describe('when the given address is not the zero address', () => {
                const to = user1;
                it('mints the given token ID to the given address', () => __awaiter(this, void 0, void 0, function* () {
                    const previousBalance = yield token.balanceOf(to);
                    const { logs } = yield token.purchase(secondProduct.id, 1, to, ZERO_ADDRESS, {
                        from: to,
                        value: secondProduct.price
                    });
                    const transferEvent = eventByName_1.default(logs, 'Transfer');
                    const tokenId = transferEvent.args._tokenId;
                    const owner = yield token.ownerOf(tokenId);
                    owner.should.be.equal(to);
                    const balance = yield token.balanceOf(to);
                    balance.should.be.bignumber.equal(previousBalance.toNumber() + 1);
                }));
                it('adds that token to the token list of the owner', () => __awaiter(this, void 0, void 0, function* () {
                    const { logs } = yield token.purchase(secondProduct.id, 1, user3, ZERO_ADDRESS, {
                        from: user1,
                        value: secondProduct.price
                    });
                    const transferEvent = eventByName_1.default(logs, 'Transfer');
                    const tokenId = transferEvent.args._tokenId;
                    const tokens = yield token.tokensOf(user3);
                    tokens.length.should.be.equal(1);
                    tokens[0].should.be.bignumber.equal(tokenId);
                }));
                it('emits a transfer event', () => __awaiter(this, void 0, void 0, function* () {
                    const { logs } = yield token.purchase(secondProduct.id, 1, to, ZERO_ADDRESS, {
                        from: user1,
                        value: secondProduct.price
                    });
                    logs.length.should.be.equal(2);
                    logs[1].event.should.be.eq('Transfer');
                    logs[1].args._from.should.be.equal(ZERO_ADDRESS);
                    logs[1].args._to.should.be.equal(to);
                    // logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                }));
            });
            describe('when the given address is the zero address', () => {
                const to = ZERO_ADDRESS;
                it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.purchase(secondProduct.id, 1, to, ZERO_ADDRESS, {
                        from: user1,
                        value: secondProduct.price
                    }));
                }));
            });
        });
    });
    describe('transfer', () => {
        describe('when the address to transfer the token to is not the zero address', () => {
            const to = user3;
            describe('when the given token ID was tracked by this token', () => {
                const tokenId = _firstTokenId;
                describe('when the msg.sender is the owner of the given token ID', () => {
                    const sender = user1;
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        const originalOwner = yield token.ownerOf(tokenId);
                        originalOwner.should.be.equal(sender);
                    }));
                    it('transfers the ownership of the given token ID to the given address', () => __awaiter(this, void 0, void 0, function* () {
                        yield token.transfer(to, tokenId, { from: sender });
                        const newOwner = yield token.ownerOf(tokenId);
                        newOwner.should.be.equal(to);
                    }));
                    it('clears the approval for the token ID', () => __awaiter(this, void 0, void 0, function* () {
                        yield token.approve(user2, tokenId, { from: sender });
                        (yield token.getApproved(tokenId)).should.be.equal(user2);
                        yield token.transfer(to, tokenId, { from: sender });
                        const approvedAccount = yield token.getApproved(tokenId);
                        approvedAccount.should.be.equal(ZERO_ADDRESS);
                    }));
                    it('emits an approval and transfer events', () => __awaiter(this, void 0, void 0, function* () {
                        const { logs } = yield token.transfer(to, tokenId, {
                            from: sender
                        });
                        logs.length.should.be.equal(2);
                        logs[0].event.should.be.eq('Approval');
                        logs[0].args._owner.should.be.equal(sender);
                        logs[0].args._approved.should.be.equal(ZERO_ADDRESS);
                        logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                        logs[1].event.should.be.eq('Transfer');
                        logs[1].args._from.should.be.equal(sender);
                        logs[1].args._to.should.be.equal(to);
                        logs[1].args._tokenId.should.be.bignumber.equal(tokenId);
                    }));
                    it('adjusts owners balances', () => __awaiter(this, void 0, void 0, function* () {
                        const previousBalance = yield token.balanceOf(sender);
                        yield token.transfer(to, tokenId, { from: sender });
                        const newOwnerBalance = yield token.balanceOf(to);
                        newOwnerBalance.should.be.bignumber.equal(1);
                        const previousOwnerBalance = yield token.balanceOf(sender);
                        previousOwnerBalance.should.be.bignumber.equal(previousBalance - 1);
                    }));
                    it('adds the token to the tokens list of the new owner', () => __awaiter(this, void 0, void 0, function* () {
                        yield token.transfer(to, tokenId, { from: sender });
                        const tokenIDs = yield token.tokensOf(to);
                        tokenIDs.length.should.be.equal(1);
                        tokenIDs[0].should.be.bignumber.equal(tokenId);
                    }));
                    describe('when it is paused', () => __awaiter(this, void 0, void 0, function* () {
                        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                            yield token.pause({ from: owner });
                        }));
                        it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                            yield assertRevert_1.default(token.transfer(to, tokenId, { from: sender }));
                        }));
                    }));
                });
                describe('when the msg.sender is not the owner of the given token ID', () => {
                    const sender = user2;
                    it('reverts when trying to send to someone else', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.transfer(to, tokenId, { from: sender }));
                    }));
                    it('reverts when trying to send to itself', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.transfer(sender, tokenId, { from: sender }));
                    }));
                });
            });
            describe('when the given token ID was not tracked by this token', () => {
                const tokenId = _unknownTokenId;
                it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.transfer(to, tokenId, { from: _creator }));
                }));
            });
        });
        describe('when the address to transfer the token to is the zero address', () => {
            const to = ZERO_ADDRESS;
            it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.transfer(to, 0, { from: _creator }));
            }));
        });
    });
    describe('approve', () => {
        describe('when the given token ID was already tracked by this contract', () => {
            const tokenId = _firstTokenId;
            describe('when the sender owns the given token ID', () => {
                const sender = user1;
                describe('when the address that receives the approval is the 0 address', () => {
                    const to = ZERO_ADDRESS;
                    describe('when there was no approval for the given token ID before', () => {
                        it('clears the approval for that token', () => __awaiter(this, void 0, void 0, function* () {
                            yield token.approve(to, tokenId, { from: sender });
                            const approvedAccount = yield token.getApproved(tokenId);
                            approvedAccount.should.be.equal(to);
                        }));
                        it('does not emit an approval event', () => __awaiter(this, void 0, void 0, function* () {
                            const { logs } = yield token.approve(to, tokenId, {
                                from: sender
                            });
                            logs.length.should.be.equal(0);
                        }));
                    });
                    describe('when the given token ID was approved for another account', () => {
                        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                            yield token.approve(user4, tokenId, { from: sender });
                        }));
                        it('clears the approval for the token ID', () => __awaiter(this, void 0, void 0, function* () {
                            yield token.approve(to, tokenId, { from: sender });
                            const approvedAccount = yield token.getApproved(tokenId);
                            approvedAccount.should.be.equal(to);
                        }));
                        it('emits an approval event', () => __awaiter(this, void 0, void 0, function* () {
                            const { logs } = yield token.approve(to, tokenId, {
                                from: sender
                            });
                            logs.length.should.be.equal(1);
                            logs[0].event.should.be.eq('Approval');
                            logs[0].args._owner.should.be.equal(sender);
                            logs[0].args._approved.should.be.equal(to);
                            logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                        }));
                    });
                });
                describe('when the address that receives the approval is not the 0 address', () => {
                    describe('when the address that receives the approval is different than the owner', () => {
                        const to = user3;
                        describe('when there was no approval for the given token ID before', () => {
                            it('approves the token ID to the given address', () => __awaiter(this, void 0, void 0, function* () {
                                yield token.approve(to, tokenId, { from: sender });
                                const approvedAccount = yield token.getApproved(tokenId);
                                approvedAccount.should.be.equal(to);
                            }));
                            it('emits an approval event', () => __awaiter(this, void 0, void 0, function* () {
                                const { logs } = yield token.approve(to, tokenId, {
                                    from: sender
                                });
                                logs.length.should.be.equal(1);
                                logs[0].event.should.be.eq('Approval');
                                logs[0].args._owner.should.be.equal(sender);
                                logs[0].args._approved.should.be.equal(to);
                                logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                            }));
                        });
                        describe('when the given token ID was approved for the same account', () => {
                            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                                yield token.approve(to, tokenId, { from: sender });
                            }));
                            it('keeps the approval to the given address', () => __awaiter(this, void 0, void 0, function* () {
                                yield token.approve(to, tokenId, { from: sender });
                                const approvedAccount = yield token.getApproved(tokenId);
                                approvedAccount.should.be.equal(to);
                            }));
                            it('emits an approval event', () => __awaiter(this, void 0, void 0, function* () {
                                const { logs } = yield token.approve(to, tokenId, {
                                    from: sender
                                });
                                logs.length.should.be.equal(1);
                                logs[0].event.should.be.eq('Approval');
                                logs[0].args._owner.should.be.equal(sender);
                                logs[0].args._approved.should.be.equal(to);
                                logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                            }));
                        });
                        describe('when the given token ID was approved for another account', () => {
                            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                                yield token.approve(user4, tokenId, { from: sender });
                            }));
                            it('changes the approval to the given address', () => __awaiter(this, void 0, void 0, function* () {
                                yield token.approve(to, tokenId, { from: sender });
                                const approvedAccount = yield token.getApproved(tokenId);
                                approvedAccount.should.be.equal(to);
                            }));
                            it('emits an approval event', () => __awaiter(this, void 0, void 0, function* () {
                                const { logs } = yield token.approve(to, tokenId, {
                                    from: sender
                                });
                                logs.length.should.be.equal(1);
                                logs[0].event.should.be.eq('Approval');
                                logs[0].args._owner.should.be.equal(sender);
                                logs[0].args._approved.should.be.equal(to);
                                logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                            }));
                        });
                    });
                    describe('when the address that receives the approval is the owner', () => {
                        const to = user1;
                        describe('when there was no approval for the given token ID before', () => {
                            it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                                yield assertRevert_1.default(token.approve(to, tokenId, { from: sender }));
                            }));
                        });
                        describe('when the given token ID was approved for another account', () => {
                            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                                yield token.approve(user2, tokenId, { from: sender });
                            }));
                            it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                                yield assertRevert_1.default(token.approve(to, tokenId, { from: sender }));
                            }));
                        });
                    });
                });
            });
            describe('when the sender does not own the given token ID', () => {
                const sender = user2;
                it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.approve(user3, tokenId, { from: sender }));
                }));
            });
        });
        describe('when the given token ID was not tracked by the contract before', () => {
            const tokenId = _unknownTokenId;
            it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.approve(user2, tokenId, { from: _creator }));
            }));
        });
    });
    describe('approveAll', () => __awaiter(this, void 0, void 0, function* () {
        describe('when the sender approves an operator', () => __awaiter(this, void 0, void 0, function* () {
            const tokenId = _firstTokenId; // owned by user1
            let approvalEvent;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                const { logs } = yield token.approveAll(operator, { from: user1 });
                approvalEvent = eventByName_1.default(logs, 'ApprovalForAll');
            }));
            it('should emit an ApprovalForAll event', () => __awaiter(this, void 0, void 0, function* () {
                approvalEvent.args._owner.should.be.equal(user1);
                approvalEvent.args._operator.should.be.equal(operator);
                approvalEvent.args._approved.should.be.true();
            }));
            describe('and the operator is the sender', () => __awaiter(this, void 0, void 0, function* () {
                const sender = operator;
                it('should allow the operator to take ownership of a token with takeOwnership', () => __awaiter(this, void 0, void 0, function* () {
                    const originalOwner = yield token.ownerOf(tokenId);
                    originalOwner.should.be.equal(user1);
                    yield token.takeOwnership(tokenId, { from: operator });
                    const newOwner = yield token.ownerOf(tokenId);
                    newOwner.should.be.equal(operator);
                }));
                it('should allow the operator to transfer ownership to someone else with transferFrom', () => __awaiter(this, void 0, void 0, function* () {
                    const originalOwner = yield token.ownerOf(tokenId);
                    originalOwner.should.be.equal(user1);
                    yield token.transferFrom(user1, user3, tokenId, { from: operator });
                    const newOwner = yield token.ownerOf(tokenId);
                    newOwner.should.be.equal(user3);
                }));
                it('should read that the operator is approved', () => __awaiter(this, void 0, void 0, function* () {
                    const isApproved = yield token.isApprovedForAll(user1, operator, {
                        from: operator
                    });
                    isApproved.should.be.true();
                }));
                describe('and the user has subsequently disapproved the operator', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        const { logs } = yield token.disapproveAll(operator, {
                            from: user1
                        });
                        approvalEvent = eventByName_1.default(logs, 'ApprovalForAll');
                    }));
                    it('should emit an ApprovalForAll event', () => __awaiter(this, void 0, void 0, function* () {
                        approvalEvent.args._owner.should.be.equal(user1);
                        approvalEvent.args._operator.should.be.equal(operator);
                        approvalEvent.args._approved.should.be.false();
                    }));
                    it('should not allow the operator to takeOwnership', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.takeOwnership(tokenId, { from: operator }));
                    }));
                    it('should not allow the operator to use transferFrom', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.transferFrom(user1, user3, tokenId, { from: operator }));
                    }));
                    it('should read that the operator is not approved', () => __awaiter(this, void 0, void 0, function* () {
                        const isApproved = yield token.isApprovedForAll(user1, operator, {
                            from: operator
                        });
                        isApproved.should.be.false();
                    }));
                    describe('and a rando tries to send too', () => __awaiter(this, void 0, void 0, function* () {
                        it('should not allow a rando to takeOwnership', () => __awaiter(this, void 0, void 0, function* () {
                            yield assertRevert_1.default(token.takeOwnership(tokenId, { from: user2 }));
                        }));
                        it('should not allow a rando to transferFrom', () => __awaiter(this, void 0, void 0, function* () {
                            yield assertRevert_1.default(token.transferFrom(user1, user3, tokenId, { from: user2 }));
                        }));
                    }));
                }));
            }));
            describe('and a rando is the sender', () => __awaiter(this, void 0, void 0, function* () {
                it('should not allow a rando to takeOwnership', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.takeOwnership(tokenId, { from: user2 }));
                }));
                it('should not allow a rando to transferFrom', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.transferFrom(user1, user3, tokenId, { from: user2 }));
                }));
            }));
        }));
    }));
    describe('setApprovalForAll', () => __awaiter(this, void 0, void 0, function* () {
        describe('when approving and disapproving', () => __awaiter(this, void 0, void 0, function* () {
            it('should set approval appropriately', () => __awaiter(this, void 0, void 0, function* () {
                (yield token.isApprovedForAll(user1, operator, {
                    from: operator
                })).should.be.false();
                yield token.setApprovalForAll(operator, true, { from: user1 });
                (yield token.isApprovedForAll(user1, operator, {
                    from: operator
                })).should.be.true();
                yield token.setApprovalForAll(operator, false, { from: user1 });
                (yield token.isApprovedForAll(user1, operator, {
                    from: operator
                })).should.be.false();
            }));
        }));
    }));
    describe('takeOwnership', () => {
        describe('when the given token ID was already tracked by this contract', () => {
            const tokenId = _firstTokenId;
            describe('when the sender has the approval for the token ID', () => {
                const sender = user3;
                const approver = user1;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    yield token.approve(sender, tokenId, { from: approver });
                }));
                it('transfers the ownership of the given token ID to the given address', () => __awaiter(this, void 0, void 0, function* () {
                    yield token.takeOwnership(tokenId, { from: sender });
                    const newOwner = yield token.ownerOf(tokenId);
                    newOwner.should.be.equal(sender);
                }));
                it('clears the approval for the token ID', () => __awaiter(this, void 0, void 0, function* () {
                    yield token.takeOwnership(tokenId, { from: sender });
                    const approvedAccount = yield token.getApproved(tokenId);
                    approvedAccount.should.be.equal(ZERO_ADDRESS);
                }));
                it('emits an approval and transfer events', () => __awaiter(this, void 0, void 0, function* () {
                    const { logs } = yield token.takeOwnership(tokenId, { from: sender });
                    logs.length.should.be.equal(2);
                    logs[0].event.should.be.eq('Approval');
                    logs[0].args._owner.should.be.equal(approver);
                    logs[0].args._approved.should.be.equal(ZERO_ADDRESS);
                    logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
                    logs[1].event.should.be.eq('Transfer');
                    logs[1].args._from.should.be.equal(approver);
                    logs[1].args._to.should.be.equal(sender);
                    logs[1].args._tokenId.should.be.bignumber.equal(tokenId);
                }));
                it('adjusts owners balances', () => __awaiter(this, void 0, void 0, function* () {
                    const previousBalance = yield token.balanceOf(approver);
                    yield token.takeOwnership(tokenId, { from: sender });
                    const newOwnerBalance = yield token.balanceOf(sender);
                    newOwnerBalance.should.be.bignumber.equal(1);
                    const previousOwnerBalance = yield token.balanceOf(approver);
                    previousOwnerBalance.should.be.bignumber.equal(previousBalance - 1);
                }));
                it('adds the token to the tokens list of the new owner', () => __awaiter(this, void 0, void 0, function* () {
                    yield token.takeOwnership(tokenId, { from: sender });
                    const tokenIDs = yield token.tokensOf(sender);
                    tokenIDs.length.should.be.equal(1);
                    tokenIDs[0].should.be.bignumber.equal(tokenId);
                }));
                describe('when the token is being transferred to a third party', () => __awaiter(this, void 0, void 0, function* () {
                    it('should transfer the token');
                }));
            });
            describe('when the sender does not have an approval for the token ID', () => {
                const sender = user2;
                it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.takeOwnership(tokenId, { from: sender }));
                }));
                describe('and the token is being transferred to a third party', () => __awaiter(this, void 0, void 0, function* () {
                    it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.transferFrom(user1, user2, tokenId, { from: sender }));
                    }));
                }));
            });
            describe('when the sender is already the owner of the token', () => {
                const sender = user1;
                it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.takeOwnership(tokenId, { from: sender }));
                }));
            });
        });
        describe('when the given token ID was not tracked by the contract before', () => {
            const tokenId = _unknownTokenId;
            it('reverts', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.takeOwnership(tokenId, { from: user1 }));
            }));
        });
    });
    describe('when checking token metadata', () => __awaiter(this, void 0, void 0, function* () {
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            yield token.purchase(secondProduct.id, 1, user1, ZERO_ADDRESS, {
                from: user1,
                value: secondProduct.price
            });
        }));
        it('should have a metadata URL', () => __awaiter(this, void 0, void 0, function* () {
            const tokenId = _firstTokenId;
            let url = yield token.tokenURI(tokenId);
            url.should.be.equal('http://localhost/1');
        }));
    }));
    describe('tokenByIndex', () => __awaiter(this, void 0, void 0, function* () {
        it('should return the tokenId', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.tokenByIndex(0)).should.be.bignumber.equal(0);
            (yield token.tokenByIndex(1)).should.be.bignumber.equal(1);
            (yield token.tokenByIndex(2)).should.be.bignumber.equal(2);
        }));
        it('should revert if requesting greater than the supply', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.tokenByIndex(3));
        }));
    }));
    describe('tokenOfOwnerByIndex', () => __awaiter(this, void 0, void 0, function* () {
        it('should return the tokenId', () => __awaiter(this, void 0, void 0, function* () {
            (yield token.tokenOfOwnerByIndex(user1, 0)).should.be.bignumber.equal(0);
            (yield token.tokenOfOwnerByIndex(user1, 1)).should.be.bignumber.equal(1);
            (yield token.tokenOfOwnerByIndex(user2, 0)).should.be.bignumber.equal(2);
        }));
        it('should revert if the index greater than this users balance', () => __awaiter(this, void 0, void 0, function* () {
            yield assertRevert_1.default(token.tokenOfOwnerByIndex(user1, 2));
            yield assertRevert_1.default(token.tokenOfOwnerByIndex(user2, 1));
            yield assertRevert_1.default(token.tokenOfOwnerByIndex(operator, 0));
        }));
    }));
    describe('safeTransferFrom', () => __awaiter(this, void 0, void 0, function* () {
        let tokenReceiver;
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            tokenReceiver = yield MockTokenReceiver.new({ from: creator });
        }));
        describe('when the sender is the owner', () => __awaiter(this, void 0, void 0, function* () {
            const sender = user1;
            const tokenId = _firstTokenId;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                const originalOwner = yield token.ownerOf(tokenId);
                originalOwner.should.be.equal(sender);
            }));
            describe('and the receiver is a normal address', () => __awaiter(this, void 0, void 0, function* () {
                it('should work', () => __awaiter(this, void 0, void 0, function* () {
                    yield token.safeTransferFrom(sender, user2, tokenId, {
                        from: sender
                    });
                    const newOwner = yield token.ownerOf(tokenId);
                    newOwner.should.be.equal(user2);
                }));
            }));
            describe("and the receiver is a contract that doesn't support onTokenReceived", () => __awaiter(this, void 0, void 0, function* () {
                let affiliateProgram;
                beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                    affiliateProgram = yield AffiliateProgram.new(token.address, {
                        from: creator
                    });
                }));
                it('should not work', () => __awaiter(this, void 0, void 0, function* () {
                    yield assertRevert_1.default(token.safeTransferFrom(sender, affiliateProgram.address, tokenId, {
                        from: sender
                    }));
                }));
            }));
            describe('and the receiver supports receiving tokens', () => __awaiter(this, void 0, void 0, function* () {
                it('should transfer the tokens', () => __awaiter(this, void 0, void 0, function* () {
                    yield token.safeTransferFrom(sender, tokenReceiver.address, tokenId, {
                        from: sender
                    });
                    const newOwner = yield token.ownerOf(tokenId);
                    newOwner.should.be.equal(tokenReceiver.address);
                }));
                describe('and the contract is paused', () => __awaiter(this, void 0, void 0, function* () {
                    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                        yield token.pause({ from: owner });
                    }));
                    it('should not work', () => __awaiter(this, void 0, void 0, function* () {
                        yield assertRevert_1.default(token.safeTransferFrom(sender, tokenReceiver.address, tokenId, {
                            from: sender
                        }));
                    }));
                }));
            }));
        }));
        describe('when the sender is the operator', () => __awaiter(this, void 0, void 0, function* () {
            const tokenId = _firstTokenId; // owned by user1
            const sender = operator;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                const originalOwner = yield token.ownerOf(tokenId);
                originalOwner.should.be.equal(user1);
                yield token.approveAll(operator, { from: user1 });
            }));
            it('should transfer the tokens', () => __awaiter(this, void 0, void 0, function* () {
                yield token.safeTransferFrom(user1, tokenReceiver.address, tokenId, {
                    from: sender
                });
                const newOwner = yield token.ownerOf(tokenId);
                newOwner.should.be.equal(tokenReceiver.address);
            }));
        }));
        describe('when the sender is specifically approved', () => __awaiter(this, void 0, void 0, function* () {
            const tokenId = _firstTokenId; // owned by user1
            const sender = user2;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                const originalOwner = yield token.ownerOf(tokenId);
                originalOwner.should.be.equal(user1);
                yield token.approve(user2, tokenId, { from: user1 });
            }));
            it('should transfer the tokens', () => __awaiter(this, void 0, void 0, function* () {
                yield token.safeTransferFrom(user1, tokenReceiver.address, tokenId, {
                    from: sender
                });
                const newOwner = yield token.ownerOf(tokenId);
                newOwner.should.be.equal(tokenReceiver.address);
            }));
        }));
        describe('when the sender is a rando', () => __awaiter(this, void 0, void 0, function* () {
            const tokenId = _firstTokenId; // owned by user1
            const sender = user3;
            let originalOwner;
            beforeEach(() => __awaiter(this, void 0, void 0, function* () {
                originalOwner = yield token.ownerOf(tokenId);
                originalOwner.should.be.equal(user1);
            }));
            it('should not be allowed', () => __awaiter(this, void 0, void 0, function* () {
                yield assertRevert_1.default(token.safeTransferFrom(user1, tokenReceiver.address, tokenId, {
                    from: sender
                }));
                originalOwner.should.be.equal(user1);
            }));
        }));
    }));
});
//# sourceMappingURL=LicenseOwnership.test.js.map