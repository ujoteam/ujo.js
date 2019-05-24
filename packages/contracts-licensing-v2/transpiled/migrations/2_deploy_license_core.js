"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const artifacts_1 = require("../util/artifacts");
const { LicenseCore, LicenseCoreTest, LicenseSale, LicenseOwnership, LicenseInventory, LicenseBase, LicenseAccessControl, ERC721, SafeMath, AffiliateProgram } = new artifacts_1.Artifacts(artifacts);
module.exports = (deployer, network) => {
    const licenseContract = network === 'test' ? LicenseCoreTest : LicenseCore;
    deployer.deploy(licenseContract);
};
//# sourceMappingURL=2_deploy_license_core.js.map