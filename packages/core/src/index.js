import Config from '../../config';
import Badges from '../../badges';
import initializeLicensing from '../../licensing';

async function execute() {
  const config = new Config('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
  const web3 = config.web3;
  // do not delete, will translate this into documentation
  const accounts = await config.getAccounts();
  const network = await config.getNetwork();
  // const txReceipt = await config.getTransactionReceipt(
  //   '0xc3ccf36047e8645210f7851d5f01766ba3e2fe5d63d1c034870ad35d589ad620',
  // );
  // console.log('txReceipt', txReceipt);
  const ujoBadges = new Badges();
  await ujoBadges.init(config);
  const badges = await ujoBadges.getAllBadges();
  // const badgesByAddress = await ujoBadges.getBadgesOwnedByAddress('0xE8F08D7dc98be694CDa49430CA01595776909Eac');
  // const badgeCheck = await ujoBadges.getBadge('0xc3ccf36047e8645210f7851d5f01766ba3e2fe5d63d1c034870ad35d589ad620');
  // const badgesByCid = await ujoBadges.getBadgesMintedFor('zdpuAsmQBSBLMUejTcys5hJWAW5M2YE6utnVAwgBPrCbBxAGx');
  console.log(badges);

  // web3.eth.sendTransaction(
  //   {
  //     from: accounts[0],
  //     to: accounts[1],
  //     value: '1000000000000000000',
  //   },
  //   (err, res) => {
  //     console.log('ERROR', err);
  //     console.log('RESULT', res);
  //   },
  // );
  // console.log(accounts);
  // const network = await ujoConfig.getNetwork();

  // const ujoLicensing = await initializeLicensing(ujoConfig);
  // const contract = await ujoLicensing.getLicensingContract();
  // console.log(`contract ${contract}`);

  // sender, cid, beneficiaries, amounts, eth;
  // const sender = '0xE8F08D7dc98be694CDa49430CA01595776909Eac';
  // const cid = 'Qm';
  // const beneficiaries = [sender];
  // const amounts = ['1'];
  // const eth = '1';
  // await ujoLicensing.License(sender, cid, beneficiaries, amounts, eth);
}

execute();
