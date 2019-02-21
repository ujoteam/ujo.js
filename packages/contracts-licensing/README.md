## Handlers

[![codecov](https://codecov.io/gh/UjoTeam/contracts-handlers/branch/master/graph/badge.svg)](https://codecov.io/gh/UjoTeam/contracts-handlers)  
[![CircleCI](https://circleci.com/gh/UjoTeam/contracts-handlers.svg?style=svg)](https://circleci.com/gh/UjoTeam/contracts-handlers)  


These contracts are responsible for handling licensing payments.

It takes in a payment and disbursed the funds according to the specified inputs towards a specific license [specified by a CID].

This is stored through event logs.

Within a payment, it fetches the USD/ETH price from an oracle & it allows any beneficiaries to be notified. It does not yet conform to ERC165 for interface inspection.

A notified beneficiary example is issuing a badge upon payment.

The end result is a proof-of-payment which is used by an external provider to forward/produce whatever rights are specified in the license. In the future, the aim is to make this more decentralized: allowing any provider to submit proof of delivery.
