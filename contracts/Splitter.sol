pragma solidity 0.5.8;
import "./SafeMath.sol";

contract Splitter {
       
    event LogSplitEvent(uint256 amountToBeSplitted, uint256 aliceBalance, uint256 bobBalance, uint256 carolBalance, uint256 contractBalance);
    event LogWithdrawEvent(address sender, uint256 amountDrawn, uint256 senderFinalBalance, uint256 contractBalance);

    address public alice;
    address public bob;
    address public carol;

    mapping(address => uint256) public balances;

    constructor(address a, address b, address c) public {
        require(a != address(0) || b != address(0) || c != address(0));
        alice = a;
        bob = b;
        carol = c;
    }
    
    function splitEther() public payable{
        require(msg.sender == alice);
        require(msg.value > 0);

        uint256 amount = SafeMath.div(msg.value, 2);
        uint256 remaining = SafeMath.mod(msg.value, 2);
        balances[bob] = SafeMath.add(balances[bob], amount);
        balances[carol] = SafeMath.add(balances[carol], amount); 
        balances[alice] = SafeMath.add(balances[alice], remaining);
        emit LogSplitEvent(msg.value, balances[alice], balances[bob], balances[carol], getContractBalance());
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