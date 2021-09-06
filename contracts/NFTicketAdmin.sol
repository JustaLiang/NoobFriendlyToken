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

    function updateTemplateType(uint8 ticketType, address generatorAddr) external onlyOwner {
        typeToGenerator[ticketType] = GeneratorInterface(generatorAddr);
    }

    function addNFTicket(BaseSettings calldata baseSettings,
                         Settings calldata settings) external payable {
        GeneratorInterface generator = typeToGenerator[settings.ticketType];
        require(
            address(generator) != address(0),
            "Invalid ticket type"
        );
        require(
            msg.value >= generator.slottingFee()*settings.maxSupply,
            "Slotting fee error"
        );

        userTemplates[_msgSender()].push(TemplateInterface(generator.genNFTicketContract(_msgSender(), baseSettings, settings)));
    }
}
