pragma solidity 0.5.10;

import "./Splitter.sol";
import "./SafeMath.sol";

contract EvilSplitterConsumer {
    using SafeMath for uint256;

    event LogConsumerFundsReceivedFallbackEvent(address indexed sender, uint256 amountDrawn, uint256 balance);

    function() external payable {
        emit LogConsumerFundsReceivedFallbackEvent(msg.sender, msg.value, address(this).balance);
     }

    function withdrawFunds(Splitter splitter, uint256 amount) public {
        require (amount > 0, "Withdraw amount should be higher than 0");
        splitter.withdraw(amount);
    }
}