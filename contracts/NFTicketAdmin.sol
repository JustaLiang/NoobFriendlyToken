//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "./NFTicketGenerator.sol";

contract NFTicketAdmin is Ownable, PaymentSplitter {

    mapping (address => TemplateInterface[]) public userTemplates;

    mapping (uint32 => GeneratorInterface) public typeToGenerator;

    constructor(address[] memory payees,
                uint[] memory shares) 
                PaymentSplitter(payees, shares) {
    }

    function updateTemplateType(uint32 ticketType, address generatorAddr) external onlyOwner {
        typeToGenerator[ticketType] = GeneratorInterface(generatorAddr);
        console.log("NFTicketAdmin:", ticketType, "=>", generatorAddr);
    }

    function addNFTicket(BaseSettings calldata baseSettings) external payable {
        console.log("baseSettings");
        console.log("  name:", baseSettings.name);
        console.log("  symbol:", baseSettings.symbol);
        for (uint i = 0; i < baseSettings.payees.length; i++) {
            console.log("    ", baseSettings.payees[i], baseSettings.shares[i]);
        }
        console.log("  ticketType:", baseSettings.ticketType);
        console.log("  maxSupply:", baseSettings.maxSupply);
        GeneratorInterface generator = typeToGenerator[baseSettings.ticketType];
        require(
            address(generator) != address(0),
            "NFTicketAdmin: Invalid ticket type"
        );
        require(
            msg.value >= generator.slottingFee()*baseSettings.maxSupply,
            "NFTicketAdmin: Slotting fee error"
        );

        userTemplates[_msgSender()].push(TemplateInterface(generator.genNFTicketContract(_msgSender(), baseSettings)));
    }

    function getTemplateList() external view returns (TemplateInterface[] memory) {
        return userTemplates[_msgSender()];
    }

    function slottingFee(uint32 generatorType) external view returns (uint) {
        GeneratorInterface generator = typeToGenerator[generatorType];
        require(
            address(generator) != address(0),
            "NFTicketAdmin: generator not exists"
        );
        return generator.slottingFee();
    }
}
