pragma solidity ^0.5.0;

//Simplified Interface for Rhombus Lighthouse Oracle
interface ILighthouse {
    
    function peekData() external view returns (uint128 v,bool b);
    // example response: 120396932750257630000 = $120

    function peekUpdated()  external view returns (uint32 v,bool b);
    
    function peekLastNonce() external view returns (uint32 v,bool b);

    function peek() external view returns (bytes32 v ,bool ok);
    
    function read() external view returns (bytes32 x);
    
}
