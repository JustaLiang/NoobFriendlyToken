//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../NoobFriendlyTokenGenerator.sol";

/**
 @author Chiao-Yu Yang, Justa Liang, Jeffrey lin
 @notice Ticket: NFT for different levels
 */
contract NFTTicket is NoobFriendlyTokenTemplate {

    using Strings for uint8;

    struct TicketState {
        uint48[] current;
        uint48[] soldout;
        uint160[] prices;
    }

    /// @notice Detailed settings of TicketState
    TicketState private _ticketState;

    /// @dev Setup the template
    constructor(
        BaseSettings memory baseSettings
    )
        ERC721(baseSettings.name, baseSettings.symbol)
        PaymentSplitter(baseSettings.payees, baseSettings.shares)
        NoobFriendlyTokenTemplate(baseSettings.typeOfNFT, baseSettings.maxSupply)
    {}


    /**
     @notice Initialize the contract details
     @param baseURI_ Base URI of NFT tickets
     @param startTimestamp_ Time to start sale
     @param ticketPrices_ ticket Price per each level
     @param ticketAmounts_ ticket amount per each level
     */
    function initialize(
        string calldata baseURI_,
        uint128 startTimestamp_,
        uint48[] calldata ticketAmounts_,
        uint160[] calldata ticketPrices_
    ) external onlyOwner onlyOnce {
        uint length = ticketAmounts_.length;
        require(
            length == ticketPrices_.length && length > 0 && length <= 256,
            "Ticket: level error"
        );
        uint48 cumulation = 0;
        for (uint8 lv = 0; lv < length; lv++) {
            _ticketState.current.push(cumulation);
            cumulation += ticketAmounts_[lv];
            _ticketState.soldout.push(cumulation);
            _ticketState.prices.push(ticketPrices_[lv]);
        }
        require(
            cumulation == settings.maxSupply,
            "Ticket: sum of supply of each level not match"
        );
        baseURI = baseURI_;
        settings.startTimestamp = startTimestamp_;
    }

    
    function mintToken(uint8 level, uint ticketNum) external payable {
        require(
            isInit,
            "Ticket: not initialized"
        );
        require(
            block.timestamp > settings.startTimestamp,
            "Ticket: sale not start"
        );
        require(
            _ticketState.current[level] + ticketNum < _ticketState.soldout[level],
            "Ticket: sold out at this level"
        );
        require(
            msg.value >= _ticketState.prices[level]*ticketNum,
            "Ticket: not enough for ticket price"    
        );
        for( uint i = 0; i < ticketNum; i++){
            uint newTicketId = _ticketState.current[level];
            _ticketState.current[level] += 1;
            _safeMint(owner(), newTicketId);
            _safeTransfer(owner(), _msgSender(), newTicketId, "");
        }
    }

    function tokenURI(uint ticketId) public override view returns (string memory uri) {
        require(
            _exists(ticketId),
            "Ticket: query for non-existing ticket"
        );
        uint length = _ticketState.soldout.length;
        for (uint8 lv = 0; lv < length; lv++) {
            if (ticketId < _ticketState.soldout[lv]) {
                return string(abi.encodePacked(baseURI, lv.toString()));
            }
        }
    }
}

contract NFTTicketGenerator is NoobFriendlyTokenGenerator {
    
    constructor(address adminAddr_, uint slottingFee_)
        NoobFriendlyTokenGenerator(adminAddr_, slottingFee_)
    {}

    function _genContract(BaseSettings calldata baseSettings)
        internal override returns (address) {
        return address(new NFTTicket(baseSettings));
    }
}
