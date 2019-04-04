<!-- show-on-docup
<br />
-->

[![ujoJS](https://github.com/ujoteam/ujo.js/raw/master/ujo.png)](https://ujomusic.com/)

---

[![Discord](https://img.shields.io/discord/423160867534929930.svg?style=flat-square)](https://discord.gg/gWWXT7H)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ujoteam/ujo.js/blob/master/LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square)](https://lernajs.io/)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat-square)](https://github.com/ujoteam/ujo.js/blob/master/CONTRIBUTING.md)

Ujo is a music platform that uses the ethereum blockchain as the substrate for innovation by empowering artists, digitizing their music rights and metadata, sharing this information in an open and decentralized environment, thus enabling new applications, products, and services to license their catalogs and pay artists directly with minimal friction. You can learn more about the protocol [here](https://blog.ujomusic.com/the-ujo-platform-a-decentralized-music-ecosystem-e530c31b62bc).

This repo contains a JavaScript package for interacting with Connext's State Channels, a layer 2 technology meant for decreaing the load on the Ethereum network.

<!-- hide-on-docup-start -->

## Table of Contents

- [Background](#background)
- [Getting Started](#getting-started)
- [Using the Card](#using-the-card)
- [Contributing](#contributing)
<!-- hide-on-docup-stop -->

## Background

This package provides connection points to Connext's payment channel hub with funds denominated in Dai. Much of the functionality seen in the [dai wallet](https://daicard.io/) is obfuscated into a simple package. To read more on Connext visit [their docs](https://github.com/ConnextProject/docs/wiki).

## ⚠️ Warning ⚠️

This is beta software. Use at your own discretion.

## Getting Started

To get started, npm or yarn install the package and its dependencies:

```bash
npm install --save @ujoteam/card
// or
yarn add @ujoteam/card
```

You will need to point to a hub in order to utilize the state channel functionality. Connext currently hosts hubs for both the Rinkeby and Ethereum Mainnet. If you would like to run your own node, check out [their docs for indra](https://github.com/ConnextProject/indra).

First instantiate a new Card and can optionally pass in a callback function which will be called every time the state of the address is updated. State is updated by sending, receiving, depositing, or withdrawing funds. The only argument currently passed to the callback is the amount denominated in wei. A helper function is provided to convert to USD: `card.convertDaiToUSDString`.

```js
const card = new Card(callbackFunction);
```

Then initialize the card by passing in the hubUrl and jsonRpc provider. If running indra locally, you can leave these values blank as the default values will point to the local hub running on port 8080 and the rpc provider on 8545.

```js
// rinkeby
const address = await card.init("https://daicard.io/api/rinkeby/hub", "https://eth-rinkeby.alchemyapi.io/jsonrpc/SU-VoQIQnzxwTrccH4tfjrQRTCrNiX6w");
// mainnet
const address = await card.init("https://daicard.io/api/mainnet/hub", "https://eth-mainnet.alchemyapi.io/jsonrpc/rHT6GXtmGtMxV66Bvv8aXLOUc6lp0m_-");
```

**Important**
Upon initialization, a mnemonic will be generated and stored in localStorage keyed at `localStorage.get('mnemonic')`. For this reason you should warn your users to avoid resetting localStorage as it will result in the disappearance of the mnemonic and therefore a generation of a new seed phrase and wallet next time the Card is initialized.

## Using the Card

The card offers out of the box functionality for handling deposits. Utilizing another wallet holding either ether or dai, send a deposit to the wallet address returned from the `card.initialize` function as seen in the getting started section. It may take some time for the hub to receive the deposit request and collateralize your channel.

Once funds have appeared in your wallet, there are three main activites to perform:

- Direct Payment (to another wallet, non-custodial)
  - `card.generatePayment(valueAsNumberToSendInUSD, walletAddressAsString)`
- Pay via Link (custodial)
  - `const linkToClaim = await card.generateRedeemableLink(valueAsNumberToSendInUSD)`
- Claim via Link
  - `card.redeemPayment(linkToClaim)`

For a stripped down UI to begin, check out the Sandbox package found in this mono-repo `ujo.js/packages/sandbox`. For a quick start, point the hub and rpc to the rinkeby provider by uncommenting line 19 and commenting out the local pointer on line 25.

## Contributing

Thanks for your interest in contributing to ujoJS. Please have a look at the [guide](https://github.com/ujoteam/ujo.js/blob/master/CONTRIBUTING.md) to get started.

Please check out the [issues page](https://github.com/ujo/ujo.js/issues) for areas that could use help! We hope to see your username on our [list of contributors](https://github.com/ujo/ujo.js/graphs/contributors) 🙏🎉🚀
