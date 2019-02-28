import Card from '../../card/src/index';
import Config from '../../config';
// import Licensing from '../../licensing';

function component() {
  // Both Config & Badges are breaking on importing
  // const config = new Config('https://rinkeby.infura.io/v3/d00a0a90e5ec4086987529d063643d9c', 'ipfs');
  // const web3 = config.web3;
  // console.log('web3', web3);

  const card = new Card();
  console.log('card', card);
  card.init();

  let element = document.createElement('div');

  const arr = ['Hard', 'at', 'work'];
  element.innerHTML = arr.join(' ');

  return element;
}

document.body.appendChild(component());
