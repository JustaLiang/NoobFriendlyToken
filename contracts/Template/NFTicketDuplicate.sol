//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NFTicketGenerator.sol";

contract NFTicketDuplicate is NFTicketTemplate {

    using Strings for uint8;

    bool notInit;
    string public baseURI;
    struct TicketState {
        uint48[] current;
        uint48[] soldout;
        uint160[] prices;
    }

    TicketState private _ticketState;

    constructor(BaseSettings memory baseSettings,
                Settings memory settings)
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NFTicketTemplate(settings) {
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
        require(length == ticketPrices_.length && length > 0 && length <= 256);
        uint48 cumulation = 0;
        for (uint8 lv = 0; lv < length; lv++) {
            _ticketState.current.push(cumulation);
            cumulation += ticketAmounts_[lv];
            _ticketState.soldout.push(cumulation);
            _ticketState.prices.push(ticketPrices_[lv]);
        }
        require(cumulation == settings.maxSupply);
        baseURI = baseURI_;
    }

    function mintToken(uint8 level) external payable {
        require(level < _ticketState.prices.length);
        uint48 newTicketId = _ticketState.current[level];
        require(newTicketId < _ticketState.soldout[level]);
        require(msg.value >= _ticketState.prices[level]);

        _safeMint(_msgSender(), uint(newTicketId));
    }

    function tokenURI(uint ticketId) public override view returns (string memory uri) {
        require(_exists(ticketId));
        uint length = _ticketState.soldout.length;
        for (uint8 lv = 0; lv < length; lv++) {
            if (ticketId < _ticketState.soldout[lv]) {
                return string(abi.encodePacked(baseURI, lv.toString()));
            }
        }
    }
}

contract NFTicketDuplicateGenerator is Ownable, GeneratorInterface {

    address public adminAddr;
    uint public override slottingFee;

    constructor(address adminAddr_, uint slottingFee_) {
        adminAddr = adminAddr_;
        slottingFee = slottingFee_;
    }
    
    function genNFTicketContract(address client,
                                 BaseSettings calldata baseSettings,
                                 Settings calldata settings) external override returns (address) {
        require(_msgSender() == adminAddr);
        address contractAddr =  address(new NFTicketDuplicate(baseSettings, settings));
        TemplateInterface nfticket = TemplateInterface(contractAddr);
        nfticket.transferOwnership(client);
        return contractAddr; 
    }

    function changeSlottingFee(uint newSlottingFee) external onlyOwner {
        slottingFee = newSlottingFee;
    }
}