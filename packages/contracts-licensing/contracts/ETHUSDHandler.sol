pragma solidity ^0.5.0; //solhint-disable-line
import "./IUSDETHOracle.sol";


// Interface for Recipient.
// NOTE: Does not currently support ERC165 [for interface signature checking].
// Future Handler Deployments Will Incorporate This.
contract IRecipient {
    function receiveNotification(string memory _cid,
    address _oracle,
    address _buyer,
    address payable[] memory _beneficiaries,
    uint256[] memory _amounts) public payable;
}


contract ETHUSDHandler {

    function pay(string memory _cid,
    address _oracle,
    address _buyer, // this is for the case that someone else pays on your behalf
    address payable[] memory _beneficiaries,
    uint256[] memory _amounts,
    address[] memory _notifiers) public payable {

        // checks if the payment isn't egregiously malformed.
        require(_beneficiaries.length == _amounts.length);
        uint256 i = 0;
        if (msg.value == 0) {
            require(_beneficiaries.length == 0);
            require(_amounts.length == 0);
        } else {
            uint256 totaltoPay;
            for (i = 0; i < _amounts.length; i += 1) {
                totaltoPay += _amounts[i];
            }
            require(totaltoPay == msg.value);

            for (i = 0; i < _beneficiaries.length; i += 1) {
                _beneficiaries[i].transfer(_amounts[i]);
            }
        }

        IUSDETHOracle oracle = IUSDETHOracle(_oracle);
        uint256 ethUSD = oracle.getUintPrice();

        // notify any contracts about this payment
        for (i = 0; i < _notifiers.length; i += 1) {
            IRecipient(_notifiers[i]).receiveNotification(_cid,
                _oracle,
                _buyer,
                _beneficiaries,
                _amounts);
        }

        emit LogPayment(
            _cid,
            _oracle,
            ethUSD,
            msg.value,
            msg.sender,
            _buyer,
            _beneficiaries,
            _amounts)
        ;
    }

    event LogPayment(string cid,
    address oracle,
    uint256 indexed ethUSD,
    uint256 indexed value,
    address issuer,
    address indexed buyer,
    address payable[] beneficiaries,
    uint256[] amounts);

}