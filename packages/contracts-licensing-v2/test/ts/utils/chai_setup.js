"use strict";
exports.__esModule = true;
var chai = require("chai");
var dirtyChai = require("dirty-chai");
var ChaiBigNumber = require("chai-bignumber");
var chaiAsPromised = require("chai-as-promised");
exports.chaiSetup = {
    configure: function () {
        chai.config.includeStack = true;
        chai.use(ChaiBigNumber());
        chai.use(dirtyChai);
        chai.use(chaiAsPromised);
    }
};
