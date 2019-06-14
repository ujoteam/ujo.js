import Web3 from 'web3';
import express from 'express';

let web3;

// Initialize web3
async function initWeb3() {
  const provider = new Web3.providers.HttpProvider(process.env.ETH_NODE_HOST);
  web3 = new Web3('http://');
  web3.setProvider(provider);
  console.log('Web3 initialized');
}

async function main() {
  initWeb3();
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(express.static('static'));

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    console.log(next);

    if (err.statusCode) {
      // instance of HTTPError
      res.status(err.statusCode).json({ error: err.message });
    } else {
      // something else
      res.status(500).json({ error: `Unhandled error: ${err.toString()}` });
    }
  });

  app.listen(port, () => console.log(`HTTP server initialized (port ${port})`));
}

main();
