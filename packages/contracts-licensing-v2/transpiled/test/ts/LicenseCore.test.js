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
chai_setup_1.chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new artifacts_1.Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();
const web3 = global.web3;
contract('LicenseCore', (accounts) => {
    let token = null;
    const _creator = accounts[0];
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        token = yield LicenseCore.new({ from: _creator });
    }));
    it('should run now', () => __awaiter(this, void 0, void 0, function* () {
        // await LicenseCoreTest.deployed();
        expect(true).to.be.true();
    }));
    it('should not accept a value in the fallback function');
    describe('when upgrading the contract', () => __awaiter(this, void 0, void 0, function* () {
        it('should set a new address');
        it('should not allow an unpause');
    }));
});
//# sourceMappingURL=LicenseCore.test.js.map