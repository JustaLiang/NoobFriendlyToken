//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenGenerator.sol";

contract NFTBlindbox is NoobFriendlyTokenTemplate {

    using Strings for uint;
    using SafeMath for uint;
  
    uint256 public tokenPrice;
    uint256 public revealTimeStamp;
    uint256 public startingIndex;
    uint256 private startingIndexBlock;

    constructor(BaseSettings memory baseSettings)
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NoobFriendlyTokenTemplate(baseSettings.typeOfNFT, baseSettings.maxSupply) {
    }

    function initialize(string calldata baseURI_,
                        uint maxPurchase_,
                        uint tokenPrice_,
                        uint saleStart_
                       ) external onlyOwner onlyOnce {
        maxPurchase = maxPurchase_;
        tokenPrice = tokenPrice_;
        saleStart = saleStart_;
        revealTimeStamp = saleStart_ + (86400 * 9);
        baseURI = baseURI_;
    }

    function reserveNFT() public onlyOwner {        
        
        uint supply = totalSupply();
        for (uint i = 0; i < 30; i++) {
            if ( supply + i < maxSupply){
                console.log(supply+i);
                _safeMint(msg.sender, supply + i);
                startingIndexBlock.add(block.number);
            }
        }
    }

    function setRevealTimestamp(uint revealTimeStamp_) public onlyOwner {
        require( revealTimeStamp_ > block.timestamp, "revealTimeStamp_ < block.timestamp" );
        revealTimeStamp = revealTimeStamp_;
    }

    function mintToken(uint numberOfTokens) external payable {
        require( isInit, "must initialize first");
        console.log("timestamp: ", block.timestamp, "saleStart: ", saleStart);
        require( block.timestamp > saleStart, "");
        require(numberOfTokens <= maxPurchase, "Can only mint 20 tokens at a time");
        require(totalSupply().add(numberOfTokens) <= maxSupply, "Purchase would exceed max supply of Apes");
        require(tokenPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");

        uint supply = totalSupply();
        for(uint i = 0; i < numberOfTokens; i++) {
            if ( supply+i < maxSupply) {
                console.log(supply+i);
                _safeMint(msg.sender, supply+i);
                startingIndexBlock.add(block.number);
            }
        }
    }

    function setStartingIndex() public {
        require(startingIndex == 0, "Starting index is already set");
        require(totalSupply() == maxSupply || block.timestamp >= revealTimeStamp,
                "");

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
        return string(abi.encodePacked(baseURI, tokenId.toString()));
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