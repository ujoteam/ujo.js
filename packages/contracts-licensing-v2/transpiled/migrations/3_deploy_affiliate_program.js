"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const artifacts_1 = require("../util/artifacts");
const { LicenseCore, LicenseCoreTest, AffiliateProgram } = new artifacts_1.Artifacts(artifacts);
module.exports = (deployer, network) => {
    const licenseContract = network === 'test' ? LicenseCoreTest : LicenseCore;
    licenseContract.deployed().then((licenseContractInstance) => {
        deployer.deploy(AffiliateProgram, licenseContractInstance.address);
    });
};
//# sourceMappingURL=3_deploy_affiliate_program.js.map