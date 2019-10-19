pragma solidity 0.5.8;
import "./SafeMath.sol";

contract Splitter {     
    using SafeMath for uint256;
    event LogSplitEvent(address sender, uint256 amountToBeSplitted, address addressRecp1, address addressRecp2);
    event LogWithdrawEvent(address sender, uint256 amountDrawn, uint256 remainingContractBalance);
    
    address constant NULL = address(0);   
    mapping(address => uint256) public balances;

    constructor() public {}
    
    function splitEther(address recp1, address recp2) public payable{
        require(msg.value > 0, "Split amount should be higher than 0");
        require(recp1 != NULL && recp2 != NULL, "One or more addresses is missing");
    
        uint256 amount = msg.value.div(2);
        uint256 remaining = msg.value.mod(2);
        balances[recp1] = balances[recp1].add(amount);
        balances[recp2] = balances[recp2].add(amount); 
        balances[msg.sender] = balances[msg.sender].add(remaining);
        emit LogSplitEvent(msg.sender, msg.value, recp1, recp2);
    }
    
    function withdraw(uint256 amount) public{
        require (amount > 0, "Withdraw amount should be higher than 0");
        require (balances[msg.sender] >= amount, "Not eneough user funds");
        require (address(this).balance >= amount, "Not eneough contract funds");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        emit LogWithdrawEvent(msg.sender, amount, address(this).balance);
        msg.sender.transfer(amount);
    }           
}