# Licensing

The Licensing Handlers are smart-contracts responsible for handling licensing payments. Payments are input and the funds are disbursed to the appropriate beneficiaries towards a specific license referenced by it’s Content-ID. Similar to the Artist Registry these events are stored in the blockchain via event logs. During a payment, the handlers fetch the USD/ETH price from an Oracle (described in the next section), and notifies a variable amount of addresses of the action. An example of a notified beneficiary is issuing a collectible badge upon payment. The handlers enable proof-of-payments, granting the rights specified in the license to the licensor. An example event looks like this:

```solidity
LogPayment(
    _cid, _oracle, ethUSD, msg.value, msg.sender, _buyer, _beneficiaries, _amounts
);
```

| Network         | Address                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Mainnet (id: 1) | [0x0be87716eda791a5c1f9b73e08b47cee2b43e59f](https://etherscan.io/address/0x0be87716eda791a5c1f9b73e08b47cee2b43e59f)         |
| Rinkeby (id: 4) | [0x4cd36d101197b299fdd79254372541941e950066](https://rinkeby.etherscan.io/address/0x4cd36d101197b299fdd79254372541941e950066) |
