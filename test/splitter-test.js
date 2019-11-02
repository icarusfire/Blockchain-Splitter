Promise = require("bluebird");
const Splitter = artifacts.require("Splitter");
const truffleAssert = require('truffle-assertions');
const getBalance = Promise.promisify(web3.eth.getBalance);
const BN = web3.utils.BN;
const gasPrice = new BN(1000000);
const amountToSend = web3.utils.toWei("0.2", "ether");
const amountToDraw = web3.utils.toWei("0.1", "ether");

var toEther = function(balance) { return web3.utils.fromWei(new BN(balance),'ether'); }
var expectedBalance = function (balance, gasUsed) { return web3.utils.fromWei(new BN(balance).add(new BN(gasUsed).mul(gasPrice)), 'ether'); }

contract('Splitter', (accounts) => {
    let instance;
    const [ alice, bob, carol, owner ] = accounts;

    beforeEach(async function() {
            instance = await Splitter.new( {from: owner} )
        });

    it("Should emit events after splitting Ether", function() {
        return instance.splitEther(bob, carol,{from: alice, value:amountToSend }) 
            .then( tx => {
                truffleAssert.eventEmitted(tx, 'LogSplitEvent', (ev) => {
                    return ev.addressRecp1 === bob && ev.addressRecp2 === carol;
                });
            })
        });

    it("Bob and Carol's balances should be 0.1 after split", function() {
        return instance.splitEther(bob, carol, { from: alice, value:amountToSend })
            .then( _ => instance.balances(bob))
            .then(balanceBob => assert.strictEqual(toEther(balanceBob), '0.1'))
            .then( _ => instance.balances(carol))
            .then(balanceCarol => assert.strictEqual(toEther(balanceCarol), '0.1'))     
        });
    
    it("Bob can withdraw funds", function() {
        var gasUsed;
        return instance.splitEther(bob, carol, { from: alice, value:amountToSend })
            .then( _ => instance.withdraw(amountToDraw, { from: bob, gasPrice: gasPrice }))
            .then(trx => {
                gasUsed = trx.receipt.gasUsed;
                return instance.balances(bob);
            })
            .then(balanceBob => assert.strictEqual(toEther(balanceBob), '0'))
            .then( _ => getBalance(bob))
            .then(balanceBob => assert.strictEqual(expectedBalance(balanceBob, gasUsed), '100.1'))
        });

    it("Carol can withdraw funds", function() {
        var gasUsed;
        return instance.splitEther(bob, carol, {from: alice, value:amountToSend })
            .then( _ => instance.withdraw(amountToDraw, { from: carol, gasPrice: gasPrice }))
            .then(trx => {
                gasUsed = trx.receipt.gasUsed;
                return instance.balances(carol);
            })
            .then(balanceCarol => assert.strictEqual(toEther(balanceCarol), '0'))
            .then( _ => getBalance(carol))
            .then(balanceCarol => assert.strictEqual(expectedBalance(balanceCarol, gasUsed), '100.1'))
        });

});
