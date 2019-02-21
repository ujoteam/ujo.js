pragma solidity ^0.5.0;


contract TestNotification {

    mapping (uint256 => AdditionalTokenData) public additionalData;
    uint256 public counter = 0;

    struct AdditionalTokenData {
        string cid;
        address[] beneficiaries;
        uint256[] amounts;
        address oracle;
        uint256 minted;
    }

    function receiveNotification(string memory _cid,
    address _oracle,
    address _buyer,
    address[] memory _beneficiaries,
    uint256[] memory _amounts) public {
        AdditionalTokenData memory aData;
        aData.cid = _cid;
        aData.beneficiaries = _beneficiaries;
        aData.amounts = _amounts;
        aData.oracle = _oracle;
        aData.minted = now; //solhint-disable-line not-rely-on-time
        additionalData[counter] = aData;
        counter += 1; // every new token gets a new ID
    }

    function getCid(uint256 _tokenId) public view returns (string memory) {
        return additionalData[_tokenId].cid;
    }

    function getBeneficiaries(uint256 _tokenId) public view returns (address[] memory) {
        return additionalData[_tokenId].beneficiaries;
    }

    function getAmounts(uint256 _tokenId) public view returns (uint256[] memory) {
        return additionalData[_tokenId].amounts;
    }

    function getOracle(uint256 _tokenId) public view returns(address) {
        return additionalData[_tokenId].oracle;
    }

    function getMinted(uint256 _tokenId) public view returns(uint256) {
        return additionalData[_tokenId].minted;
    }
}