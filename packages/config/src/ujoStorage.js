import axios from 'axios';

/*

The point of this file is to separate out the fetching of off-chain data

This file just serves as a placeholder for how that could potentially work

right now the provider passed in will set some interal private variables,
used to fetch specific data from the storage provider

*/

export default function ujoStorage(provider) {
  let storageProvider;
  let endpoint;
  let params;
  if (!provider) storageProvider = 'ipfs' || provider.toLowerCase();

  switch (storageProvider) {
    case 'ipfs':
      endpoint = 'https://ipfs.infura.io:5001';
      params = 'api/v0/dag/get?arg';
      break;
    default:
      endpoint = 'https://ipfs.infura.io:5001';
      params = 'api/v0/dag/get?arg';
  }
  return {
    fetchMetadataByQueryParameter: queryParam => axios.get(`${endpoint}/${params}=${queryParam}`),
  };
}
