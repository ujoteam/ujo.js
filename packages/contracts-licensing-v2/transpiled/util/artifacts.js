"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Artifacts {
    constructor(artifacts) {
        this.Migrations = artifacts.require('Migrations');
        this.LicenseCore = artifacts.require('LicenseCore');
        this.LicenseCoreTest = artifacts.require('LicenseCoreTest');
        this.LicenseSale = artifacts.require('LicenseSale');
        this.LicenseOwnership = artifacts.require('LicenseOwnership');
        this.LicenseInventory = artifacts.require('LicenseInventory');
        this.LicenseBase = artifacts.require('LicenseBase');
        this.LicenseAccessControl = artifacts.require('LicenseAccessControl');
        this.ERC721 = artifacts.require('ERC721');
        this.SafeMath = artifacts.require('SafeMath');
        this.AffiliateProgram = artifacts.require('AffiliateProgram');
        this.MockTokenReceiver = artifacts.require('MockTokenReceiver');
    }
}
exports.Artifacts = Artifacts;
//# sourceMappingURL=artifacts.js.map