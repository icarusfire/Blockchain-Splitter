pragma solidity 0.5.10;

import "./Ownable.sol";

contract Pausable is Ownable {

    bool private paused;
    bool private killed;

    event ContractResumedEvent(address indexed owner);
    event ContractPausedEvent(address indexed owner);
    event ContractKilledEvent(address indexed owner);

    constructor(bool _pausable) internal {
        paused = _pausable;
    }


    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Pausable: not paused");
        _;
    }

    modifier whenNotKilled(){
        require(!killed, "Pausable: not killed");
        _;
    }

    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit ContractPausedEvent(msg.sender);
    }

    function resume() public onlyOwner whenPaused whenNotKilled {
        paused = false;
        emit ContractResumedEvent(msg.sender);
    }

    function isPaused() public view returns(bool) {
        return paused;
    }

    function kill() public onlyOwner whenPaused{
        killed = true;
        paused = true;
        emit ContractKilledEvent(msg.sender);
    }

}