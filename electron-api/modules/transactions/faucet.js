
const Promise = require('bluebird');
const helpers = require('../geth/helpers');

// Faucet simulator
// TODO :: Implement me !!

const ADDRESS = '0x499bce22c0d36fa0244744164f7a3e23c329744b';
const PASSWD = 'AKASHA password';
const FINNEY_VAL = 100;

export function requestEther() {
  const web3 = global.gethInstance.web3;
  const to = web3.eth.defaultAccount;
  const value = parseInt(web3.toWei(FINNEY_VAL, 'finney'), 10);

  return new Promise((resolve, reject) => {
    web3.personal.unlockAccount(ADDRESS, PASSWD, 5, (unlockErr, unlock) => {
      if (!unlockErr && unlock) {
        // console.log(`Faucet send from ${ADDRESS} to ${to} ...`);
        web3.eth.sendTransaction({ from: ADDRESS, to, value },
          (_, txHash) => {
            helpers.watchTx('sendEther()', txHash, (txErr, success) => {
              if (txErr) {
                reject(txErr);
              } else {
                resolve(success);
              }
            });
          });
      } else {
        reject(new Error('cannot unlock faucet'));
      }
    });
  });
}