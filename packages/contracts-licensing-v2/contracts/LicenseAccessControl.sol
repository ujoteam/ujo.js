pragma solidity ^0.4.19;

import "./ownership/Ownable.sol";

/**
 * @title LicenseAccessControl
 * @notice This contract defines organizational roles and permissions.
 */
contract LicenseAccessControl is Ownable {
  /**
   * @notice ContractUpgrade is the event that will be emitted if we set a new contract address
   */
  event ContractUpgrade(address newContract);
  event Paused();
  event Unpaused();

  /**
   * @notice withdrawal address
   */
  address public withdrawalAddress;

  bool public paused = false;

  /**
   * @notice Sets a new withdrawalAddress
   * @param _newWithdrawalAddress - the address where we'll send the funds
   */
  function setWithdrawalAddress(address _newWithdrawalAddress) external onlyOwner {
    require(_newWithdrawalAddress != address(0));
    withdrawalAddress = _newWithdrawalAddress;
  }

  /**
   * @notice Withdraw the balance to the withdrawalAddress
   * @dev We set a withdrawal address seperate from the CFO because this allows us to withdraw to a cold wallet.
   */
  function withdrawBalance() external onlyOwner {
    require(withdrawalAddress != address(0));
    withdrawalAddress.transfer(this.balance);
  }

  /** Pausable functionality adapted from OpenZeppelin **/

  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @notice called by owner to pause, triggers stopped state
   */
  function pause() public onlyOwner whenNotPaused {
    paused = true;
    Paused();
  }

  /**
   * @notice called by the owner to unpause, returns to normal state
   */
  function unpause() public {
    paused = false;
    Unpaused();
  }
}
