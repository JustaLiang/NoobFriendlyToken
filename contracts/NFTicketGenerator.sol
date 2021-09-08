//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

struct BaseSettings {
    string name;
    string symbol;
    address[] payees;
    uint[] shares;
}

struct Settings {
    uint16 ticketType;
    uint48 maxSupply;
}

interface GeneratorInterface {
    function slottingFee() external view returns (uint);
    function genNFTicketContract(address,
                                 BaseSettings calldata,
                                 Settings calldata) external returns (address);
}

interface TemplateInterface {
    function transferOwnership(address newOwner) external;
    function getSettings() external returns (uint16, uint48);
}

abstract contract NFTicketTemplate is Ownable, PaymentSplitter, ERC721Enumerable {

    Settings public settings;

    constructor(Settings memory settings_) {
        settings = settings_;
    }

    function _validToken(uint tokenId) internal view returns (bool) {
        return tokenId < settings.maxSupply;
    }

    function getSettings() public view returns (uint16, uint48) {
        return (settings.ticketType, settings.maxSupply);
    }
}