//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

struct BaseSettings {
    string name;
    string symbol;
    address[] payees;
    uint[] shares;
    uint32 typeOfNFT;
    uint32 maxSupply;
}

struct BaseSettingsInfo {
    string name;
    string symbol;
    uint32 typeOfNFT;
    uint32 maxSupply;    
}

interface GeneratorInterface {
    function slottingFee() external view returns (uint);
    function genNFTContract(address, BaseSettings calldata) external returns (address);
}

interface TemplateInterface {
    function owner() external returns (address);
    function transferOwnership(address newOwner) external;
}

abstract contract NoobFriendlyTokenTemplate is Ownable, PaymentSplitter, ERC721Enumerable {

    uint32 public typeOfNFT;
    uint32 public maxSupply;
    uint public slottingFee;
    bool public isInit;

    constructor(uint32 typeOfNFT_, uint32 maxSupply_) {
        typeOfNFT = typeOfNFT_;
        maxSupply = maxSupply_;
        isInit = false;
    }

    modifier onlyOnce() {
        require(!isInit);
        isInit = true;
        _;
    }

    function _underSupply(uint tokenId) internal view returns (bool) {
        return tokenId < maxSupply;
    }

    function getBaseSettings() external view returns (BaseSettingsInfo memory) {
        return BaseSettingsInfo(name(), symbol(), typeOfNFT, maxSupply);
    }

    function changeSlottingFee(uint newSlottingFee) external onlyOwner {
        console.log("slotting fee change from", slottingFee, " to", newSlottingFee);
        slottingFee = newSlottingFee;
    }
}