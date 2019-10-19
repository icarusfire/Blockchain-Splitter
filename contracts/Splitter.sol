pragma solidity 0.5.8;
import "./SafeMath.sol";

contract Splitter {
       
    event LogSplitEvent(uint256 amountToBeSplitted, uint256 aliceBalance, uint256 bobBalance, uint256 carolBalance, uint256 contractBalance);
    event LogWithdrawEvent(address sender, uint256 amountDrawn, uint256 senderFinalBalance, uint256 contractBalance);

    mapping(address => uint256) public balances;

    constructor() public {
    }
    
    function splitEther(address recp1, address recp2) public payable{
        require(msg.value > 0);
        require(recp1 != address(0) || recp2 != address(0));

        uint256 amount = SafeMath.div(msg.value, 2);
        uint256 remaining = SafeMath.mod(msg.value, 2);
        balances[recp1] = SafeMath.add(balances[recp1], amount);
        balances[recp2] = SafeMath.add(balances[recp2], amount); 
        balances[msg.sender] = SafeMath.add(balances[msg.sender], remaining);
        emit LogSplitEvent(msg.value, balances[msg.sender], balances[recp1], balances[recp2], getContractBalance());
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