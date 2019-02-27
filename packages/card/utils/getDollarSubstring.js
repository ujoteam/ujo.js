import BigNumber from "bignumber.js";

export function getDollarSubstring (string) {
  let temp = new BigNumber(string || "0");
  if (temp.isZero()) {
    return ["0", "00"]
  }
  temp = temp.multipliedBy(new BigNumber(10).exponentiatedBy(-18));
  let substring = temp.toString().split(".");
  if (substring.length === 1) {
    // temp is an integer
    substring.push("00")
  }
  return substring;
}
