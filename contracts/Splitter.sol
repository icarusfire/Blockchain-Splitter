pragma solidity 0.5.8;

import "./UserCRUD.sol";

contract Splitter is UserCRUD {
    
    address owner;
    constructor() public payable {
        owner = msg.sender;
    }

    function splitEther(uint amount) public payable{
        address sender = msg.sender;
        bytes32 key = toBytes32(msg.sender);
        (address addr,, bool canSplitEther,,) = getUser(key);
        require(addr != address(0x0));
        require(canSplitEther);
        require(addr.balance >= amount);
        uint count =  getUserCount();
        require(count >= 3);
        uint transferAmount =  amount / (count-1);
        for (uint i = 0; i < count; i++) {
            bytes32 userKey = getUserAtIndex(i);
            address payable recepientAddress = this.convertAddress(userKey);
            if(recepientAddress != sender){
                (,string memory recepientName,,,) = getUser(userKey);
                recepientAddress.transfer(transferAmount);
            }
        }
    }

    function registerUser(bytes32 addr, string memory name, bool canSplitEther, bool canReceiveSplittedEther, bool isAdmin) public {
        require (msg.sender == owner);
        newUser(addr, name, canSplitEther, canReceiveSplittedEther, isAdmin);
    }
    
    function getUserInfoAtIndex(uint index) public view returns(address addr, string memory name, uint userBalance, uint accountBalance) {
        bytes32 userKey = getUserAtIndex(index);
        address payable recepientAddress = this.convertAddress(userKey);
        (,string memory recepientName,,,) = getUser(userKey);
        return (recepientAddress, recepientName, recepientAddress.balance, address(this).balance);
    }
    
    function getUserInfoByName(string memory name) public view returns(address addr, uint userBalance) {
        uint count =  getUserCount();
        for (uint i = 0; i < count; i++) {
            bytes32 userKey = getUserAtIndex(i);
            address payable recepientAddress = this.convertAddress(userKey);
            (,string memory recepientName,,,) = getUser(userKey);
            if(this.compareStrings(name, recepientName)){
                return (recepientAddress, recepientAddress.balance);
            }
        }
    }
    
}