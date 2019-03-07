"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ujoStorage;

var _axios = _interopRequireDefault(require("axios"));

/*

The point of this file is to separate out the fetching of off-chain data

This file just serves as a placeholder for how that could potentially work

right now the provider passed in will set some interal private variables,
used to fetch specific data from the storage provider

*/
function ujoStorage(provider) {
  var storageProvider;
  var endpoint;
  var params;
  if (!provider) storageProvider = 'ipfs' || provider.toLowerCase();

  switch (storageProvider) {
    case 'ipfs':
      endpoint = 'https://ipfs.infura.io:5001';
      params = 'api/v0/dag/get?arg';
      break;

    default:
      endpoint = 'https://ipfs.infura.io:5001';
      params = 'api/v0/dag/get?arg';
  }

  return {
    fetchMetadataByQueryParameter: function fetchMetadataByQueryParameter(queryParam) {
      return _axios.default.get("".concat(endpoint, "/").concat(params, "=").concat(queryParam));
    }
  };
}
//# sourceMappingURL=ujoStorage.js.map