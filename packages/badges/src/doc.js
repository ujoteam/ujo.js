// This file is just for documentation purposes

/**
 * the initializeBadges method provides an API for interacting with ujo patronage badges
 * @param {Object} ujoConfig - the config object returned by ujoInit @see [link]
 * @returns {Object} - an interface for interacting with badges
 *
 * @example
 * import ujoInit from 'ujo.js/config'
 * const ujoConfig = ujoInit('http://127.0.0.1:8545')
 * const ujoBadges = await initializeBadges(ujoConfig)
 */
export default async function initializeBadges(ujoConfig) {}

/**
 * getBadgeContract is a getter method for the ujo badges contract
 * @returns {Object} instance of the proxy ujo badges truffle contract
 *
 * @example
 * import ujoInit from 'ujo.js/config'
 * const ujoConfig = ujoInit(<Web3Provider>)
 * const ujoBadges = await initializeBadges(ujoConfig)
 * const badgeContract = ujoBadges.getBadgeContract()
 */
function getBadgeContract() {}
/**
 * getAllBadges is a getter method for every single badge in the proxy contract
 * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
 *
 * @example
 * import ujoInit from 'ujo.js/config'
 * const ujoConfig = ujoInit(<Web3Provider>)
 * const ujoBadges = await initializeBadges(ujoConfig)
 * const badges = await ujoBadges.getBadgeContract()
 */
function getAllBadges() {}

/**
 * getBadgesOwnedByAddress is a getter method for every single badge owned by ethereum address
 * @param {string} ethereumAddress - the ethereum address owner of returned badges
 * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
 *
 * @example
 * import ujoInit from 'ujo.js/config'
 * const ujoConfig = ujoInit(<Web3Provider>)
 * const ujoBadges = await initializeBadges(ujoConfig)
 * const badges = await ujoBadges.getBadgesOwnedByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac')
 */
function getBadgesOwnedByAddress() {}

/**
 * getBadgesMintedFor is a getter method for every single badge representing a unique id (in our case music group IPFS cid) by ethereum address
 * @param {string} uniqueId - the unique id that the badge represents (in our case it's an IPFS cid)
 * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
 *
 * @example
 * import ujoInit from 'ujo.js/config'
 * const ujoConfig = ujoInit(<Web3Provider>)
 * const ujoBadges = await initializeBadges(ujoConfig)
 * const badges = await ujoBadges.getBadgesMintedFor('zdpuAviMaYYFTBiW54TLV11h93mB1txF6zccoF5fKpu9nsub8')
 */
function getBadgesMintedFor() {}

// meant to get more information about the badges
// returns transaction receipt along with formatted badge data @ prop 'badge'
// const badge = await ujoBadges.getBadge()
// badge.data
// returns null if transaction has not been mined to chain yet
/**
 * getBadge is a getter method for a single badge
 * @param {string} txHash - the transaction hash of the badge minting
 * @returns {Promise<Object, Error>} a single badge object
 * @todo decide on this object ^^
 *
 * @example
 * import ujoInit from 'ujo.js/config'
 * const ujoConfig = ujoInit(<Web3Provider>)
 * const ujoBadges = await initializeBadges(ujoConfig)
 * const badge = await ujoBadges.getBadge('0xb8eedb9637e423b73df56f456d7a68161af281d0dce3ec4b2f3f977f28226b5e')
 */
function getBadge() {}

/*
  findEventData function notes

  Functions that need reference to closed over badge context
  ETHEREUM EVENT LOG PARALLELIZER
  instead of linearly going through ethereum and looking at the event logs of each block
  we go through many chunks of ethereum at the same time, and then join the results together

  This is for performance optimization:
  Instead of one call to `getPastEvents`, which looks like:
  [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
  ^              c h e c k   o n e   b l o c k   a t   a   t i m e                  ^
  start                                                                             end
  We do many chunks at the same time, where blocks are checked linearly in each chunk:

  [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []
  |-------------||-------------||-------------||-------------||-------------||-------|
  ^             ^^             ^^             ^^             ^^             ^^       ^
  blockIncrement blockIncrement blockIncrement blockIncrement blockIncrement finalIncrement
  Now, 6 simulataneous calls were made to `getPastEvents`, which is still O(n) time complexity
  but could make a significant difference in the future when ethereum gets extremely long
*/
