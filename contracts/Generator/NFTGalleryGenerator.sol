//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
        uint160 startTimestamp_
    ) external onlyOwner onlyOnce {
        tokenPrice = tokenPrice_;
        baseURI = baseURI_;
        settings.startTimestamp = startTimestamp_;
    }

    function reserveNFT(uint[] calldata tokenIdList) external onlyOwner {
        for (uint i = 0; i < tokenIdList.length; i++) {
            uint tokenId = tokenIdList[i];
            require(
                tokenId < settings.maxSupply,
                "Gallery: token ID out of bound"
            );
            _safeMint(_msgSender(), tokenId);
        }
    }

    function mintToken(uint[] calldata tokenIdList) external payable {
        require(
            isInit,
            "Gallery: not initialized"
        );
        require(
            block.timestamp > settings.startTimestamp,
            "Gallery: sale not start"
        );
        require(
            msg.value >= tokenPrice*tokenIdList.length,
            "Gallery: payment not enough"
        );

        for (uint i = 0; i < tokenIdList.length; i++) {
            uint tokenId = tokenIdList[i];
            require(
                tokenId < settings.maxSupply,
                "Gallery: token ID out of bound"
            );
            _safeMint(_msgSender(), tokenId);
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

    function _genContract(BaseSettings calldata baseSettings)
        internal override returns (address) {
        return address(new NFTGallery(baseSettings));
    }
}