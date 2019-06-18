pragma solidity ^0.4.19;

import "./ownership/Ownable.sol";

import "./LicenseSale.sol";

/**
 * @title LicenseCore is the entry point of the contract
 * @notice LicenseCore is the entry point and it controls the ability to set a new
 * contract address, in the case where an upgrade is required
 */
contract LicenseCore is Ownable, LicenseSale {
  address public newContractAddress;

  function LicenseCore() public {
    paused = false;

    owner = msg.sender;
    withdrawalAddress = msg.sender;
  }

  function setNewAddress(address _v2Address) external onlyOwner whenPaused {
    newContractAddress = _v2Address;
    ContractUpgrade(_v2Address);
  }

  function() external {
    assert(false);
  }

  function unpause() public onlyOwner whenPaused {
    require(newContractAddress == address(0));
    super.unpause();
  }
}
