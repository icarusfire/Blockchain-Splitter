pragma solidity 0.5.10;

import "./Splitter.sol";

contract EvilSplitterConsumer {
    event LogConsumerWithdrawFundsEvent(address indexed sender, uint256 amountDrawn);
    event LogConsumerFundsReceivedEvent(address indexed sender, uint256 amountDrawn);

    function() external payable {
        emit LogConsumerFundsReceivedEvent(msg.sender, msg.value);
     }

    function withdrawFunds(Splitter splitter, uint256 amount) public {
        require (amount > 0, "Withdraw amount should be higher than 0");
        splitter.withdraw(amount);
    }
}