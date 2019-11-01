pragma solidity 0.5.8;
import "./SafeMath.sol";

contract Splitter {
    using SafeMath for uint256;
    event LogSplitEvent(address indexed sender, uint256 amountToBeSplitted, address indexed addressRecp1, address indexed addressRecp2);
    event LogWithdrawEvent(address indexed sender, uint256 amountDrawn);

    mapping(address => uint256) public balances;

    constructor() public {}

    function splitEther(address recp1, address recp2) public payable{
        require(msg.value > 0, "Split amount should be higher than 0");
        require(recp1 != address(0) && recp2 != address(0), "Recipient addresses should not be empty");

        uint256 amount = msg.value.div(2);
        uint256 remaining = msg.value.mod(2);
        balances[recp1] = balances[recp1].add(amount);
        balances[recp2] = balances[recp2].add(amount);
        if(remaining != 0){
            balances[msg.sender] = balances[msg.sender].add(remaining);
        }
        emit LogSplitEvent(msg.sender, msg.value, recp1, recp2);
    }

    function withdraw(uint256 amount) public{
        require (amount > 0, "Withdraw amount should be higher than 0");
        uint256 balanceSender = balances[msg.sender];
        require (balanceSender >= amount, "Not eneough user funds");
        balances[msg.sender] = balanceSender.sub(amount);
        emit LogWithdrawEvent(msg.sender, amount);
        msg.sender.transfer(amount);
    }
}