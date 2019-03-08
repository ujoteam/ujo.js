"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAggregateChannelBalance = getAggregateChannelBalance;

var _bignumber = _interopRequireDefault(require("bignumber.js"));

function getAggregateChannelBalance(channelState, exchangeRate) {
  var wei = new _bignumber.default(channelState.balanceWeiUser);
  var token = new _bignumber.default(channelState.balanceTokenUser);
  var aggUSD = token.plus(wei.multipliedBy(exchangeRate)).toFixed(0);
  return aggUSD.toString();
}
//# sourceMappingURL=getAggregateChannelBalance.js.map