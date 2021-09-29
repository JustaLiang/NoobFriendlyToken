//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./NoobFriendlyTokenTemplate.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract NoobFriendlyTokenGenerator is Ownable, GeneratorInterface{

    address public adminAddr;
    uint public override slottingFee;

    constructor(
        address adminAddr_,
        uint slottingFee_) {
        adminAddr = adminAddr_;
        slottingFee = slottingFee_;
    }
    
    function _createContract(BaseSettings calldata baseSettings)
        internal virtual returns (address);

    function genNFTContract(address client, BaseSettings calldata baseSettings) external override returns (address) {
        require(_msgSender() == adminAddr);
        address contractAddr =  _createContract(baseSettings);
        TemplateInterface nftContract = TemplateInterface(contractAddr);
        nftContract.transferOwnership(client);
        console.log("NFT Contract at:", address(nftContract), " Owner:", nftContract.owner());
        return contractAddr;
    }

    function changeSlottingFee(uint newSlottingFee) external onlyOwner {
        console.log("slotting fee change from", slottingFee, " to", newSlottingFee);
        slottingFee = newSlottingFee;
    }
} 