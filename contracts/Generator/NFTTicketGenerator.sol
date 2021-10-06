//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../NoobFriendlyTokenGenerator.sol";

contract NFTTicket is NoobFriendlyTokenTemplate {

    using Strings for uint8;

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
    }

    function initialize(string calldata baseURI_,
                        uint saleStart_,
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
        saleStart = saleStart_;
    }

    // function reserveNFT(uint8 level, uint reserveNum) public onlyOwner {    

    //     require( 
    //         block.timestamp < saleStart,
    //         "Blindbox: reserve should before saleStart"
    //     );    
        
    //     uint supply = totalSupply();
    //     for (uint i = 0; i < reserveNum; i++) {
    //         if ( supply + i < maxSupply){
    //             _safeMint(msg.sender, supply + i);
    //             startingIndexBlock.add(block.number);
    //         }
    //     }
    // }

    function mintToken(uint8[] calldata levels, uint[] calldata ticketNum) external payable {

        require( 
            block.timestamp > saleStart,
            "NFTTicket: sale not start"
        );

        uint totalPayable = 0;

        for( uint i = 0; i < levels.length; i++){

            uint level = levels[i];

            require( level < _ticketState.prices.length, "NFTTicket: no such level" );
            uint256 newTicketId = _ticketState.current[level] + ticketNum[i] - 1;
            require(
                newTicketId < _ticketState.soldout[level],
                "NFTTicket: sold out at this level"  
            );

            totalPayable += _ticketState.prices[level]*ticketNum[i];
            require(
                msg.value >= totalPayable,
                "NFTTicket: not enough for ticket price"    
            );
        }

        // require(
        //     level < _ticketState.prices.length,
        //     "NFTTicket: no such level"
        // );
        // uint48 newTicketId = _ticketState.current[level];
        // require(
        //     newTicketId < _ticketState.soldout[level],
        //     "NFTTicket: sold out at this level"  
        // );
        // require(
        //     msg.value >= _ticketState.prices[level],
        //     "NFTTicket: not enough for ticket price"    
        // );

        for( uint i = 0; i < levels.length; i++){
            
            uint level = levels[i];

            for( uint j = 0; j < ticketNum[i]; j++){
                uint48 newTicketId = _ticketState.current[level];
                _ticketState.current[level] += 1;
                _safeMint(_msgSender(), uint(newTicketId));
                console.log( "Ticket: mint ID: newTicketId");
            }
        }


        // _ticketState.current[level] += 1;
        // _safeMint(_msgSender(), uint(newTicketId));

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
}

contract NFTTicketGenerator is NoobFriendlyTokenGenerator {
    
    constructor(address adminAddr_, uint slottingFee_)
        NoobFriendlyTokenGenerator(adminAddr_, slottingFee_)
    {}

    function _createContract(BaseSettings calldata baseSettings)
        internal override returns (address) {
        return address(new NFTTicket(baseSettings));
    }
}
