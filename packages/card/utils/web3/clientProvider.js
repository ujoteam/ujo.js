import ProviderEngine from 'web3-provider-engine';
import DefaultFixture from 'web3-provider-engine/subproviders/default-fixture';
import NonceTrackerSubprovider from 'web3-provider-engine/subproviders/nonce-tracker';
import CacheSubprovider from 'web3-provider-engine/subproviders/cache';
import FilterSubprovider from 'web3-provider-engine/subproviders/filters';
import InflightCacheSubprovider from 'web3-provider-engine/subproviders/inflight-cache';
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import SanitizingSubprovider from 'web3-provider-engine/subproviders/sanitizer';
import FetchSubprovider from 'web3-provider-engine/subproviders/fetch';

import GaspriceSubprovider from './GaspriceSubprovider';

const clientProvider = (opts = {}) => {
  const engine = new ProviderEngine(opts.engineParams)

  // static
  const staticSubprovider = new DefaultFixture(opts.static)
  engine.addProvider(staticSubprovider)

  // nonce tracker
  engine.addProvider(new NonceTrackerSubprovider());

  // sanitization
  const sanitizer = new SanitizingSubprovider();
  engine.addProvider(sanitizer);

  // cache layer
  const cacheSubprovider = new CacheSubprovider();
  engine.addProvider(cacheSubprovider);

  // filters
  const filterSubprovider = new FilterSubprovider();
  engine.addProvider(filterSubprovider);

  // inflight cache
  const inflightCache = new InflightCacheSubprovider();
  engine.addProvider(inflightCache);

  const gasprice = new GaspriceSubprovider();
  engine.addProvider(gasprice);

  const idmgmtSubprovider = new HookedWalletSubprovider({
    ...opts,
  });
  engine.addProvider(idmgmtSubprovider);

  // data source
  const dataSubprovider =
    opts.dataSubprovider ||
    new FetchSubprovider({
      rpcUrl: opts.rpcUrl,
      originHttpHeaderKey: opts.originHttpHeaderKey,
    });
  engine.addProvider(dataSubprovider);

  // start polling
  engine.start();

  // web3 uses the presence of an 'on' method to determine
  // if it should connect via web sockets. we create the
  // below proxy method in order to avoid this issue.
  return {
    start: engine.start.bind(engine),
    stop: engine.stop.bind(engine),
    send: engine.send.bind(engine),
    sendAsync: engine.sendAsync.bind(engine)
  }
}

export default clientProvider;
