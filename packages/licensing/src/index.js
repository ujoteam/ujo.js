import { boostGas, getContractAddress } from '../../utils/dist';
import { ETHUSDHandler } from '../../contracts-licensing';

class Licensor {
  async init(config) {
    this.web3 = config.web3;
    this.networkId = await config.getNetwork();
    this.licensingHandlerAddress = getContractAddress(ETHUSDHandler, this.networkId);
    this.LicensingHandler = new this.web3.eth.Contract(ETHUSDHandler.abi, this.licensingHandlerAddress);
    this.oracleAddress = await config.getOracleAddress();
  }

  async license(cid, buyer, beneficiaries, amounts, notifiers, eth) {
    let wei;
    if (eth) wei = this.web3.utils.toWei(eth, 'ether');

    // Convert ether amounts to wei
    const amountsInWei = amounts.map(amount => this.web3.utils.toWei(amount, 'ether'));

    const gasRequired = await this.LicensingHandler.methods
      .pay(
        cid,
        this.oracleAddress, // which oracle to use for reference
        buyer, // address
        beneficiaries, // addresses
        amountsInWei, // in wei
        notifiers, // contract notifiers [none in this case]
      )
      .estimateGas({
        from: buyer,
        value: wei,
      });

    const gas = boostGas(gasRequired);

    return this.LicensingHandler.methods.pay(cid, this.oracleAddress, buyer, beneficiaries, amountsInWei, []).send({
      from: buyer,
      value: wei,
      gas,
    });
  }
}

export default Licensor;
