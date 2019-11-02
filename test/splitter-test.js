Promise = require("bluebird");
const Splitter = artifacts.require("Splitter");
const truffleAssert = require('truffle-assertions');
const getBalancePromise = Promise.promisify(web3.eth.getBalance);
const BN = web3.utils.BN;
const gasPrice = new BN(1000000);
const amountToSend = web3.utils.toWei("0.2", "ether");
const amountToDraw = web3.utils.toWei("0.1", "ether");

var fromWei = function(balance){return web3.utils.fromWei(new BN(balance),'ether');}


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

    it("Bob and Carol's balances has 0.1 ether after split", function() {
        return instance.splitEther(bob, carol, {from: alice, value:amountToSend })
            .then( _ => instance.balances(bob))
            .then(balanceBob => assert.strictEqual(fromWei(balanceBob), '0.1'))
            .then( _ => instance.balances(carol))
            .then(balanceCarol => assert.strictEqual(fromWei(balanceCarol), '0.1'))     
        });
    
    it("Bob can withdraw funds", function() {
        var gasUsed;
        return instance.splitEther(bob, carol, {from: alice, value:amountToSend })
            .then( _ => instance.withdraw(amountToDraw, {from: bob, gasPrice: gasPrice }))
            .then(trx => {
                gasUsed = trx.receipt.gasUsed;
                return instance.balances(bob);
            })
            .then(balanceBob => assert.strictEqual(fromWei(balanceBob), '0'))
            .then( _ => getBalancePromise(bob))
            .then(balanceBob => {
                const trxCost = new BN(gasUsed).mul(gasPrice);
                const balanceBobEth = web3.utils.fromWei(new BN(balanceBob).add(trxCost),'ether');
                assert.strictEqual(balanceBobEth, '100.1');
            })
        });

    it("Carol can withdraw funds", function() {
        var gasUsed;
        return instance.splitEther(bob, carol, {from: alice, value:amountToSend })
            .then( _ => instance.withdraw(amountToDraw, {from: carol, gasPrice: gasPrice }))
            .then(trx => {
                gasUsed = trx.receipt.gasUsed;
                return instance.balances(carol);
            })
            .then(balanceCarol => assert.strictEqual(fromWei(balanceCarol), '0'))
            .then( _ => getBalancePromise(carol))
            .then(balanceCarol => {
                const trxCost = new BN(gasUsed).mul(gasPrice);
                const balanceCarolEth = web3.utils.fromWei(new BN(balanceCarol).add(trxCost),'ether');
                assert.strictEqual(balanceCarolEth, '100.1');
            })
        });

});
