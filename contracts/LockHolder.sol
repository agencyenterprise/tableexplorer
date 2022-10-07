// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PaymentSplitter.sol";

contract LockHolder is Ownable {

    event Lock(address indexed collection, uint256[] indexed tokenIds, address indexed owner, string targetCollection, string targetOwner);

    mapping(address => mapping(uint256 => address)) private _holders;

    address public _relay;
    address public _payment;

    constructor(address relay, address owner, address payment) {
        _relay = relay;
        _payment = payment;
        _transferOwnership(owner);
    }

    function setLocker(address relay) public onlyOwner {
        _relay = relay;
    }
    
    function setPayment(address payment) public onlyOwner {
        _payment = payment;
    }

    modifier onlyRelay() {
        require(_relay == msg.sender, "LockHolder: caller not allowed");
        _;
    } 

    function lock(address collection, uint256[] memory tokenIds, string calldata targetCollection, string calldata targetOwner) public payable {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _holders[collection][tokenIds[i]] = msg.sender;
            IERC721(collection).transferFrom(msg.sender, address(this), tokenIds[i]);
        }

        // (bool pay, ) = payable(_payment).call{value: msg.value}("");
        // require(pay, "Hero: Payment failed");
        PaymentSplitter(payable(_payment)).addPayment{value: msg.value}(collection, tokenIds.length);
        emit Lock(collection, tokenIds, msg.sender, targetCollection, targetOwner);
    }
    
    function unlock(address collection, address owner, uint256[] memory tokenIds) public onlyRelay {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_holders[collection][tokenIds[i]] != address(0), "Token not locked for unlocking");
            
            _holders[collection][tokenIds[i]] = address(0);
            IERC721(collection).transferFrom(address(this), owner, tokenIds[i]);
        }
    }

    function lockedBy(address collection, uint256 tokenId) public view returns(address) {
        return _holders[collection][tokenId];
    }


    
    // function locks(address collection) public view returns(mapping(uint256 => address) memory) {
    //     return _holders[collection];
    // }
}