pragma solidity ^0.5.0;


// Interface for the Oracle
contract IUSDETHOracle {

    string public ethUsdString;
    uint public ethUsdUint;
    uint public lastUpdated;

    address public admin;
    bool public lock = false;
    uint256 public intervalInSeconds;
    mapping(bytes32 => bool) public myidList;
    string public url;

    // solhint-disable no-empty-blocks
    function getPrice() public view returns (string memory) {}

    function getUintPrice() public view returns (uint) { }
    // solhint-enable
}