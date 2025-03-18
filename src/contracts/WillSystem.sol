// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WillSystem {
    struct Will {
        address creator;
        address[] beneficiaries;
        uint256[] shares;
        bool executed;
    }

    mapping(uint256 => Will) public wills;
    uint256 public willCount;

    event WillCreated(address indexed creator, uint256 indexed willId);
    event WillExecuted(uint256 indexed willId);

    constructor() {
        willCount = 0;
    }

    function createWill(address[] memory _beneficiaries, uint256[] memory _shares) public returns (uint256) {
        require(_beneficiaries.length == _shares.length, "Beneficiaries and shares must match");
        require(_beneficiaries.length > 0, "Must have at least one beneficiary");
        
        uint256 totalShares = 0;
        for (uint256 i = 0; i < _shares.length; i++) {
            totalShares += _shares[i];
        }
        require(totalShares == 100, "Total shares must equal 100");

        uint256 willId = willCount++;
        wills[willId] = Will({
            creator: msg.sender,
            beneficiaries: _beneficiaries,
            shares: _shares,
            executed: false
        });

        emit WillCreated(msg.sender, willId);
        return willId;
    }

    function executeWill(uint256 _willId) public {
        Will storage will = wills[_willId];
        require(!will.executed, "Will already executed");
        require(msg.sender == will.creator, "Only creator can execute");

        will.executed = true;
        emit WillExecuted(_willId);

        // In a real implementation, this would handle asset distribution
        // For now, it just marks the will as executed
    }

    function getWillDetails(uint256 _willId) public view returns (Will memory) {
        return wills[_willId];
    }
}