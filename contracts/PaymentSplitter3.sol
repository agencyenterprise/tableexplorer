// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentSplitter3 is Ownable {
    
    mapping(address => mapping(address => uint256)) private _collectionFees;
    mapping(address => uint256) private _collectionTotalFees;
    
    mapping(address => mapping(address => uint256)) private _collectionReleased;
    mapping(address => uint256) private _collectionTotalReceived;

    address[] private collections;

    function totalFees(address collection) public view returns (uint256) {
        return _collectionTotalFees[collection];
    }
    
    // function totalReleased(address collection) public view returns (uint256) {
    //     uint256 amount = 0;
    //     for (uint256 i = 0; i < collections.length; i++) {
    //         address collection = collections[i];

    //         uint256 fee = _collectionFees[collection][account];
    //         if(fee != 0) {
    //             uint256 released = _collectionReleased[collection][account];
    //             uint256 totalReceived = _collectionTotalReceived[collection];
    //             uint256 diff = totalReceived - released;
    //             amount += diff * fee;

    //             _collectionReleased[collection][account] = released + diff;
    //         }
    //     }
    // }

    function addPayees(address collection, address[] memory payees, uint256[] memory fees) public {
        require(payees.length == fees.length, "PaymentSplitter: payees and fees length mismatch");
        require(payees.length > 0, "PaymentSplitter: no payees");

        uint256 _totalFees = 0;
        for (uint256 i = 0; i < payees.length; i++) {
            _collectionFees[collection][payees[i]] = fees[i];
            _totalFees += fees[i];
        }

        _collectionTotalFees[collection] = _totalFees;
        collections.push(collection);
    }

    function addPayment(address collection, uint256 tokenAmount) public payable {
        uint256 collectionShare = _collectionTotalFees[collection];
        require(collectionShare * tokenAmount == msg.value, "PaymentSplitter: payment different from the fee charged for this collection");
        _collectionTotalReceived[collection] += tokenAmount;
    }

    function release(address payable account) public {
        uint256 amount = 0;
        for (uint256 i = 0; i < collections.length; i++) {
            address collection = collections[i];

            uint256 fee = _collectionFees[collection][account];
            if(fee != 0) {
                uint256 released = _collectionReleased[collection][account];
                uint256 totalReceived = _collectionTotalReceived[collection];
                uint256 diff = totalReceived - released;
                amount += diff * fee;

                _collectionReleased[collection][account] = released + diff;
            }
        }
        Address.sendValue(account, amount);
    }
}