"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function advanceBlock() {
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: Date.now(),
        }, (err, res) => {
            return err ? reject(err) : resolve(res);
        });
    });
}
exports.advanceBlock = advanceBlock;
// Advances the block number so that the last mined block is `number`.
function advanceToBlock(number) {
    return __awaiter(this, void 0, void 0, function* () {
        if (web3.eth.blockNumber > number) {
            throw Error(`block number ${number} is in the past (current is ${web3.eth.blockNumber})`);
        }
        while (web3.eth.blockNumber < number) {
            yield advanceBlock();
        }
    });
}
exports.default = advanceToBlock;
//# sourceMappingURL=advanceToBlock.js.map