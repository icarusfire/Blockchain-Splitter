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

    constructor() public {
        users[ALICE] = User(0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c, 0);
        users[BOB] = User(0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C, 0);
        users[CAROL] = User(0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB, 0);
    }
    
    function splitEther() public payable{
        require(msg.sender == users[ALICE].addr);
        uint amount = SafeMath.div(msg.value, 2);
        uint remaining = SafeMath.mod(msg.value, 2);
        users[BOB].balance = SafeMath.add(users[BOB].balance, amount);
        users[CAROL].balance = SafeMath.add(users[CAROL].balance, amount); 
        users[ALICE].balance = SafeMath.add(users[ALICE].balance, remaining);
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

        user.balance = SafeMath.sub(user.balance, amount);
        msg.sender.transfer(amount);
    }
    
    function getContractBalance() public view returns (uint){
        return address(this).balance;
    }
    
    function getUser(string memory name) public view returns (address addr, uint balance){
        return (users[name].addr,  users[name].balance);
    }
    
    function convertAddress(bytes32 data) external pure returns (address payable) {
        return address(uint160(bytes20(data)));
    }
}