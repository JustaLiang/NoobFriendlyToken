//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenGenerator.sol";

contract NFTGallery is NoobFriendlyTokenTemplate {
    using Strings for uint;

    uint public tokenPrice;

    constructor(BaseSettings memory baseSettings)
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NoobFriendlyTokenTemplate(baseSettings.typeOfNFT, baseSettings.maxSupply)
    {}

    function initialize(
        string calldata baseURI_,
        uint tokenPrice_,
        uint saleStart_
    ) external onlyOwner onlyOnce {
        tokenPrice = tokenPrice_;
        baseURI = baseURI_;
        saleStart = saleStart_;
    }

    function reserveNFT(uint[] calldata tokenIdList) external onlyOwner {
        // require(
        //     tokenPrice*tokenIdList.length <= msg.value,
        //     "Ether value sent is not correct"
        // );
        require( block.timestamp < saleStart, "NFTGallery: researve only before saleStart");

        for (uint i = 0; i < tokenIdList.length; i++) {
            uint tokenId = tokenIdList[i];
            require(tokenId < maxSupply, "The id is out of bound");
            require(
                !_exists(tokenId),
                "This token has already been minted"
            );
            _safeMint(msg.sender, tokenId);
        }
    }

    function mintToken(uint[] calldata tokenIdList) external payable {
        require(
            tokenPrice*tokenIdList.length <= msg.value,
            "Ether value sent is not correct"
        );
        require( block.timestamp > saleStart, "NFTGallery: sale not start yet");

        for (uint i = 0; i < tokenIdList.length; i++) {
            uint tokenId = tokenIdList[i];
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

contract NFTGalleryGenerator is NoobFriendlyTokenGenerator {
    
    constructor(address adminAddr_, uint slottingFee_)
        NoobFriendlyTokenGenerator(adminAddr_, slottingFee_)
    {}

    function _createContract(BaseSettings calldata baseSettings)
        internal override returns (address) {
        return address(new NFTGallery(baseSettings));
    }
}