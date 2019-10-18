// deploy Splitter contract
// Create 3 extra accounts
// Register these accounts to contract by "registerUser" method, using the owner's account
// Call split method on the contract 

const Splitter = artifacts.require("Splitter");
Promise = require("bluebird");
const getBalancePromise = Promise.promisify(web3.eth.getBalance);
var alice = accounts[0];
var bob = accounts[1];
var carol = acocunts[2];
var BN = web3.utils.BN;

contract('Splitter', (accounts) => {
  it('contract balance should be 0', async () => {
    const splitterInstance = await Splitter.deployed();
	const owner = await splitterInstance.getOwner();
	const amountToSend = new BN(10);
	await web3.eth.sendTransaction({to:splitterInstance.address, from:accounts[4], value:web3.utils.toWei(amountToSend)})
    const balance = await splitterInstance.getBalance.call();
	const ethBalance = web3.utils.fromWei(balance,'ether');
	console.log("balance", ethBalance);
    assert.equal(ethBalance, 10, "10 wasn't the initial contract balance");
  });
  
  it("create three accounts", async () => {
      const splitterInstance = await Splitter.deployed();
  	  const owner = await splitterInstance.getOwner();
      await splitterInstance.registerUser(accounts[1], "John", true, true, true, {from: owner }); 
      await splitterInstance.registerUser(accounts[2], "Paul", true, true, true, {from: owner });
      await splitterInstance.registerUser(accounts[3], "Ringo", true, true, true, {from: owner });
  	  const count = await splitterInstance.getUserCount.call();
      console.log("Count", count);
	  assert.equal(count,3);
  });
  
  it("account-1 initial balance should be 100", function() {
         console.log("John", accounts[1])
	  	 return getBalancePromise(accounts[1]) // This is another promise   
          .then(balance => assert.equal(web3.utils.fromWei(balance,'ether'), "100"));
  });
  
  it("account-2 initial balance should be 100", function() {
         console.log("Paul", accounts[2])
	  	 return getBalancePromise(accounts[2]) // This is another promise   
          .then(balance => assert.equal(web3.utils.fromWei(balance,'ether'), "100"));
  });
  
  it("account-3 initial balance should be 100", function() {
         console.log("Ringo", accounts[3])
	  	 return getBalancePromise(accounts[3]) // This is another promise   
          .then(balance => assert.equal(web3.utils.fromWei(balance,'ether'), "100"));
  });
  
  it('split', async () => {
  const splitterInstance = await Splitter.deployed();
	const amountToSend = web3.utils.toWei(new BN(10));
	await splitterInstance.splitEther({from: alice, value:amountToSend });
	
	const balance1 = await web3.eth.getBalance(accounts[1]);
	const balance1_ETH = web3.utils.fromWei(new BN(balance1),'ether');
	assert.isTrue( balance1_ETH < 90);
	assert.isTrue( balance1_ETH > 89);

	const balance2 = await web3.eth.getBalance(accounts[2]);
	const balance2_ETH = web3.utils.fromWei(new BN(balance2),'ether');
	assert.equal( balance2_ETH, "105");
	
	const balance3 = await web3.eth.getBalance(accounts[3]);
	const balance3_ETH = web3.utils.fromWei(new BN(balance3),'ether');
	assert.equal( balance3_ETH, "105");
  });
});
