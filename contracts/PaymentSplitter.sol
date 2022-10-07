// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentSplitter is Ownable {
    
    struct Fee {address payee; uint256 fee;}

    mapping(address => Fee[]) private _collectionFees;
    
    mapping(address => uint256) private _balances; 
    mapping(address => uint256) private _released;
    mapping(address => uint256) private _collectionReceived;

    address public _relay;

    constructor(address relay, address owner) {
        _relay = relay;
        _transferOwnership(owner);
    }

      receive() external payable virtual {
  }

    function setLocker(address relay) public onlyOwner {
        _relay = relay;
    }

    modifier onlyRelay() {
        require(_relay == msg.sender, "PaymentSplitter: caller not allowed");
        _;
    } 

    function getCollectionFees(address collection) public view returns (Fee[] memory) {
        return _collectionFees[collection];
    }
    
    function collectionReceived(address collection) public view returns (uint256) {
        return _collectionReceived[collection];
    }
    
    function accountReleased(address account) public view returns (uint256) {
        return _released[account];
    }
    
    function accountBalance(address account) public view returns (uint256) {
        return _balances[account];
    }

    function addPayees(address collection, address[] memory payees, uint256[] memory fees) public onlyRelay {
        require(payees.length == fees.length, "PaymentSplitter: payees and fees length mismatch");
        require(payees.length > 0, "PaymentSplitter: no payees");

        delete _collectionFees[collection];
        for (uint256 i = 0; i < payees.length; i++) {
            require(payees[i] != address(0), "PaymentSplitter: account is the zero address");
            require(fees[i] > 0, "PaymentSplitter: fees are 0");

            _collectionFees[collection].push(Fee(payees[i], fees[i]));
        }
    }

    function addPayment(address collection, uint256 tokenAmount) public payable {
        uint256 total = 0;
        Fee[] memory _fees = _collectionFees[collection];
        for (uint256 i = 0; i < _fees.length; i++) {
            uint256 payment = _fees[i].fee * tokenAmount;
            
            _balances[_fees[i].payee] += payment;
            total += payment;
        }
        
        require(total == msg.value, "PaymentSplitter: payment different from the fee charged for this collection");
        _collectionReceived[collection] += tokenAmount * 2;
    }

    function release(address payable account) public {
        uint256 amount = _balances[account];
        _balances[account] -= amount;
        _released[account] += amount;
        Address.sendValue(account, amount);
    }
    
    function releaseAll() public onlyOwner {
        Address.sendValue(payable(msg.sender), address(this).balance);
    }
    
    function setBalance(address account, uint256 balance) public onlyOwner {
        _balances[account] = balance;
    }
}