//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
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

    uint public maxPurchase;
    uint32 public typeOfNFT;
    uint32 public maxSupply;
    string public baseURI;
    bool public isInit;
    bool public saleIsActive;

    constructor(
        uint32 typeOfNFT_,
        uint32 maxSupply_) {
        typeOfNFT = typeOfNFT_;
        maxSupply = maxSupply_;
        isInit = false;
        saleIsActive = false;
    }

    modifier onlyOnce() {
        require(!isInit, "init already");
        isInit = true;
        _;
    }

    modifier onlyActive() {
        require(saleIsActive, "sale is not active");
        _;
    }

    function flipSaleState() public onlyOwner {
        saleIsActive = !saleIsActive;
    }

    function getBaseSettings() external view returns (BaseSettingsInfo memory) {
        return BaseSettingsInfo(name(), symbol(), typeOfNFT, maxSupply);
    }
}