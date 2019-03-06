# Oracle

## Ujo Price Oracles (using Oraclize).

In Ujo Music, we utilize an on-chain price oracle that allows fans/musicians to purchase, license and buy badges based on a USD price (but pay in ETH).

## Basic Summary

The oracle works by using Oraclize. With oraclize you specify a remote URL in the smart contract itself which is fetched when asked to do so. In this oracle's case it's the USD exchange rate from Kraken.

To receive a callback that has the ETH/USD price in it, the update() function is called (only doable by the administrator, which in our case is the Ujo MultiSig Wallet). It will take some ether in the oracle and pay it towards Oraclize. Oraclize would as soon as possible return the callback in a new async transaction. In the callback, it then also immediately issues a new callback that is scheduled to occur at some point in the future.

## Detailed Description

When issuing an update (an oraclize_query), the oracle stores the ID of the callback it's expecting. It takes the gas price set in the oracle and uses that to take ETH from the contract and send/pay it towards Oraclize. This "fee" contains the fee paid towards oraclize for the service, but it also pays for the callback (since Oraclize will separately issue the callback transaction themselves). Thus, the fee is:

fee_in_eth = fee_for_oraclize + gas_used_in_callback \* gas_price_set_in_contract.

When `update()` is called, the callback is returned immediately, upon which it issues a new update for a callback to be returned at some point in the future (set by `intervalInSeconds`). Every time the oraclize query for a callback is called it sets the expected ID & uses the current gas price set in the contract.

The administrator can keep changing the gas price `setGasPrice(uint256 _newGasPrice)`. However, this will only affect NEW queries that are issued. Under normal network circumstances, the updates will keep being sent in a recursive manner until the oracle runs out of ETH.

When `update()` is called whilst it is in the recursive loop, it will invalidate the old callback that is still due to arrive, and issue a new one immediately. The old callback will still be sent to oracle, because the oracle paid for it, but due to how the oracle is set up, it will revert that transaction. It isn't possible yet with Oraclize to get back the fee paid for the callback.

### Gas Volatility Scenarios

The way Oraclize manages the transactions they send is constantly changing and the documentation isn't that good. Currently, it works as follows in scenarios when there are gas spikes.

Oraclize will not send a transaction if the gas price chosen for the callback is BELOW SafeLow on ethgasstation. This means there are scenarios where the oracle sends out a callback to arrive in 12 hours with 10 gwei, but during that time, it has spiked to 100 gwei, which means Oraclize won't issue the callback in those network circumstance, bringing your oracle to a halt.

In order for that callback to eventually arrive, Oraclize will clear transactions based on gas paid. So even if the network is back to 10 gwei for a while, it might still be issuing the transactions that was paid for with 80 gwei before it eventually gets back to sending the 10 gwei callbacks.

They are currently adding tools and services to monitor this blackbox in scenarios like this, when it's unknown when/where the callback with the specific ID is. Has it been issued? Is it still in limbo, etc?

However due to the fact that one needs price updates in timely fashion, it's sometimes necessary to first: 1) update the gas price used on the oracle, and then 2) sending a new `update()`. This will invalidate the previous, expected callback, and will issue a new one immediately with the higher gas price.

When the network has cleared a bit, it then becomes safer to lower the gas prices again.

Ideally, Oraclize would provide ways to pay EXTRA to be certain that it clears under a certain gas threshold, but then refunds the oracle if it can send it with a lower gas price. eg, "here's the callback I want. I'm paying ETH that will cover it UP TO 100 gwei, but at the time of issuing it, please just use the default gas price. The ETH you didn't use, please refund it to me".

### Proofs?

This oracle does not utilise proofs that are allowed by Oraclize.

### What is editable?

In the oracle, the administrator, the interval, the URL & the gas price can be changed. On the mainnet this is done by the Ujo MultiSig Wallet.

### Edge Cases?

There are edge cases where you will detect what the price is to pay in ETH, but DURING the transaction, an oracle callback confirms first. This means that it's possible that the transaction does not succeed, especially in the case of buying badges, where the check is explicit.

### Current Intervals

We've been experimenting with different intervals, setting it shorter or longer in different times. For now, we are set on keeping it at getting updates every 12 hours. This is contingent on product releases & price volatility of Ethereum.

## Using the Oracle

This oracle is open to use by other apps. If you are, please consider topping it up with ETH to help pay for it! :)

### Contract Deployments

| Network         | Address                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Mainnet (id: 1) | [0x57257ede587dd4ddf99cf95dbe308830e154acf7 ](https://etherscan.io/address/0x57257ede587dd4ddf99cf95dbe308830e154acf7)        |
| Rinkeby (id: 4) | [0x928f3d0659404abb6c79e4b6390d72f3913d7d0b](https://rinkeby.etherscan.io/address/0x928f3d0659404abb6c79e4b6390d72f3913d7d0b) |

## Testing

To test locally, do the following:

1. `npm install`
2. run `node ./node_modules/ganache-cli/build/cli.node.js --mnemonic "ujo music service" --accounts 5` in its own tab.
3. run `node ./node_modules/ethereum-bridge/bridge -H localhost:8545 -a 2` in its own tab.
4. follow the instructions and copy the relevant line of code into the USDETHOracle_localhost contract [the default should be the same, so this might not be necessary].
5. `npm run test` [runs linter & does truffle test --network ganachecli]

It sets the calls 20 seconds apart. In some circumstances the tests might fail due to prices staying the same.

## CI

CircleCI mimics the above steps to run tests, except it adds coverage reporting.

## Coverage

Coverage plans to be added, but it is currently hanging infrequently on instrumentation. Opened up an issue.
