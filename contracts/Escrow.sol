pragma solidity ^0.4.13;

contract Escrow {
    uint public productId;
    address public buyer;
    address public seller;
    address public arbiter;
    uint public amount;
    
    constructor (uint _productId, address _buyer,  address _seller, address _arbiter) payable public {
        //保存商品编号
        productId = _productId;
        //保存参与三方的账户地址
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        //只有声明了payable的函数，msg.value才有效
        amount = msg.value;       
    }
    
    uint public releaseCount;
    uint public refundCount;
    bool public fundsDisbursed;
    
    mapping(address => bool) releaseAmount;
    mapping(address => bool) refundAmount;
    
    function releaseAmountToSeller(address caller) payable public{
        require(!fundsDisbursed);
        if ((caller == buyer || caller == seller || caller == arbiter) && (releaseAmount[caller] != true)){
            releaseAmount[caller] = true;
            releaseCount += 1;
        }
        if (releaseCount == 2) {
            seller.transfer(amount);
            fundsDisbursed = true;
        }
    }
    
    function refundAmountToBuyer(address caller) payable public {
        require(!fundsDisbursed);
        if ((caller == buyer || caller == seller || caller == arbiter) && (releaseAmount[caller] != true)){
            refundAmount[caller] = true;
            refundCount += 1;
        }
        if (refundCount == 2) {
            buyer.transfer(amount);
            fundsDisbursed = true;
        }
    }
    function escrowInfo() view public returns (address, address, address, bool, uint, uint) {
    return (buyer, seller, arbiter, fundsDisbursed, releaseCount, refundCount);
  }
    
}