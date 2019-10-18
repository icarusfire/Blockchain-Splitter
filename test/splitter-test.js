const Splitter = artifacts.require("Splitter");
Promise = require("bluebird");
const getBalancePromise = Promise.promisify(web3.eth.getBalance);
var BN = web3.utils.BN;

contract('Splitter', (accounts) => {

  it('split', async () => {
  var alice = accounts[0];
  var bob = accounts[1];
  var carol = accounts[2];

  const splitterInstance = await Splitter.new(alice,bob,carol);

  const contractBalace = await splitterInstance.getContractBalance();
	const contractBalaceETH = web3.utils.fromWei(new BN(contractBalace),'ether');
  assert.equal( contractBalaceETH, "0");

	const amountToSend = web3.utils.toWei(new BN(10));
	await splitterInstance.splitEther({from: alice, value:amountToSend });
  
  const contractBalace2 = await splitterInstance.getContractBalance();
	const contractBalace2ETH = web3.utils.fromWei(new BN(contractBalace2),'ether');
  assert.equal( contractBalace2ETH, "10");

	const balance1 = await web3.eth.getBalance(alice);
  const balance1_ETH = web3.utils.fromWei(new BN(balance1),'ether');
  console.log(balance1_ETH);
	assert.isTrue( balance1_ETH < 90);
  assert.isTrue( balance1_ETH > 89);
  
	const balance2 = await web3.eth.getBalance(bob);
	const balance2_ETH = web3.utils.fromWei(new BN(balance2),'ether');
  assert.equal( balance2_ETH, "100");
  
  const balanceBefore = await splitterInstance.getUser(bob);
	const balanceBefore_ETH = web3.utils.fromWei(new BN(balanceBefore),'ether');
  assert.equal( balanceBefore_ETH, "5");
	
  const amountToDraw = web3.utils.toWei(new BN(5));
  await splitterInstance.withdraw(amountToDraw, {from: bob});
  await splitterInstance.withdraw(amountToDraw, {from: carol});

  const balanceAfter = await web3.eth.getBalance(bob);
	const balanceAfter_ETH = web3.utils.fromWei(new BN(balanceAfter),'ether');
  assert.isTrue( balanceAfter_ETH < "105");
  assert.isTrue( balanceAfter_ETH > "104");

  const balanceBeforeBob = await splitterInstance.getUser(bob);
	const balanceBeforeBob_ETH = web3.utils.fromWei(new BN(balanceBeforeBob),'ether');
  assert.equal( balanceBeforeBob_ETH, "0");
	
  const balanceAfterCarol = await web3.eth.getBalance(carol);
	const balanceAfterCarol_ETH = web3.utils.fromWei(new BN(balanceAfterCarol),'ether');
  assert.isTrue( balanceAfterCarol_ETH < "105");
  assert.isTrue( balanceAfterCarol_ETH > "104");

  const balanceCarol = await splitterInstance.getUser(carol);
	const balanceCarol_ETH = web3.utils.fromWei(new BN(balanceCarol),'ether');
  assert.equal( balanceCarol_ETH, "0");
	
  });
});
