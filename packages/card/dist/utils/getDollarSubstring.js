"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDollarSubstring = getDollarSubstring;

var _bignumber = _interopRequireDefault(require("bignumber.js"));

function getDollarSubstring(string) {
  var temp = new _bignumber.default(string || "0");

  if (temp.isZero()) {
    return ["0", "00"];
  }

  temp = temp.multipliedBy(new _bignumber.default(10).exponentiatedBy(-18));
  var substring = temp.toString().split(".");

  if (substring.length === 1) {
    // temp is an integer
    substring.push("00");
  }

  return substring;
}
//# sourceMappingURL=getDollarSubstring.js.map