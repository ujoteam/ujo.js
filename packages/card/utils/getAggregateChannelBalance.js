import BigNumber from "bignumber.js";

export function getAggregateChannelBalance(channelState, exchangeRate) {
  const wei = new BigNumber(channelState.balanceWeiUser)
  const token = new BigNumber(channelState.balanceTokenUser)
  const aggUSD = token.plus(
    wei.multipliedBy(exchangeRate)
  ).toFixed(0)
  return aggUSD.toString()
}