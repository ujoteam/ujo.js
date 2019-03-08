"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dollarToWei = exports.boostGas = exports.getContractAddress = void 0;

var _web3Utils = require("web3-utils");

var getContractAddress = function getContractAddress(contractInterface, networkId) {
  var network = networkId.toString();
  return contractInterface.networks[network].address;
};
/**
 * Adds a 5% boost to the gas for web3 calls as to ensure tx's go through
 *
 * @param {string} gasRequired amount of gas required from `estimateGas`
 */


exports.getContractAddress = getContractAddress;

var boostGas = function boostGas(gasRequired) {
  var gasBoost = new _web3Utils.BN(gasRequired, 10).divRound(new _web3Utils.BN('20'));
  return new _web3Utils.BN(gasRequired, 10).add(gasBoost);
};

exports.boostGas = boostGas;

var dollarToWei = function dollarToWei(dollarAmount, exchangeRate) {
  return new _web3Utils.BN('1000000000000000000', 10).divRound(new _web3Utils.BN(exchangeRate, 10)).mul(new _web3Utils.BN(dollarAmount, 10));
};

exports.dollarToWei = dollarToWei;
//# sourceMappingURL=index.js.map