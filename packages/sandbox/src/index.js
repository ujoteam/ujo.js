import Card from '../../card/src/index';

const main = async () => {
  const h1 = document.createElement('h1');
  h1.innerHTML = '$0.00';
  document.body.appendChild(h1);


  const h5 = document.createElement('h5');
  h5.innerHTML = '????????????????';
  document.body.appendChild(h5);

  const card = new Card(amount => {
    h1.innerHTML = amount;
  });
  
  const address = await card.init();
  h5.innerHTML = address;

  document.body.appendChild(document.createElement('hr'));

  // Pay Section
  const h3 = document.createElement('h3');
  h3.innerHTML = 'Pay Someone';
  document.body.appendChild(h3);

  const inputAmount = document.createElement('input');
  inputAmount.placeholder = 'Amount';
  const inputAddr = document.createElement('input');
  inputAddr.placeholder = 'Address To';
  const buttonPay = document.createElement('button');
  buttonPay.innerHTML = 'Send To Address';
  buttonPay.onclick = (e) => {
    card.generatePayment(Number.parseFloat(inputAmount.value), inputAddr.value);
  };
  const buttonLink = document.createElement('button');
  buttonLink.innerHTML = 'Generate Link';
  buttonLink.onclick = async (e) => {
    const secret = await card.generateRedeemableLink(Number.parseFloat(inputAmount.value));
    console.log('secret', secret);
    const h4 = document.createElement('h4');
    h4.innerHTML = `Secret: ${secret}`;
    document.body.appendChild(h4);

  };
  document.body.appendChild(inputAmount);
  document.body.appendChild(inputAddr);
  document.body.appendChild(document.createElement('br'));
  document.body.appendChild(buttonPay);
  document.body.appendChild(buttonLink);

  document.body.appendChild(document.createElement('hr'));

  // input and button to claim redeem link
  const inputSecret = document.createElement('input');
  inputSecret.placeholder = 'Secret To Redeem';
  const button1 = document.createElement('button');
  button1.innerHTML = 'Redeem From Secret';
  button1.onclick = (e) => {
    console.log('input value', inputSecret);
    console.log('inputSecret value', inputSecret.value);
    card.redeemPayment(inputSecret.value);
  };
  document.body.appendChild(inputSecret);
  document.body.appendChild(button1);
}

main();
