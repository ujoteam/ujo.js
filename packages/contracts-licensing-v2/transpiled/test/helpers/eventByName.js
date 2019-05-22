"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (logs, eventName, nth = 0) => {
    return _.chain(logs)
        .filter(l => l.event === eventName)
        .get(nth)
        .value();
};
//# sourceMappingURL=eventByName.js.map