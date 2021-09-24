//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenTemplate.sol";

contract NFTGallery is NoobFriendlyTokenTemplate {
    using Strings for uint256;

    uint256 public tokenPrice;

    constructor(BaseSettings memory baseSettings)
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NoobFriendlyTokenTemplate(
            baseSettings.typeOfNFT,
            baseSettings.maxSupply
        )
    {}

    function initialize(
        string calldata baseURI_,
        uint120 tokenPrice_
    ) external onlyOwner onlyOnce {
        tokenPrice = tokenPrice_;
        baseURI = baseURI_;
    }

    function mintToken(uint256[] calldata tokenIdList) external payable {
        require(
            tokenPrice*tokenIdList.length <= msg.value,
            "Ether value sent is not correct"
        );

        for (uint256 i = 0; i < tokenIdList.length; i++) {
            uint256 tokenId = tokenIdList[i];
            require(tokenId < maxSupply, "The id is out of bound");
            require(
                !_exists(tokenId),
                "This token has already been minted"
            );
            _safeMint(msg.sender, tokenId);
        }
    }
    function tokenURI(uint tokenId) public override view returns (string memory) {
        require(
            _exists(tokenId),
             "ERC721Metadata: URI query for nonexistent token"
        );
        
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }
}


contract NFTGalleryGenerator is Ownable, GeneratorInterface {

    address public adminAddr;
    uint public override slottingFee;

    constructor(address adminAddr_, uint slottingFee_) {
        adminAddr = adminAddr_;
        slottingFee = slottingFee_;
    }
    
    function genNFTContract(address client, BaseSettings calldata baseSettings) external override returns (address) {
        require(_msgSender() == adminAddr);
        address contractAddr =  address(new NFTGallery(baseSettings));
        TemplateInterface nftGallery = TemplateInterface(contractAddr);
        nftGallery.transferOwnership(client);
        console.log("NFTGallery at:", address(nftGallery), " Owner:", nftGallery.owner());
        return contractAddr;
    }
}