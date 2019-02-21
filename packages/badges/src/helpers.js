import ethUtil from 'ethereumjs-util';
import flat from 'array.prototype.flat';
import moment from 'moment';

// Serializes the event data
export const decodeTxData = eventData =>
  // flattens the array and then decodes the values
  flat(eventData).map(({ transactionHash, returnValues: { nftcid, timeMinted } }) => [
    nftcid,
    moment
      .unix(timeMinted.toString())
      .utc()
      .format('MMMM Do, YYYY'),
    transactionHash,
  ]);

export function convertBadgeIdsToHex(badgeArray, padLeft) {
  return badgeArray.map(ethUtil.intToHex).map(hexString => padLeft(hexString, 64));
}

export function determineStartBlock(networkId) {
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
