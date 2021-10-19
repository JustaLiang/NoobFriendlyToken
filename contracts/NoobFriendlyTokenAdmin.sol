//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "./NoobFriendlyTokenTemplate.sol";

contract NoobFriendlyTokenAdmin is Ownable, PaymentSplitter {

    mapping (address => TemplateInterface[]) public userContracts;

    mapping (uint32 => GeneratorInterface) public typeToGenerator;

    constructor(address[] memory payees,
                uint[] memory shares) 
                PaymentSplitter(payees, shares) {
    }

    function updateGenerator(uint32 typeOfNFT, address generatorAddr) external onlyOwner {
        typeToGenerator[typeOfNFT] = GeneratorInterface(generatorAddr);
        console.log("NoobFriendlyTokenAdmin:", typeOfNFT, "=>", generatorAddr);
    }

    function genNFTContract(BaseSettings calldata baseSettings) external payable {
        console.log("baseSettings");
        console.log("  name:", baseSettings.name);
        console.log("  symbol:", baseSettings.symbol);
        for (uint i = 0; i < baseSettings.payees.length; i++) {
            console.log("    ", baseSettings.payees[i], baseSettings.shares[i]);
        }
        console.log("  typeOfNFT:", baseSettings.typeOfNFT);
        console.log("  maxSupply:", baseSettings.maxSupply);
        GeneratorInterface generator = typeToGenerator[baseSettings.typeOfNFT];
        require(
            address(generator) != address(0),
            "NoobFriendlyTokenAdmin: Invalid ticket type"
        );
        require(
            msg.value >= generator.slottingFee(),
            "NoobFriendlyTokenAdmin: Slotting fee error"
        );
        TemplateInterface nftContract = TemplateInterface(generator.genNFTContract(_msgSender(), baseSettings));

        userContracts[_msgSender()].push(nftContract);
    }

    function getContractList() external view returns (TemplateInterface[] memory) {
        return userContracts[_msgSender()];
    }

    function slottingFee(uint32 generatorType) external view returns (uint) {
        GeneratorInterface generator = typeToGenerator[generatorType];
        require(
            address(generator) != address(0),
            "NoobFriendlyTokenAdmin: generator not exists"
        );
        return generator.slottingFee();
    }
}
