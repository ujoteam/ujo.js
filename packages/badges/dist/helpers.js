"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertBadgeIdsToHex = convertBadgeIdsToHex;
exports.determineStartBlock = determineStartBlock;
exports.decodeTxData = void 0;

var _ethereumjsUtil = _interopRequireDefault(require("ethereumjs-util"));

var _arrayPrototype = _interopRequireDefault(require("array.prototype.flat"));

var _moment = _interopRequireDefault(require("moment"));

// Serializes the event data
var decodeTxData = function decodeTxData(eventData) {
  return (// flattens the array and then decodes the values
    (0, _arrayPrototype.default)(eventData).map(function (_ref) {
      var transactionHash = _ref.transactionHash,
          _ref$returnValues = _ref.returnValues,
          nftcid = _ref$returnValues.nftcid,
          timeMinted = _ref$returnValues.timeMinted;
      return [nftcid, _moment.default.unix(timeMinted.toString()).utc().format('MMMM Do, YYYY'), transactionHash];
    })
  );
};

exports.decodeTxData = decodeTxData;

function convertBadgeIdsToHex(badgeArray, padLeft) {
  return badgeArray.map(_ethereumjsUtil.default.intToHex).map(function (hexString) {
    return padLeft(hexString, 64);
  });
}

function determineStartBlock(networkId) {
  switch (Number(networkId)) {
    // if on mainnet, start event log search on block...
    case 1:
      return 6442621;
    // if on rinkeby, start event log search on block...

    case 4:
      return 3068896;
    // if not on mainnet or rinkeby just start on block 0

    default:
      return 0;
  }
}
//# sourceMappingURL=helpers.js.map