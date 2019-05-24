"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const dirtyChai = require("dirty-chai");
const ChaiBigNumber = require("chai-bignumber");
const chaiAsPromised = require("chai-as-promised");
exports.chaiSetup = {
    configure() {
        chai.config.includeStack = true;
        chai.use(ChaiBigNumber());
        chai.use(dirtyChai);
        chai.use(chaiAsPromised);
    },
};
//# sourceMappingURL=chai_setup.js.map