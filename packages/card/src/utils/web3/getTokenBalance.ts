import Web3 from 'web3'
import Currency from "connext/dist/lib/currency/Currency";
const tokenAbi = require("./abi/humanToken.json");

export default async function getTokenBalance(
  web3: Web3,
  address: string,
  tokenAddress: string
): Promise<Currency> {

  const contract = new web3.eth.Contract(tokenAbi, tokenAddress)

  try {
    const amount = await contract
       .methods
       .balanceOf(address)
       .call()

    return  Currency.BEI(amount)
  } catch(e){
    throw new Error(`unable to get ERC20 balance ${address} ${e}`)
  }
}
