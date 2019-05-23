import Config from '../../config';
import { Licensor, Licensing } from '../src/index';

console.log('asdfasdfasd')

describe('Licensing tests', async () => {
  const config = new Config('http://127.0.0.1:8545', 'ipfs', { test: true });

  const licensor = new Licensor();
  const licensing = new Licensing();

  it('should create a license', async () => {
    await licensor.init(config);
    const cid = 'Qm';
    const buyer = '0xd287a4d332663312b541ee9bbcd522600d816d46';
    const beneficiaries = ['0x3249c9b7f3cc4d2d46bb6fd6d9e42a72b2001d03'];
    const amounts = ['2'];
    const eth = '2';
    const test = await licensor.license(cid, buyer, beneficiaries, amounts, [], eth);
    console.log(test);
  });

  it('should license', async () => {
    const buyer = '0xd287a4d332663312b541ee9bbcd522600d816d46';
    const firstProduct = {
      id: 1,
      price: 1000,
      initialInventory: 2,
      supply: 2,
      interval: 0,
    };

    await licensing.init(config);
    const p1Created = await licensing.Licensing.methods.createProduct(
      firstProduct.id,
      firstProduct.price,
      firstProduct.initialInventory,
      firstProduct.supply,
      firstProduct.interval,
    );
  });
});
