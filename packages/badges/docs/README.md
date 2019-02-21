# Class

# Function

## `initializeBadges(ujoConfig: Object): Object`

the initializeBadges method provides an API for interacting with ujo patronage badges

| Name      | Type   | Attribute | Description                                       |
| --------- | ------ | --------- | ------------------------------------------------- |
| ujoConfig | Object |           | the config object returned by ujoInit @see [link] |

## `getBadgeContract(): Object`

getBadgeContract is a getter method for the ujo badges contract

| Name | Type | Attribute | Description |
| ---- | ---- | --------- | ----------- |


## `getAllBadges(): Promise<Object[], Error>`

getAllBadges is a getter method for every single badge in the proxy contract

| Name | Type | Attribute | Description |
| ---- | ---- | --------- | ----------- |


## `getBadgesOwnedByAddress(ethereumAddress: string): Promise<Object[], Error>`

getBadgesOwnedByAddress is a getter method for every single badge owned by ethereum address

| Name            | Type   | Attribute | Description                                   |
| --------------- | ------ | --------- | --------------------------------------------- |
| ethereumAddress | string |           | the ethereum address owner of returned badges |

## `getBadgesMintedFor(uniqueId: string): Promise<Object[], Error>`

getBadgesMintedFor is a getter method for every single badge representing a unique id (in our case music group IPFS cid) by ethereum address

| Name     | Type   | Attribute | Description                                                            |
| -------- | ------ | --------- | ---------------------------------------------------------------------- |
| uniqueId | string |           | the unique id that the badge represents (in our case it's an IPFS cid) |

## `getBadge(txHash: string): Promise<Object, Error>`

getBadge is a getter method for a single badge

| Name   | Type   | Attribute | Description                               |
| ------ | ------ | --------- | ----------------------------------------- |
| txHash | string |           | the transaction hash of the badge minting |
