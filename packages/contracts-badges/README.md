# Collectibles

Collectibles are **[ERC-721](http://erc721.org/)** Tokens.

ERC-721 is a free, open standard that describes how to build non-fungible or unique tokens on the Ethereum blockchain. While most tokens are fungible (every token is the same as every other token), ERC-721 tokens are all unique. Think of them like rare, one-of-a-kind collectables.

The Badge contracts contain an implementation of the ERC-721 spec along with a type of Non-Fungible Token (NFT) we’ve defined as a Badge. Badges are received for various actions users of the platform participate in including, but not limited to proof-of-purchases for music acquired through the platform. Other types of badges issued also include a variety of patronage tokens.

We first realized the potential of cryptocollectibles and experimented with the concept in early July of 2017 with the release of the RAC album Ego in a custom Ujo store (which we wrote about in a post taglined: [An Experiment in Tokenizing Social Capital](https://blog.ujomusic.com/the-ego-badge-a54b53561abf)). We view this as one of the most exciting core components and will be continuously experimenting with the types of signals collectibles provide and the value it can bring to both creator’s and fans. Some of this value might come in the form of gamifying artist and fan relationships and encouraging participation in the network through unique incentivization schemes. Simon from our team has since written a follow up on the direction we are taking to expand on our early experiments which includes info on the idea of [Continuous, Rare, Patronage Collectibles](https://blog.ujomusic.com/expanding-patronage-collectibles-for-creators-b1336de2f4cd).

The Patronage Badges are modular & flexible enough that it can be used by anyone wishing to issue patronage badges (not just for Ujo).

## Architecture

Anyone can mint a Patronage Badge by specifying 5 required variables:

1. buyer (the user who is buying the badge).
2. the unique content hash of the metadata of the badge (called nftCID).
3. the recipients of the money.
4. how the money should be split between the recipients.
5. the value of the badge in USD.

`function mint(address _buyer, string _nftCid, address[] _beneficiaries, uint256[] _splits, uint256 _usdCost) public payable returns (uint256 tokenId)`

This means:

- a user can buy a badge for anyone, not just themselves.
- for any unique content hash [it's important that this hash points to metadata containing on IPFS containing the NFT metadata that conforms to the ER721 spec].
- the funds can be split in any way to the beneficiaries. This means it supports the ability to mint a badge that pays out automatically to a band with multiple members.
- the badge can be any value, denominated in USD: from 1 USD to 10000 USD or whatever.

The smart contract will verify that the funds are correct (paid in ETH), and then forward the funds accordingly to the specified splits.

Since it is so flexible, it might be necessary to validate the badges before displaying or using them in an application. This is covered later.

## Building with Patronage Badges

Patronage Badges can extended for use in other applications OR you can use it to mint your own Patronage Badges. In order to add the Patronage Badges to your wallet, application or extension, it simply has to conform to the ERC721 standard. For any user, with a compatible front-end library (like web3.js) you can query `getAllTokens(<owner address>)` on the smart contract. This will return the token IDs related to the specific user address. Once this is received, you can retrieve the additional information related to badge's minting by querying the event logs.

A more detailed end-to-end example will be coming soon!

### Contract Deployments

| Network         | Address                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Mainnet (id: 1) | [0x2897137df67b209be4a7e20f654dadca720dd113](https://etherscan.io/address/0x2897137df67b209be4a7e20f654dadca720dd113)         |
| Rinkeby (id: 4) | [0x3738edd7e9cdc1641f92d18a53d7fb505fdcb177](https://rinkeby.etherscan.io/address/0x3738edd7e9cdc1641f92d18a53d7fb505fdcb177) |

<br/>

The ABI can be found [here](https://github.com/UjoTeam/contracts-badges/blob/master/build/contracts/UjoPatronageBadgesFunctions.json) (it's too large for this repo).

### Event Logs for Badge Minting

When a badge is minted it will contain information in the event log that is relevant for displaying the badge information.

`event LogBadgeMinted(uint256 indexed tokenId, string nftcid, uint256 timeMinted, address buyer, address issuer);`

## NFT Metadata

The unique content hash (the NFT cid) contains the metadata necessary to display the badge. This CID is concatenated to form a URI. For example, nftCID = zdpuAnphhDX7vp1K3C7TY6ENpSp9TtKCpJjETcsFkYRZPvYKU, the URI will be:

https://ipfs.infura.io:5001/api/v0/dag/get?arg=zdpuAnphhDX7vp1K3C7TY6ENpSp9TtKCpJjETcsFkYRZPvYKU

The metadata standard is taken from the [ERC721 metadata standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md).

All these fields are required. The ones from the ER721 standard are: name, description & image. These are fairly self explanatory: `image` must be a resolvable URI. Our URIs we generate uses images uploaded to IPFS (resolved Infura's IPFS gateway) and then parse through our internal image proxy to resize it

The ones that are required that are additional from our side are: usdCostOfBadge, MusicGroup & beneficiaries.

```
{
  "MusicGroup": "zdpuAs9bVB6Vyopzq9VX972EJaob8ry5GS9yaehfSWRRCX78q",
  "beneficiaries": [
    {
      "address": "0x69777AC7c7773Beb5F2B67024134e0142eDFdaeE",
      "split": 100
    }
  ],
  "description": "A collectible patronage badge for Black Wolf",
  "image": "https://www.ujomusic.com/image/600x600/https://ipfs.infura.io/ipfs/QmVyABcgCH68tPpkVrRmGvAFoH24vY8mtaR8Fp1REicwJL",
  "name": "Black Wolf Patronage Badge",
  "usdCostOfBadge": 5
}
```

`MusicGroup` refers to a content hash describing the music group that the badge is referring to. This is part of the metadata architecture that Ujo utilises. In order to create these metadata objects we utilise a library called Constellate. We will surface this soon and showcase examples on how to create these metadata objects yourself.

`beneficiaries` is an array of splits that indicate who received the payments from the badge when it was bought. All the splits must add up to 100.

`usdCostOfBadge` refers to the numerical USD value of the badge being bought.

## A Valid Patronage Badge

In order to keep costs down, and to maintain flexibility and modularity, some validation of the badge needs to occur off-chain.

It is possible for invalid badges to be minted, thus not ALL badges need to be regarded as legitimate.

When a badge is retrieved, it needs to be verified to be legitimate by comparing the event logs with the off-chain metadata.

The important event in this case is the `LogPaymentProcessed` event.

`event LogPaymentProcessed(uint256 indexed tokenId, address[] beneficiaries, uint256[] splits, uint256 usdCostOfBadge);`

The smart contract will verify if the usdCostOfBadge is correct, so one can trust that amount and will also verify that the splits are appropriate and that they addresses have been paid.

This must match the off-chain metadata. We will write scripts soon that will make it easy to process the badges and verify them.

### Is it the real artist?

Considering that Ujo is the primary user of Patronage Badges, we assume that the artist information that is created does indeed refer to the actual artist. If it says `Taylor Swift` it is `Taylor Swift`. However, into the future if Patronage Badges gets used outside of the context of Ujo, this will become harder to verify. In that future, we will help design ways to verify this too.

## Future Improvements & Decentralization

The badges conform to a proxy, upgradeable standard for the time being. This means that the badges can be upgraded with new functionality over time. We want to in the short term, allow this so that we can add new ways to mint into the future: such as usage of DAI or other ERC20 tokens.

Currently, we also have control over the tokenURI base [if it needs to change into the future], and the oracle used in the contract.

The NFT CID has a URI that contains an Ujo Music address. Ideally, we would simply be using the content hash and retrieve as such. If in the future that Ujo would remove its API, the badges would still work if the data was persisted on IPFS, given that the content hash is scraped off from the URL.

In the future, when we feel that it's sufficient, we will remove any owner or admin functionality from the Badges Proxy.
