pragma solidity 0.5.10;

import "./Ownable.sol";

contract Pausable is Ownable{

    bool private paused;

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Pausable: not paused");
        _;
    }

    function pause() public onlyOwner whenNotPaused{
        paused = true;
    }

    function resume() public onlyOwner whenPaused{
        paused = false;
    }

    function isPaused() public view returns(bool) {
        return paused;
    }

    function kill() public onlyOwner {
        selfdestruct(msg.sender);
    }

}