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
    uint32 ticketType;
    uint32 maxSupply;
}

struct BaseSettingsInfo {
    string name;
    string symbol;
    uint32 ticketType;
    uint32 maxSupply;    
}

interface GeneratorInterface {
    function slottingFee() external view returns (uint);
    function genNFTicketContract(address, BaseSettings calldata) external returns (address);
}

interface TemplateInterface is IERC721 {
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
}

abstract contract NFTicketTemplate is Ownable, PaymentSplitter, ERC721Enumerable {

    uint32 public ticketType;
    uint32 public maxSupply;

    constructor(uint32 ticketType_, uint32 maxSupply_) {
        ticketType = ticketType_;
        maxSupply = maxSupply_;
    }

    function _validTokenId(uint tokenId) internal view returns (bool) {
        return tokenId < maxSupply;
    }

    function getBaseSettings() external view returns (BaseSettingsInfo memory) {
        return BaseSettingsInfo(name(), symbol(), ticketType, maxSupply);
    }
}