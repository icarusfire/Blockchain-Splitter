pragma solidity 0.5.8;

import "./SafeMath.sol";

contract Splitter {

    string constant ALICE = "Alice";
    string constant BOB = "Bob";
    string constant CAROL = "Carol";

    mapping(string => User) users;

    struct User {
        address addr;
        uint balance;
    }

    constructor() public {}

    function splitEther() public payable{
        require(msg.sender == users[ALICE].addr);
        uint amount = SafeMath.div(msg.value, 2);
        uint remaining = SafeMath.mod(msg.value, 2);
        users[BOB].balance += amount;
        users[CAROL].balance += amount;
        users[ALICE].balance += remaining;

    }

    function withdraw(uint amount) public returns (uint){
        require (amount > 0);
        User memory user;
        if(msg.sender == users[ALICE].addr){
            user = users[ALICE];
        }
        else if(msg.sender == users[BOB].addr){
            user = users[BOB];
        }
        else if(msg.sender == users[CAROL].addr){
            user = users[CAROL];
        }
        else{
            revert();
        }
        require (user.balance >= amount);
        require (address(this).balance >= amount);

        user.balance -= amount;
        msg.sender.transfer(amount);
    }

    function getContractBalance() public view returns (uint){
        return address(this).balance;
    }

    function getUser(string memory name) public view returns (address addr, uint balance){
        return (users[name].addr,  users[name].balance);
    }
}