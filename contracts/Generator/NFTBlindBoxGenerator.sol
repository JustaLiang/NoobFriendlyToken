//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenTemplate.sol";


contract NFTBlindbox is NoobFriendlyTokenTemplate {

    using Strings for uint;
    using SafeMath for uint;

    bool public saleIsActive;
    uint public maxPurchase;
    uint public tokenPrice;
    uint public REVEAL_TIMESTAMP;
    uint public startingIndex;
    uint private startingIndexBlock;

    constructor(BaseSettings memory baseSettings)
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NoobFriendlyTokenTemplate(baseSettings.typeOfNFT, baseSettings.maxSupply) {
        saleIsActive = false;
    }

    function initialize(string calldata baseURI_,
                        uint maxPurchase_,
                        uint tokenPrice_,
                        uint saleStart
                       ) external onlyOwner onlyOnce {
        maxPurchase = maxPurchase_;
        tokenPrice = tokenPrice_;
        REVEAL_TIMESTAMP = saleStart + (86400 * 9);
        baseURI = baseURI_;
    }

    function flipSaleState() public onlyOwner {
        saleIsActive = !saleIsActive;
    }

    function reserveNFT() public onlyOwner {        
        uint supply = totalSupply();
        uint i;
        for (i = 0; i < 30; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function setRevealTimestamp(uint revealTimeStamp) public onlyOwner {
        REVEAL_TIMESTAMP = revealTimeStamp;
    }

    function mintToken(uint numberOfTokens) external payable {

        require(saleIsActive, "Sale must be active to mint Ape");
        require(numberOfTokens <= maxPurchase, "Can only mint 20 tokens at a time");
        require(totalSupply().add(numberOfTokens) <= maxSupply, "Purchase would exceed max supply of Apes");
        require(tokenPrice.mul(numberOfTokens) <= msg.value, "Ether value sent is not correct");

        for(uint i = 0; i < numberOfTokens; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < maxSupply) {
                _safeMint(msg.sender, mintIndex);
                startingIndexBlock.add(block.number);
            }
        }
    }

    function setStartingIndex() public {
        require(startingIndex == 0, "Starting index is already set");
        require(totalSupply() == maxSupply || block.timestamp >= REVEAL_TIMESTAMP,
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
            return string(abi.encodePacked(baseURI, tokenIndex));
        }
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }
}

contract NFTBlindboxGenerator is Ownable, GeneratorInterface {

    address public adminAddr;
    uint public override slottingFee;

    constructor(address adminAddr_, uint slottingFee_) {
        adminAddr = adminAddr_;
        slottingFee = slottingFee_;
    }
    
    function genNFTContract(address client, BaseSettings calldata baseSettings) external override returns (address) {
        require(_msgSender() == adminAddr);
        address contractAddr =  address(new NFTBlindbox(baseSettings));
        TemplateInterface nftBlindbox = TemplateInterface(contractAddr);
        nftBlindbox.transferOwnership(client);
        console.log("NFTBlindbox at:", address(nftBlindbox), " Owner:", nftBlindbox.owner());
        return contractAddr;
    }
}