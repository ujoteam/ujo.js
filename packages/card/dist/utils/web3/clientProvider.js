"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _web3ProviderEngine = _interopRequireDefault(require("web3-provider-engine"));

var _defaultFixture = _interopRequireDefault(require("web3-provider-engine/subproviders/default-fixture"));

var _nonceTracker = _interopRequireDefault(require("web3-provider-engine/subproviders/nonce-tracker"));

var _cache = _interopRequireDefault(require("web3-provider-engine/subproviders/cache"));

var _filters = _interopRequireDefault(require("web3-provider-engine/subproviders/filters"));

var _inflightCache = _interopRequireDefault(require("web3-provider-engine/subproviders/inflight-cache"));

var _hookedWallet = _interopRequireDefault(require("web3-provider-engine/subproviders/hooked-wallet"));

var _sanitizer = _interopRequireDefault(require("web3-provider-engine/subproviders/sanitizer"));

var _fetch = _interopRequireDefault(require("web3-provider-engine/subproviders/fetch"));

var _GaspriceSubprovider = _interopRequireDefault(require("./GaspriceSubprovider"));

var clientProvider = function clientProvider() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var engine = new _web3ProviderEngine.default(opts.engineParams); // static

  var staticSubprovider = new _defaultFixture.default(opts.static);
  engine.addProvider(staticSubprovider); // nonce tracker

  engine.addProvider(new _nonceTracker.default()); // sanitization

  var sanitizer = new _sanitizer.default();
  engine.addProvider(sanitizer); // cache layer

  var cacheSubprovider = new _cache.default();
  engine.addProvider(cacheSubprovider); // filters

  var filterSubprovider = new _filters.default();
  engine.addProvider(filterSubprovider); // inflight cache

  var inflightCache = new _inflightCache.default();
  engine.addProvider(inflightCache);
  var gasprice = new _GaspriceSubprovider.default(opts.hubUrl);
  engine.addProvider(gasprice);
  var idmgmtSubprovider = new _hookedWallet.default((0, _objectSpread2.default)({}, opts));
  engine.addProvider(idmgmtSubprovider); // data source

  var dataSubprovider = opts.dataSubprovider || new _fetch.default({
    rpcUrl: opts.rpcUrl,
    originHttpHeaderKey: opts.originHttpHeaderKey
  });
  engine.addProvider(dataSubprovider); // start polling

  engine.start(); // web3 uses the presence of an 'on' method to determine
  // if it should connect via web sockets. we create the
  // below proxy method in order to avoid this issue.

  return {
    start: engine.start.bind(engine),
    stop: engine.stop.bind(engine),
    send: engine.send.bind(engine),
    sendAsync: engine.sendAsync.bind(engine)
  };
};

var _default = clientProvider;
exports.default = _default;
//# sourceMappingURL=clientProvider.js.map