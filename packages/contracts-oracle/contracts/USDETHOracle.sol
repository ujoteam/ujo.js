pragma solidity ^0.5.0;
import "./ILighthouse.sol";

/*
Oraclize -> Rhombus:
This oracle was changed/morphed to using Rhombus over Oraclize.
The old API is getUintPrice(), thus this shim essentially just allows it keep the old API.
It adds some extra gas costs. If it gets too much, then the other contracts could be changed to use the Rhombus API instead.
*/
contract USDETHOracle {

    address public rhombusLighthouse;

    constructor(address _rhombusLighthouse) public {
        rhombusLighthouse = _rhombusLighthouse;
    }

    function getUintPrice() public view returns (uint) {
        (uint128 price, bool notTooLongSinceUpdated) = ILighthouse(rhombusLighthouse).peekData();
        return price;
    }
}
