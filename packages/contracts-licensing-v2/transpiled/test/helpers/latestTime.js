"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Returns the time of the last mined block in seconds
function latestTime() {
    return web3.eth.getBlock('latest').timestamp;
}
exports.default = latestTime;
//# sourceMappingURL=latestTime.js.map