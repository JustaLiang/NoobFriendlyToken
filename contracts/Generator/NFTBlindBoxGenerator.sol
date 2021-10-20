//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenGenerator.sol";

contract NFTBlindbox is NoobFriendlyTokenTemplate {

    using Strings for uint;
    using SafeMath for uint;
  
    uint public tokenPrice;
    uint public revealTimeStamp;
    uint public startingIndex;
    uint private _startingIndexBlock;
    string public coverURI; 

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
        coverURI = "";
        startingIndex = 0;
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
                _startingIndexBlock.add(block.number);
            }
        }
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function setCoverURI(string calldata newCoverURI) external onlyOwner {
        coverURI = newCoverURI;
    }

    function setTokenPrice(uint newPrice) external onlyOwner {
        tokenPrice = newPrice;
    }

    function mintToken(uint numberOfTokens) external payable {
        require( isInit, "BlindBox: must initialize first");
        require( block.timestamp > saleStart, "BlindBox: sale is not start yet");
        require(numberOfTokens <= maxPurchase, "BlindBox: exceed max purchase");
        require(totalSupply().add(numberOfTokens) <= maxSupply, "BlindBox: Purchase would exceed max supply");
        require(tokenPrice.mul(numberOfTokens) <= msg.value, "BlindBox: Ether value sent is not correct");

        uint _supply = totalSupply();

        for(uint i = 0; i < numberOfTokens; i++) {
            _safeMint(owner(), _supply+i);
            _safeTransfer(owner(), msg.sender, _supply+i, "");
            _startingIndexBlock.add(block.number);
        }
    }

    function reveal() external {
        require(startingIndex == 0, 
                "BlindBox: already revealed");
        require(totalSupply() == maxSupply || block.timestamp >= revealTimeStamp,
                "BlindBox: not reveal yet");
        require(bytes(baseURI).length > 0,
                "Blindbox: baseURI not set");

        startingIndex = uint(blockhash(_startingIndexBlock)) % maxSupply;
        // Just a sanity case in the worst case if this function is called late (EVM only stores last 256 block hashes)
        if (block.number.sub(_startingIndexBlock) > 255) {
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
        
        if (startingIndex > 0) {
            uint tokenIndex = (startingIndex + tokenId) % maxSupply;
            console.log( "tokenIndex is ", tokenIndex);
            return string(abi.encodePacked(baseURI, tokenIndex.toString()));
        }
        else {
            if (bytes(coverURI).length == 0) {
                return string(abi.encodePacked(baseURI, uint(maxSupply).toString()));            
            }
            else {
                return string(abi.encodePacked(coverURI, tokenId.toString()));
            }
        }
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