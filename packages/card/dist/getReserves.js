"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _ChannelManager = _interopRequireDefault(require("../abi/ChannelManager.json"));

var Web3 = require('web3'); // This function returns the hubs token and wei balance
// reserves from the contract
// to call this function, run the following:
// RPC_URL="https://eth-rinkeby.alchemyapi.io/jsonrpc/RvyVeludt7uwmt2JEF2a1PvHhJd5c07b" CM_ADDRESS="0x083c8bc6bc6f873091b43ae66cd50abef5c35f99" node getReserves.js
// the RPC_URL and the CM_ADDRESS should correspond to the network you are looking to find reserves in
// the


function getReserves() {
  return _getReserves.apply(this, arguments);
}

function _getReserves() {
  _getReserves = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var web3, cm, wei, token;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // TODO: hit hub endpoint to get addresses
            // once config endpoint is in place
            web3 = new Web3(process.env.RPC_URL);
            console.log('Investigating contract at:', process.env.CM_ADDRESS);
            cm = new web3.eth.Contract(_ChannelManager.default.abi, process.env.CM_ADDRESS);
            _context.next = 5;
            return cm.methods.getHubReserveWei().call();

          case 5:
            wei = _context.sent;
            _context.next = 8;
            return cm.methods.getHubReserveTokens().call();

          case 8:
            token = _context.sent;
            console.log('hub wei reserves: ', wei);
            console.log('hub token reserves: ', token);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _getReserves.apply(this, arguments);
}

getReserves().then(function () {});
//# sourceMappingURL=getReserves.js.map