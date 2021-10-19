//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenGenerator.sol";

contract NFTBlindbox is NoobFriendlyTokenTemplate {

    using Strings for uint;
    using SafeMath for uint;
  
    uint public tokenPrice;
    uint public revealTimeStamp;
    uint private startingIndex;
    uint private startingIndexBlock;

    constructor(BaseSettings memory baseSettings)
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NoobFriendlyTokenTemplate(baseSettings.typeOfNFT, baseSettings.maxSupply) {
    }

    function initialize(string calldata baseURI_,
                        uint maxPurchase_,
                        uint tokenPrice_,
                        uint saleStart_,
                        uint revealTimeStamp_
                       ) external onlyOwner onlyOnce {
        baseURI = baseURI_;
        maxPurchase = maxPurchase_;
        tokenPrice = tokenPrice_;
        saleStart = saleStart_;
        revealTimeStamp = revealTimeStamp_;
    }

    function reserveNFT(uint reserveNum) public onlyOwner {    

        require( 
            block.timestamp < saleStart,
            "Blindbox: reserve should before saleStart"
        );    
        
        uint supply = totalSupply();
        for (uint i = 0; i < reserveNum; i++) {
            if ( supply + i < maxSupply){
                _safeMint(msg.sender, supply + i);
                startingIndexBlock.add(block.number);
            }
        }
    }

    // function setRevealTimestamp(uint revealTimeStamp_) public onlyOwner {
    //     require( revealTimeStamp_ > block.timestamp, "revealTimeStamp_ < block.timestamp" );
    //     revealTimeStamp = revealTimeStamp_;
    // }

    function mintToken(uint numberOfTokens) external payable {
        require( isInit, "BlindBox: must initialize first");
        require( block.timestamp > saleStart, "BlindBox: sale is not start yet");
        require(numberOfTokens <= maxPurchase, "BlindBox: exceed max purchase");
        require(totalSupply().add(numberOfTokens) <= maxSupply, "BlindBox: Purchase would exceed max supply");
        require(tokenPrice.mul(numberOfTokens) <= msg.value, "BlindBox: Ether value sent is not correct");

        for(uint i = 0; i < numberOfTokens; i++) {
            uint _supply = totalSupply();
            _safeMint(owner(), _supply);
            _safeTransfer(owner(), msg.sender, _supply, "");
            startingIndexBlock.add(block.number);
        }
    }

    function reveal() public {
        require(startingIndex == 0, 
                "Starting index is already set");
        require(totalSupply() == maxSupply || block.timestamp >= revealTimeStamp,
                "BlindBox: not reveal yet");

        startingIndex = uint(blockhash(startingIndexBlock)) % maxSupply;
        // Just a sanity case in the worst case if this function is called late (EVM only stores last 256 block hashes)
        if (block.number.sub(startingIndexBlock) > 255) {
            startingIndex = uint(blockhash(block.number - 1)) % maxSupply;
        }
        // Prevent default sequence
        if (startingIndex == 0) {
            startingIndex = startingIndex.add(1);
        }
    }

    function tokenURI(uint tokenId) public override view returns (string memory) {
        require(
            _exists(tokenId),
             "ERC721Metadata: URI query for nonexistent token"
        );
        
        if (startingIndex != 0){
            uint tokenIndex = (startingIndex + tokenId) % maxSupply;
            console.log( "tokenIndex is ", tokenIndex);
            return string(abi.encodePacked(baseURI, tokenIndex.toString()));
        }

        uint _maxSupply = maxSupply;
        return string(abi.encodePacked(baseURI, _maxSupply.toString()));
    }
}

contract NFTBlindboxGenerator is NoobFriendlyTokenGenerator {
    
    constructor(address adminAddr_, uint slottingFee_)
        NoobFriendlyTokenGenerator(adminAddr_, slottingFee_)
    {}

    function _createContract(BaseSettings calldata baseSettings)
        internal override returns (address) {
        return address(new NFTBlindbox(baseSettings));
    }
}