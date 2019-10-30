const Splitter = artifacts.require("Splitter");
Promise = require("bluebird");
const getBalancePromise = Promise.promisify(web3.eth.getBalance);
var BN = web3.utils.BN;

const gasUsedForWithdraw = new BN(21824);
const gasPrice = 10000000;
const trxCost = gasUsedForWithdraw.mul(new BN(gasPrice));

contract('Splitter', (accounts) => {
  const amountToSend = web3.utils.toWei(new BN(20));
  const amountToDraw = web3.utils.toWei(new BN(10));
  const [ alice, bob, carol ] = accounts;

  it("should split ether to two accounts again", function() {
    return Splitter.deployed()
        .then(instance => {
            return instance.splitEther(bob, carol,{from: alice, value:amountToSend });
        })
        .then( _ => {
            return getBalancePromise(alice);
        })
        .then(balanceAlice => {
            const balanceAliceEth = web3.utils.fromWei(new BN(balanceAlice),'ether');
            assert.equal(balanceAliceEth, 79.97354008);
        })
  });

  it("Bob's balance should have 10 ether", function() {
    return Splitter.deployed()
        .then(instance => {
            return instance.balances(bob);
        })
        .then(balanceBob => {
            const balanceBobEth = web3.utils.fromWei(new BN(balanceBob),'ether');
            assert.equal(balanceBobEth, 10);
        })
  });

  it("Carol's balance should have 10 ether", function() {
    return Splitter.deployed()
        .then(instance => {
            return instance.balances(carol);
        })
        .then(balanceCarol => {
            const balanceCarolEth = web3.utils.fromWei(new BN(balanceCarol),'ether');
            assert.equal(balanceCarolEth, 10);
        });
  });

  it("Bob can withdraw funds", function() {
    return Splitter.deployed()
        .then(instance => {
            instance.withdraw(amountToDraw, {from: bob, gasPrice: gasPrice });
            return instance;
        })
        .then(instance => {
            return instance.balances(bob);
        })
        .then(balanceBob => {
            const balanceBobEth = web3.utils.fromWei(new BN(balanceBob),'ether');
            assert.equal(balanceBobEth, 0);
        })
        .then( _ => {
            return getBalancePromise(bob);
        })
        .then(balanceBob => {
            const balanceBobEth = web3.utils.fromWei(new BN(balanceBob).add(trxCost),'ether');
            assert.equal(balanceBobEth, 110);
        })
  });

  it("Carol can withdraw funds", function() {
    return Splitter.deployed()
        .then(instance => {
            instance.withdraw(amountToDraw, {from: carol, gasPrice: gasPrice});
            return instance;
        })
        .then(instance => {
            return instance.balances(carol);
        })
        .then(balanceCarol => {
            const balanceCarolEth = web3.utils.fromWei(new BN(balanceCarol),'ether');
            assert.equal(balanceCarolEth, 0);
        })
        .then( _ => {
          return getBalancePromise(carol);
        })
        .then(balanceCarol => {
          const balanceCarolEth = web3.utils.fromWei(new BN(balanceCarol).add(trxCost),'ether');
          assert.equal(balanceCarolEth, 110);
          console.log(balanceCarolEth);
         })
  });

});
