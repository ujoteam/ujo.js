import bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey';

const createWallet = async (existingMnemonic) => {
  const mnemonic = existingMnemonic ? existingMnemonic : bip39.generateMnemonic();
  console.log("Creating Wallet");
  console.log("mnemonic", mnemonic);
  // let mnemonic = existingMnenomic ? existingMnenomic : bip39.generateMnemonic();
  const wallet = await hdkey.fromMasterSeed(mnemonic).getWallet();
  // const wallet = await web3.eth.accounts.create()
  localStorage.setItem("delegateSigner", wallet.getAddressString());
  localStorage.setItem("mnemonic", mnemonic);
  localStorage.setItem("privateKey", wallet.getPrivateKeyString());
  return wallet;
}

export default createWallet;