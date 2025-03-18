// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FundDistributor.sol";  // Import the FundDistributor contract

contract FundDistributorFactory {
    address[] public admins;
    mapping(address => bool) public isAdmin;
    FundDistributor[] public deployedContracts;

    event FundDistributorCreated(address indexed contractAddress, address indexed creator);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only registered admins");
        _;
    }

    constructor(address initialAdmin) {
        _addAdmin(initialAdmin);
    }

    function _addAdmin(address newAdmin) private {
        require(!isAdmin[newAdmin], "Admin already exists");
        isAdmin[newAdmin] = true;
        admins.push(newAdmin);
    }

    function addAdmin(address newAdmin) external onlyAdmin {
        _addAdmin(newAdmin);
    }

    function removeAdmin(address adminToRemove) external onlyAdmin {
        require(isAdmin[adminToRemove], "Not an admin");
        isAdmin[adminToRemove] = false;
        for (uint256 i = 0; i < admins.length; i++) {
            if (admins[i] == adminToRemove) {
                admins[i] = admins[admins.length - 1];
                admins.pop();
                break;
            }
        }
    }

    function deployFundDistributor() external onlyAdmin returns (address) {
        FundDistributor newContract = new FundDistributor();
        deployedContracts.push(newContract);
        emit FundDistributorCreated(address(newContract), msg.sender);
        return address(newContract);
    }

    function getAdmins() external view returns (address[] memory) {
        return admins;
    }

    function getDeployedContracts() external view returns (FundDistributor[] memory) {
        return deployedContracts;
    }
}
