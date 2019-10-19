pragma solidity 0.5.8;
import "./SafeMath.sol";

contract Splitter {
       
    event LogSplitEvent(uint256 amountToBeSplitted, uint256 aliceBalance, uint256 bobBalance, uint256 carolBalance, uint256 contractBalance);
    event LogWithdrawEvent(address sender, uint256 amountDrawn, uint256 senderFinalBalance, uint256 contractBalance);

    mapping(address => uint256) public balances;

    constructor(address a, address b, address c) public {
        require(a != address(0) || b != address(0) || c != address(0));
    }
    
    function splitEther(address b, address c) public payable{
        require(msg.value > 0);

        uint256 amount = SafeMath.div(msg.value, 2);
        uint256 remaining = SafeMath.mod(msg.value, 2);
        balances[b] = SafeMath.add(balances[b], amount);
        balances[c] = SafeMath.add(balances[c], amount); 
        balances[msg.sender] = SafeMath.add(balances[msg.sender], remaining);
        emit LogSplitEvent(msg.value, balances[msg.sender], balances[b], balances[c], getContractBalance());
    }
    
    function withdraw(uint256 amount) public{
        require (amount > 0);
        require (balances[msg.sender] >= amount);
        require (address(this).balance >= amount);
        balances[msg.sender]  = SafeMath.sub(balances[msg.sender] , amount);
        msg.sender.transfer(amount);
        emit LogWithdrawEvent(msg.sender, amount, balances[msg.sender], getContractBalance());
    }
    
    function getContractBalance() public view returns (uint256){
        return address(this).balance;
    }
    
    function getUser(address addr) public view returns (uint256 balance){
        return balances[addr];
    }
    
}