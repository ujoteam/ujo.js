"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _web = _interopRequireDefault(require("web3"));

var getWeb3 = function getWeb3() {
  return new Promise(function (resolve, reject) {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", function () {
      var web3 = window.web3; // Checking if Web3 has been injected by the browser (Mist/MetaMask).

      var alreadyInjected = typeof web3 !== "undefined";

      if (alreadyInjected) {
        // Use Mist/MetaMask's provider.
        web3 = new _web.default(web3.currentProvider);
        console.log("Injected web3 detected. Provider: ", web3.eth.currentProvider);
        resolve(web3);
      } else {
        // Fallback to localhost if no web3 injection. We've configured this to
        // use the development console's port by default.
        var provider = new _web.default.providers.HttpProvider("http://127.0.0.1:8545");
        web3 = new _web.default(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
  });
};

var _default = getWeb3;
exports.default = _default;
//# sourceMappingURL=getWeb3.js.map