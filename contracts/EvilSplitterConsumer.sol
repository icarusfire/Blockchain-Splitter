pragma solidity 0.5.10;

import "./Splitter.sol";

contract EvilSplitterConsumer {

    event LogConsumerFundsReceivedFallbackEvent(address indexed sender, uint256 amountDrawn, uint256 balance);

    function() external payable {
        emit LogConsumerFundsReceivedFallbackEvent(msg.sender, msg.value, address(this).balance);
     }

    function withdrawFunds(Splitter splitter, uint256 amount) public {
        require (amount > 0, "Evil says, withdraw amount should be higher than 0");
        splitter.withdraw(amount);
    }
}