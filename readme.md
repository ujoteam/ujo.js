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

This monorepo contains JavaScript tools and applications that interact with the Ujo smart contracts and peer-to-peer network.

<!-- hide-on-docup-start -->

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Packages](#packages)
- [Resources](#resources)

<!-- hide-on-docup-stop -->

## Requirements

This project requires `node >=10.12.0` and `yarn >=1.10.1`. A unix shell is also required.

- [Installing Node](https://docs.npmjs.com/getting-started/installing-node)
- [Installing Yarn](https://yarnpkg.com/lang/en/docs/install/)
- [UNIX Shell (Windows users)](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

## Getting Started

To get started, clone the repo and install its dependencies:

```bash
git clone https://github.com/ujo/ujo.js.git
cd ujo.js
```

Install packages:

```
lerna bootstrap --hoist
```

Build all the javascript source:

```
npm run build
```

**NOTE**: the build command _must_ be run from the root directory right now, because the root directory's node modules has all the babel modules

Start a local blockchain with a specified networkID:

```
npm run ganache
```

Compile and migrate contracts to ganache private chain:

```
npm run migrate
```

```
TODO - add .env file
```

## Testing

To test all packages, ensure the contracts have been migrate and then run: 

```
yarn test
```

To run tests for an individual package, change into the appropriate directory and run the same command as above.

## Cleanup

Remove all node modules (if you already have them installed):

```
lerna clean
```

Clean all smart-contract build files: 

```
npm run clean-contracts
```

For next steps, take a look at documentation for the individual package(s) you want to run and/or develop.


## Packages

### Published

| Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Version&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                                                         | Description                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`@ujoteam/<todo>`]()                                                                                                                                                             | [![npm](https://img.shields.io/npm/v/@ujo/todo.svg?style=flat-square)](https://www.npmjs.com/package/@ujo/licensing)           |   Explanation of licensing module   ||

### Private

| Name                                                                                                 | Description                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@ujo/<todo>`]()             | Description of private repos with.                                                               ||

## Resources

- 🌐 [The Ujo Website](https://ujomusic.com)
- ✍ [The Ujo Blog](https://blog.ujomusic.com)
- 📖 [The Ujo Docs](https://docs.ujomusic.com/)
- 💬 [The Ujo Chat](https://discord.gg/gWWXT7H)
<!-- - ❓ [The Ujo Forum]() -->

## Contributing

Thanks for your interest in contributing to ujoJS. Please have a look at the [guide](https://github.com/ujoteam/ujo.js/blob/master/CONTRIBUTING.md) to get started.

Please check out the [issues page](https://github.com/ujo/ujo.js/issues) for areas that could use help! We hope to see your username on our [list of contributors](https://github.com/ujo/ujo.js/graphs/contributors) 🙏🎉🚀

