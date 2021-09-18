//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenTemplate.sol";


contract NFTBlindBox is NoobFriendlyTokenTemplate {

    using Strings for uint8;

    bool public notInit;
    string public baseURI;

    struct TicketState {
        uint48[] current;
        uint48[] soldout;
        uint160[] prices;
    }

    TicketState private _ticketState;

    constructor(BaseSettings memory baseSettings)
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NoobFriendlyTokenTemplate(baseSettings.typeOfNFT, baseSettings.maxSupply) {
        notInit = true;
    }

    modifier onlyOnce() {
        require(notInit);
        notInit = false;
        _;
    }

    function initialize(string calldata baseURI_,
                        uint48[] calldata ticketAmounts_,
                        uint160[] calldata ticketPrices_) external onlyOwner onlyOnce {
        uint length = ticketAmounts_.length;
        require(
            length == ticketPrices_.length && length > 0 && length <= 256,
            "NFTTicket: level error"
        );
        uint48 cumulation = 0;
        for (uint8 lv = 0; lv < length; lv++) {
            _ticketState.current.push(cumulation);
            cumulation += ticketAmounts_[lv];
            _ticketState.soldout.push(cumulation);
            _ticketState.prices.push(ticketPrices_[lv]);
            console.log(lv, _ticketState.current[lv], _ticketState.soldout[lv], _ticketState.prices[lv]);
        }
        require(
            cumulation == maxSupply,
            "NFTTicket: sum of supply of each level not match"
        );
        baseURI = baseURI_;
    }

    function mintToken(uint8 level) external payable {
        require(
            level < _ticketState.prices.length,
            "NFTTicket: no such level"
        );
        uint48 newTicketId = _ticketState.current[level];
        require(
            newTicketId < _ticketState.soldout[level],
            "NFTTicket: sold out at this level"  
        );
        require(
            msg.value >= _ticketState.prices[level],
            "NFTTicket: not enough for ticket price"    
        );

        _safeMint(_msgSender(), uint(newTicketId));
    }

    function tokenURI(uint ticketId) public override view returns (string memory uri) {
        require(
            _exists(ticketId),
            "NFTTicket: query for non-existing ticket"
        );
        uint length = _ticketState.soldout.length;
        for (uint8 lv = 0; lv < length; lv++) {
            if (ticketId < _ticketState.soldout[lv]) {
                return string(abi.encodePacked(baseURI, lv.toString()));
            }
        }
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
    */
    // function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    //     require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

    //     string memory _tokenURI = _tokenURIs[tokenId];
    //     string memory base = baseURI();

    //     // If there is no base URI, return the token URI.
    //     if (bytes(base).length == 0) {
    //         return _tokenURI;
    //     }
    //     // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
    //     if (bytes(_tokenURI).length > 0) {
    //         return string(abi.encodePacked(base, _tokenURI));
    //     }
    //     // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
    //     return string(abi.encodePacked(base, tokenId.toString()));
    // }
}

contract NFTBlindBoxGenerator is Ownable, GeneratorInterface {

    address public adminAddr;
    uint public override slottingFee;

    constructor(address adminAddr_, uint slottingFee_) {
        adminAddr = adminAddr_;
        slottingFee = slottingFee_;
    }
    
    function genNFTContract(address client, BaseSettings calldata baseSettings) external override returns (address) {
        require(_msgSender() == adminAddr);
        address contractAddr =  address(new NFTBlindBox(baseSettings));
        TemplateInterface nftTicket = TemplateInterface(contractAddr);
        nftTicket.transferOwnership(client);
        console.log("NFTTicket at:", address(nftTicket), " Owner:", nftTicket.owner());
        return contractAddr;
    }

    
}