const Splitter = artifacts.require("Splitter");
Promise = require("bluebird");
const truffleAssert = require('truffle-assertions');

const getBalancePromise = Promise.promisify(web3.eth.getBalance);
const BN = web3.utils.BN;
const gasPrice = new BN(1000000);

const amountToSend = web3.utils.toWei(new BN(20));
const amountToDraw = web3.utils.toWei(new BN(10));

var fromWei = function(balance){return web3.utils.fromWei(new BN(balance),'ether');}

contract('Splitter', (accounts) => {
  const [ alice, bob, carol ] = accounts;

  it("should split ether to two accounts and emit", function() {
    return Splitter.deployed()
        .then(instance => {
            return instance.splitEther(bob, carol,{from: alice, value:amountToSend });
        })
        .then( tx => {
            truffleAssert.eventEmitted(tx, 'LogSplitEvent', (ev) => {
                return ev.addressRecp1 === bob && ev.addressRecp2 === carol;
          });
        })
  });

  it("Bob's balance should have 10 ether", function() {
    return Splitter.deployed()
        .then(instance => {
            return instance.balances(bob);
        })
        .then(balanceBob => {
            const balanceBobEth = fromWei(balanceBob);
            assert.strictEqual(balanceBobEth, '10');
        })
  });

  it("Carol's balance should have 10 ether", function() {
    return Splitter.deployed()
        .then(instance => {
            return instance.balances(carol);
        })
        .then(balanceCarol => {
            const balanceCarolEth = fromWei(balanceCarol);
            assert.strictEqual(balanceCarolEth, '10');
        });
  });

  it("Bob can withdraw funds", function() {
    var gasUsed;
    return Splitter.deployed()
        .then(instance => {
            trx = instance.withdraw(amountToDraw, {from: bob, gasPrice: gasPrice });
            return trx;
        })
        .then(trx => {
            gasUsed = trx.receipt.gasUsed;
            return Splitter.deployed();
        })
        .then(instance => {
            return instance.balances(bob);
        })
        .then(balanceBob => {
            const balanceBobEth = fromWei(balanceBob);
            assert.strictEqual(balanceBobEth, '0');
        })
        .then( _ => {
            return getBalancePromise(bob);
        })
        .then(balanceBob => {
            const trxCost = new BN(gasUsed).mul(gasPrice);
            const balanceBobEth = web3.utils.fromWei(new BN(balanceBob).add(trxCost),'ether');
            assert.strictEqual(balanceBobEth, '110');
        })
  });

  it("Carol can withdraw funds", function() {
    var gasUsed;
    return Splitter.deployed()
        .then(instance => {
            trx = instance.withdraw(amountToDraw, {from: carol, gasPrice: gasPrice});
            return trx;
        })
        .then(trx => {
            gasUsed = trx.receipt.gasUsed;
            return Splitter.deployed();
        })
        .then(instance => {
            return instance.balances(carol);
        })
        .then(balanceCarol => {
            const balanceCarolEth = fromWei(balanceCarol);
            assert.strictEqual(balanceCarolEth, '0');
        })
        .then( _ => {
            return getBalancePromise(carol);
        })
        .then(balanceCarol => {
            const trxCost = new BN(gasUsed).mul(gasPrice);
            const balanceCarolEth = web3.utils.fromWei(new BN(balanceCarol).add(trxCost),'ether');
            assert.strictEqual(balanceCarolEth, '110');
            console.log(balanceCarolEth);
         })
  });

});
