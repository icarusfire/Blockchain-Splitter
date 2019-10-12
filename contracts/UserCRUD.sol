pragma solidity 0.5.8;

import "./HitchensUnorderedKeySet.sol";

contract UserCRUD {
    
    using HitchensUnorderedKeySetLib for HitchensUnorderedKeySetLib.Set;
    HitchensUnorderedKeySetLib.Set widgetSet;
    
    struct UserStruct {
        string name;
        bool canSplitEther;
        bool canReceiveSplittedEther;
        bool isAdmin;
    }
    
    mapping(bytes32 => UserStruct) users;
    
    event LogNewUser(address sender, bytes32 key, string name, bool canSplitEther, bool canReceiveSplittedEther, bool isAdmin);
    event LogUpdateUser(address sender, bytes32 key, string name, bool canSplitEther, bool canReceiveSplittedEther, bool isAdmin);    
    event LogRemUser(address sender, bytes32 key);
    
    function newUser(bytes32 key, string memory name, bool canSplitEther, bool canReceiveSplittedEther, bool isAdmin) public {
        widgetSet.insert(key); // Note that this will fail automatically if the key already exists.
        UserStruct storage w = users[key];
        w.name = name;
        w.canSplitEther = canSplitEther;
        w.canReceiveSplittedEther = canReceiveSplittedEther;
        w.isAdmin = isAdmin;
        emit LogNewUser(msg.sender, key, name, canSplitEther, canReceiveSplittedEther, isAdmin);
    }
    
    function updateUser(bytes32 key, string memory name, bool canSplitEther, bool canReceiveSplittedEther, bool isAdmin) public {
        require(widgetSet.exists(key), "Can't update a user that doesn't exist.");
        UserStruct storage w = users[key];
        w.name = name;
        w.canSplitEther = canSplitEther;
        w.canReceiveSplittedEther = canReceiveSplittedEther;
        w.isAdmin = isAdmin;
        emit LogUpdateUser(msg.sender, key, name, canSplitEther, canReceiveSplittedEther, isAdmin);
    }
    
    function remUser(bytes32 key) public {
        widgetSet.remove(key); // Note that this will fail automatically if the key doesn't exist
        delete users[key];
        emit LogRemUser(msg.sender, key);
    }
    
    function getUser(bytes32 key) public view returns(address addr, string memory name, bool canSplitEther, bool canReceiveSplittedEther, bool isAdmin) {
        require(widgetSet.exists(key), "Can't get a user that doesn't exist.");
        UserStruct storage w = users[key];
        return(this.convertAddress(key), w.name, w.canSplitEther, w.canReceiveSplittedEther, w.isAdmin);
    }
    
    function getUserCount() public view returns(uint count) {
        return widgetSet.count();
    }
    
    function getUserAtIndex(uint index) public view returns(bytes32 key) {
        return widgetSet.keyAtIndex(index);
    }
    function convertAddress(bytes32 data) external pure returns (address payable) {
        return address(uint160(bytes20(data)));
    }
    
    function toBytes32(address a) public pure returns (bytes32) {
        return bytes32(uint256(a) << 96 );
    }
    
    function compareStrings (string memory a, string memory b) public pure 
       returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))) );
    }
}
