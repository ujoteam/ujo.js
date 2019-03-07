"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _moment = _interopRequireDefault(require("moment"));

var _dist = require("../../utils/dist");

var _contractsBadges = require("../../contracts-badges");

var _helpers = require("./helpers");

var Badges =
/*#__PURE__*/
function () {
  function Badges() {
    (0, _classCallCheck2.default)(this, Badges);
    this.web3 = {};
    this.getExchangeRate =
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee() {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    this.getBlockNumber =
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee2() {
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    this.networkId = '';
  }
  /**
   * the init method provides an API for interacting with ujo patronage badges
   * @param {Object} ujoConfig - the config object returned by init @see [link]
   * @returns {Object} - an interface for interacting with badges
   */


  (0, _createClass2.default)(Badges, [{
    key: "init",
    value: function () {
      var _init = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(config) {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.web3 = config.web3;
                _context3.next = 3;
                return config.getNetwork();

              case 3:
                this.networkId = _context3.sent;
                this.badgesProxyAddress = (0, _dist.getContractAddress)(_contractsBadges.UjoPatronageBadges, this.networkId);
                this.badgeContract = new this.web3.eth.Contract(_contractsBadges.UjoPatronageBadgesFunctions.abi, this.badgesProxyAddress); // Sample storage provider setup

                this.storageProvider = config.storageProvider; // Cached functions that need to be executed at runtime

                this.getBlockNumber = config.getBlockNumber;
                this.getExchangeRate = config.getExchangeRate;
                this.getTransactionReceipt = config.getTransactionReceipt;

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function init(_x) {
        return _init.apply(this, arguments);
      }

      return init;
    }()
    /**
     * findEventData
     * @param {string} tokenIds - indexed parameter to filter event logs on
     * @param {string} blocksPerWindow - the number of blocks you want to scan per window
     * @param {string} startBlock - where in the blockchain we start scanning from
     * @param {string} endBlock - w
     * @returns {Object} - an interface for interacting with badges
     */

  }, {
    key: "findEventData",
    value: function () {
      var _findEventData = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4(tokenIds) {
        var _this = this;

        var endBlock, startBlock, blocksPerWindow, windows;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this.badgeContract) {
                  _context4.next = 8;
                  break;
                }

                _context4.next = 3;
                return this.getBlockNumber();

              case 3:
                endBlock = _context4.sent;
                startBlock = (0, _helpers.determineStartBlock)(this.networkId);
                blocksPerWindow = 5000; // create an array to store parallelized calls to ethereum block chunks

                windows = new Array(Math.ceil((endBlock - startBlock) / blocksPerWindow)).fill(); // all of these calls get invoked at one after the other, but the entire promise
                // will not resolve until all have completed

                return _context4.abrupt("return", Promise.all(windows.map(function (_, idx) {
                  // TODO - Explain why the from and to blocks are different if you're at the first index
                  var fromBlock = idx === 0 ? startBlock : startBlock + blocksPerWindow * idx + 1;
                  var toBlock = idx === 0 ? startBlock + blocksPerWindow : startBlock + blocksPerWindow * (idx + 1);
                  var options = {
                    filter: {
                      tokenId: tokenIds
                    },
                    // tokenId is an indexed parameter in the smart contract
                    fromBlock: fromBlock.toString(),
                    toBlock: toBlock.toString()
                  }; // issue the event logs request to ethereum

                  return _this.badgeContract.getPastEvents('LogBadgeMinted', options);
                })));

              case 8:
                return _context4.abrupt("return", new Error({
                  error: 'Attempted to get badge data with no smart contract'
                }));

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function findEventData(_x2) {
        return _findEventData.apply(this, arguments);
      }

      return findEventData;
    }()
  }, {
    key: "getBadges",
    value: function () {
      var _getBadges = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5(tokenIds) {
        var encodedTxData, eventData;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.findEventData(tokenIds);

              case 2:
                encodedTxData = _context5.sent;
                // reformats tx data to be useful for clients and/or storage layer
                eventData = (0, _helpers.decodeTxData)(encodedTxData);
                return _context5.abrupt("return", eventData);

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getBadges(_x3) {
        return _getBadges.apply(this, arguments);
      }

      return getBadges;
    }()
    /* this function takes a badge in the format given back by getBadges
    [
      <String> unique identifier (in our case cid)
      <String> time minted
      <String> txHash
    ]
     takes the unique identifier (badge[0] is cid), and gets the badge metadata from the storage provider
    reformats the badgemetadata for the api spec
    */

  }, {
    key: "getBadgeMetadata",
    value: function () {
      var _getBadgeMetadata = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee6(badge) {
        var _ref3, data;

        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.storageProvider.fetchMetadataByQueryParameter(badge[0]);

              case 2:
                _ref3 = _context6.sent;
                data = _ref3.data;
                return _context6.abrupt("return", data);

              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getBadgeMetadata(_x4) {
        return _getBadgeMetadata.apply(this, arguments);
      }

      return getBadgeMetadata;
    }()
    /**
     * getAllBadges is a getter method for every single badge in the proxy contract
     * @returns {Promise<Object[], Error>} an array of badges.
     * See {@link getBadge} for what each badge looks like in the returned array
     */

  }, {
    key: "getAllBadges",
    value: function () {
      var _getAllBadges = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee7() {
        var badges;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                _context7.next = 3;
                return this.getBadges(null, this.networkId);

              case 3:
                badges = _context7.sent;
                return _context7.abrupt("return", badges);

              case 7:
                _context7.prev = 7;
                _context7.t0 = _context7["catch"](0);
                return _context7.abrupt("return", new Error({
                  error: 'Error fetching badges'
                }));

              case 10:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[0, 7]]);
      }));

      function getAllBadges() {
        return _getAllBadges.apply(this, arguments);
      }

      return getAllBadges;
    }()
    /**
     * getBadgesOwnedByAddress is a getter method for every single badge owned by ethereum address
     * @param {string} ethereumAddress - the ethereum address owner of returned badges
     * @returns {Promise<Object[], Error>} an array of badges.
     * See {@link getBadge} for what each badge looks like in the returned array
     */

  }, {
    key: "getBadgesOwnedByAddress",
    value: function () {
      var _getBadgesOwnedByAddress = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee8(ethereumAddress) {
        var tokenIds, badges;
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                _context8.next = 3;
                return this.badgeContract.methods.getAllTokens(ethereumAddress).call();

              case 3:
                tokenIds = _context8.sent;
                _context8.next = 6;
                return this.getBadges(tokenIds);

              case 6:
                badges = _context8.sent;
                return _context8.abrupt("return", badges);

              case 10:
                _context8.prev = 10;
                _context8.t0 = _context8["catch"](0);
                return _context8.abrupt("return", new Error({
                  error: 'Error fetching badges'
                }));

              case 13:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[0, 10]]);
      }));

      function getBadgesOwnedByAddress(_x5) {
        return _getBadgesOwnedByAddress.apply(this, arguments);
      }

      return getBadgesOwnedByAddress;
    }()
    /**
     * getBadgesMintedFor is a getter method for every single badge representing a
     * unique id (in our case music group IPFS cid) by ethereum address
     * @param {string} uniqueId - the unique id that the badge represents (in our case it's an IPFS cid)
     * @returns {Promise<Object[], Error>} an array of badges. See {@link getBadge} for what each badge looks like in the returned array
     */

  }, {
    key: "getBadgesMintedFor",
    value: function () {
      var _getBadgesMintedFor = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee9(uniqueIdentifier) {
        var badges;
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.getBadges(null);

              case 2:
                badges = _context9.sent;
                return _context9.abrupt("return", badges.filter(function (badge) {
                  return badge[0] === uniqueIdentifier;
                }));

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getBadgesMintedFor(_x6) {
        return _getBadgesMintedFor.apply(this, arguments);
      }

      return getBadgesMintedFor;
    }()
    /**
     * getBadge is a getter method for a single badge
     * meant to get more information about the badges
     * returns transaction receipt along with formatted badge data
     * returns null if transaction has not been mined to chain yet
     * @param {string} txHash - the transaction hash of the badge minting
     * @returns {Promise<Object, Error>} a single badge object
     * @todo decide on this object ^^
     */

  }, {
    key: "getBadge",
    value: function () {
      var _getBadge = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee10(txHash) {
        var txReceipt, _this$web3$eth$abi$de, nftcid, timeMinted, formattedTimeMinted, data;

        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.prev = 0;
                _context10.next = 3;
                return this.getTransactionReceipt(txHash);

              case 3:
                txReceipt = _context10.sent;
                _context10.next = 9;
                break;

              case 6:
                _context10.prev = 6;
                _context10.t0 = _context10["catch"](0);
                return _context10.abrupt("return", new Error({
                  error: 'Error getting transaction receipt'
                }));

              case 9:
                if (!txReceipt) {
                  _context10.next = 20;
                  break;
                }

                _context10.prev = 10;
                // decode the logs from the transaction receipt based on event log signature
                _this$web3$eth$abi$de = this.web3.eth.abi.decodeLog([{
                  indexed: true,
                  name: 'tokenId',
                  type: 'uint256'
                }, {
                  indexed: false,
                  name: 'nftcid',
                  type: 'string'
                }, {
                  indexed: false,
                  name: 'timeMinted',
                  type: 'uint256'
                }, {
                  indexed: false,
                  name: 'buyer',
                  type: 'address'
                }, {
                  indexed: false,
                  name: 'issuer',
                  type: 'address'
                }], txReceipt.logs[0].data, txReceipt.logs[0].topics), nftcid = _this$web3$eth$abi$de.nftcid, timeMinted = _this$web3$eth$abi$de.timeMinted;
                formattedTimeMinted = _moment.default.unix(timeMinted).utc().format('MMMM Do, YYYY'); // this is the format of how badge data gets returned in the event log

                data = [nftcid, formattedTimeMinted, txHash]; // add this snippet to unfurl music group information in badge and reformat badge data
                // const badgeWithMetadata = getBadgeMetadata(data)
                // add the formatted badge data along with the rest of the tx receipt
                // see https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt

                return _context10.abrupt("return", (0, _objectSpread2.default)({}, txReceipt, {
                  data: data
                }));

              case 17:
                _context10.prev = 17;
                _context10.t1 = _context10["catch"](10);
                return _context10.abrupt("return", new Error({
                  error: 'Error decoding txReceipt logs'
                }));

              case 20:
                return _context10.abrupt("return", null);

              case 21:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this, [[0, 6], [10, 17]]);
      }));

      function getBadge(_x7) {
        return _getBadge.apply(this, arguments);
      }

      return getBadge;
    }()
    /**
     * mints a new badge
     * @param {string} badgeBuyerAddress - the eth address of the owner of the new badge
     * @param {string} uniqueIdentifier - the resource that the newly minted badge represents (cid in our case)
     * @param {string[]} beneficiaries - an array of ethereum addresses who will receive the money paid for the badge
     * @param {number[]} splits - an array of integers that represent the amount paid to each beneficiary (out of 100). Must be in the same order as the beneficiary
     * @param {number} patronageBadgePrice - the amount the badge costs in USD
     */

  }, {
    key: "buyBadge",
    value: function () {
      var _buyBadge = (0, _asyncToGenerator2.default)(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee11(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice) {
        var exchangeRate, amountInWei, gasRequired, gas;
        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.getExchangeRate();

              case 2:
                exchangeRate = _context11.sent;
                amountInWei = (0, _dist.dollarToWei)(patronageBadgePrice, exchangeRate);
                _context11.next = 6;
                return this.badgeContract.methods.mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice).estimateGas({
                  from: badgeBuyerAddress,
                  value: amountInWei,
                  to: this.badgeContract.address
                });

              case 6:
                gasRequired = _context11.sent;
                gas = (0, _dist.boostGas)(gasRequired);
                return _context11.abrupt("return", this.badgeContract.methods.mint(badgeBuyerAddress, uniqueIdentifier, beneficiaries, splits, patronageBadgePrice).send({
                  from: badgeBuyerAddress,
                  value: amountInWei,
                  to: this.badgeContract.address,
                  gas: gas
                }));

              case 9:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function buyBadge(_x8, _x9, _x10, _x11, _x12) {
        return _buyBadge.apply(this, arguments);
      }

      return buyBadge;
    }()
  }]);
  return Badges;
}();

var _default = Badges;
exports.default = _default;
//# sourceMappingURL=index.js.map