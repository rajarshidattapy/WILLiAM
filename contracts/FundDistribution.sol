// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundDistributor {
    address public admin;
    mapping(address => uint256) public percentages;
    address[] public recipients;

    // Reentrancy guard to prevent reentrancy attacks
    bool private locked;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier noReentrancy() {
        require(!locked, "Reentrancy attack detected!");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        admin = msg.sender;
    }

    function setRecipients(address[] memory _recipients, uint256[] memory _percentages) public onlyAdmin {
        require(_recipients.length == _percentages.length, "Recipients and percentages arrays must have the same length");
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _percentages.length; i++) {
            totalPercentage += _percentages[i];
        }
        require(totalPercentage == 100, "Total percentage must be 100");

        // Clear previous recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            delete percentages[recipients[i]];
        }
        delete recipients;

        // Set new recipients and percentages
        for (uint256 i = 0; i < _recipients.length; i++) {
            percentages[_recipients[i]] = _percentages[i];
            recipients.push(_recipients[i]);
        }
    }

    function distributeFunds() public payable onlyAdmin noReentrancy {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to distribute");

        // First, calculate the total distributed amount to ensure percentages add up correctly
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 amount = (balance * percentages[recipients[i]]) / 100;
            totalDistributed += amount;
        }

        // Ensure that the total distributed amount is equal to the balance
        require(totalDistributed == balance, "Distribution amounts do not add up to total balance");

        // Now, transfer the funds to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = (balance * percentages[recipient]) / 100;
            payable(recipient).transfer(amount);
        }
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
