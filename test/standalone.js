const Web3 = require('web3');
const web3 = new Web3(require('ganache-cli').provider());
const truffleContract = require("truffle-contract");
const Splitter = truffleContract(require(__dirname + "/../build/contracts/Splitter.json"));
const EvilSplitterConsumer = truffleContract(require(__dirname + "/../build/contracts/EvilSplitterConsumer.json"));

Splitter.setProvider(web3.currentProvider);
EvilSplitterConsumer.setProvider(web3.currentProvider);

const assert = require('assert-plus');
Promise = require("bluebird");
const truffleAssert = require('truffle-assertions');
const getBalance = web3.eth.getBalance;
const getTransaction =  Promise.promisify(web3.eth.getTransaction);
const { BN, sha3 } = web3.utils;

const toWei = function(val) { return web3.utils.toWei(val, "ether") };
const equalsInWei = function(val1, val2) { return assert.strictEqual(val1.toString(10), toWei(val2).toString(10)) };

const amountToSend = toWei("0.2");
const amountToSendBig = toWei("3.48");
const amountToDraw = toWei("0.1");

const expectedBalanceDifference = function (initialBalance, balance, gasUsed, gasPrice) {
     return new BN(balance)
        .add(new BN(gasUsed)
        .mul(gasPrice))
        .sub(new BN(initialBalance)); 
    }

describe("Splitter", function() {
    
    console.log("Current host:", web3.currentProvider.host);
    let accounts, networkId, instance, owner, alice, bob, carol;

    before("get accounts", async function() {
        accounts = await web3.eth.getAccounts();
        networkId = await web3.eth.net.getId();
        Splitter.setNetwork(networkId);
        EvilSplitterConsumer.setNetwork(networkId);
        [owner, alice, bob, carol, mike, evilContractOwner] = accounts;
    });
    
    beforeEach("create new instance", async function() {
        instance = await Splitter.new(false, {from: owner} )
    });

    it("bob and Carol's balances should be 0.1 after receiving a split", function() {
        return instance.splitEther(bob, carol, { from: alice, value:amountToSend })
            .then( _ => instance.balances(bob))
            .then(balanceBob => equalsInWei(balanceBob, '0.1'))
            .then( _ => instance.balances(carol))
            .then(balanceCarol => equalsInWei(balanceCarol, '0.1')) 
    });

    it("bob and Carol's balances should be 1.84 after receiving 2 splits", function() {
        return instance.splitEther(bob, carol, { from: alice, value:amountToSend })
            .then( _ => instance.splitEther(bob, carol, { from: alice, value:amountToSendBig }))
            .then( _ => instance.balances(bob))
            .then(balanceBob => equalsInWei(balanceBob, '1.84'))
            .then( _ => instance.balances(carol))
            .then(balanceCarol => equalsInWei(balanceCarol, '1.84'))     
    });        
        
    it("bob can withdraw funds", function() {
        let gasUsed;
        let gasPrice;
        let balanceBobInitial;

        return getBalance(bob)
            .then(_bobInitalBalance => {
                balanceBobInitial = _bobInitalBalance;
                return instance.splitEther(bob, carol, {from: alice, value:amountToSend })
            })
            .then( _ => instance.withdraw(amountToDraw, { from: bob }))
            .then(trx => {
                gasUsed = trx.receipt.gasUsed;
                return getTransaction(trx.tx);
            })
            .then(transaction => { 
                gasPrice = transaction.gasPrice;
            })
            .then( _ => instance.balances(bob))
            .then(balanceBob => equalsInWei(balanceBob, '0'))
            .then( _ => getBalance(bob))
            .then(balanceBob => equalsInWei(expectedBalanceDifference(balanceBobInitial, balanceBob, gasUsed, new BN(gasPrice)), '0.1'))
    });

    it("carol can withdraw funds", function() {
        let gasUsed;
        let gasPrice;
        let balanceCarolInitial;

        return getBalance(carol)
            .then(_carolInitalBalance => {
                balanceCarolInitial = _carolInitalBalance;
                return instance.splitEther(bob, carol, {from: alice, value:amountToSend })
            })
            .then( _ => instance.withdraw(amountToDraw, { from: carol }))
            .then(trx => {
                gasUsed = trx.receipt.gasUsed;
                return getTransaction(trx.tx);
            })
            .then(transaction => { 
                gasPrice = transaction.gasPrice;
            })
            .then( _ => instance.balances(carol))
            .then(balanceCarol => equalsInWei(balanceCarol, '0'))
            .then( _ => getBalance(carol))
            .then(balanceCarol => equalsInWei(expectedBalanceDifference(balanceCarolInitial, balanceCarol, gasUsed, new BN(gasPrice)), '0.1'))
    });

    it("should emit events after splitting Ether", function() {
        return instance.splitEther(bob, carol,{from: alice, value:amountToSend }) 
            .then(tx => {
                truffleAssert.eventEmitted(tx, 'LogSplitEvent', (event) => {
                    return event.recp1 === bob && event.recp2 === carol && event.amountToBeSplitted.cmp(new BN(amountToSend)) === 0 && event.sender === alice;
                });
            })
    });

    it("should emit events after withdraw", function() {
        return instance.splitEther(bob, carol, {from: alice, value:amountToSend })
            .then( _ => instance.withdraw(amountToDraw, { from: bob }))
            .then(tx => {
                truffleAssert.eventEmitted(tx, 'LogWithdrawEvent', (event) => {
                    return event.amountDrawn.toString(10) == amountToDraw && event.sender === bob;
                });
            })
    });
    
    it("should emit events after owner changed", function() {
        return instance.setOwner(bob, {from: owner})
            .then(tx => {
                truffleAssert.eventEmitted(tx, 'OwnerChangedEvent', (event) => {
                    return event.from === owner && event.to === bob;
                });
            })
    });    
      
    it("Bob can't pause", async function() {
            await truffleAssert.reverts(instance.pause( {from: bob} ), "Only owner can execute this action");
    });
    
    it("Bob can't kill", async function() {
            await truffleAssert.reverts(instance.kill( {from: bob} ), "Only owner can execute this action");
    });

    it("Owner can kill when paused", async function() {
            await instance.pause( {from: owner} );
            await truffleAssert.passes(instance.kill( {from: owner} ));
    });
    
    it("Owner can't kill when not paused", async function() {
            await truffleAssert.reverts(instance.kill( {from: owner} ), "Pausable: not paused");
    });

    it("should abort with an error when Paused", function() {
        return instance.pause({ from: owner})
            .then(truffleAssert.reverts(instance.withdraw(amountToDraw, { from: bob}), "Pausable: paused"))
            .then(truffleAssert.reverts(instance.splitEther(bob, carol, {from: alice, value:amountToSend }), "Pausable: paused"));
    });

    it("should emit fallback event and withdraw event", async function() {
        const amountToDraw = toWei("1.2", "ether");
        const evilInstance = await EvilSplitterConsumer.new( {from: evilContractOwner} );
        await instance.splitEther(evilInstance.address, mike, {from: alice, value:toWei("4", "ether")});

        const evilContractBalance = await instance.balances(evilInstance.address);
        equalsInWei(evilContractBalance, '2');
        
        const tx = await evilInstance.withdrawFunds(instance.address, amountToDraw, {from: evilContractOwner});

        const evilContractBalanceAfter = await instance.balances(evilInstance.address);
        equalsInWei(evilContractBalanceAfter, '0.8');

        truffleAssert.eventEmitted(tx, 'LogConsumerFundsReceivedFallbackEvent', (event) => {
            return event.amountDrawn.toString(10) == amountToDraw && event.sender === instance.address;
        });
         
        const fallbackEventHash = sha3('LogConsumerFundsReceivedFallbackEvent(address,uint256,uint256)');
        const withdrawEventHash = sha3('LogWithdrawEvent(address,uint256)');

        assert.strictEqual(tx.receipt['rawLogs'].length, 2);
        assert.strictEqual(withdrawEventHash, tx.receipt['rawLogs'][0].topics[0]);
        assert.strictEqual(fallbackEventHash, tx.receipt['rawLogs'][1].topics[0]);
    });

});