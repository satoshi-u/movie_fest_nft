// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MasterERC is ERC1155, ERC1155Supply {
    using Counters for Counters.Counter;

    // keeps the count for our tokenIds, starts with count 0 -> make array todo
    Counters.Counter public _tokenIds;

    // tokenIds <-> uris for all tokens
    mapping(uint256 => string) public _uris;

    // market is a generic marketPlace for buying and selling NFTs for given use case
    struct Market {
        string marketKey;
        address addr;
        uint256 currencyTokenId;
        string currencyTokenUri;
        uint256 nftId;
        string nftUri;
        bool registered;
    }

    // MarketKey -> Market
    mapping(string => Market) public _marketKeyToMarket;

    // event when a new market is added
    event MarketAdded(
        string indexed marketKey,
        address indexed addr,
        uint256 currencyTokenId,
        string currencyTokenUri,
        uint256 nftId,
        string nftUri
    );

    // event when Collectible is minted to a user via a market
    event CollectibleMinted(
        string indexed marketKey,
        uint256 indexed tokenId,
        uint256 indexed quantity,
        string tokenURI,
        address to
    );

    // event when Currency is minted to a market, for a market, via market.
    event CurrencyMinted(
        string indexed marketKey,
        uint256 indexed tokenId,
        uint256 indexed supply,
        string tokenURI
    );

    constructor(string memory uri_) ERC1155(uri_) {}

    // store address, currencyTokenUri & nftUri of a market against marketKey, along with tokenIds
    function addMarket(
        string calldata marketKey,
        address addr,
        string calldata currencyTokenUri,
        string calldata nftUri
    ) public returns (uint256 currencyTokenId, uint256 nftId) {
        require(
            msg.sender == addr,
            "msg.sender should be the market address itself!"
        );
        _tokenIds.increment(); // 0 -> 1
        currencyTokenId = _tokenIds.current();
        _tokenIds.increment(); // 1 -> 2
        nftId = _tokenIds.current();
        _uris[currencyTokenId] = currencyTokenUri;
        _uris[nftId] = nftUri;
        Market memory market = Market(
            marketKey,
            addr,
            currencyTokenId,
            currencyTokenUri,
            nftId,
            nftUri,
            true
        );
        _marketKeyToMarket[marketKey] = market;
        emit MarketAdded(
            marketKey,
            addr,
            currencyTokenId,
            currencyTokenUri,
            nftId,
            nftUri
        );
        return (currencyTokenId, nftId);
    }

    // override
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _uris[tokenId];
    }

    // generic mint collectible - called by market contract to mint collectible(s) to `to` address
    function mintCollectible(
        string calldata marketKey,
        uint256 quantity,
        address to
    ) public {
        require(
            _marketKeyToMarket[marketKey].registered == true,
            "Add market first!"
        );
        require(
            msg.sender == _marketKeyToMarket[marketKey].addr,
            "Only market contract can mint NFTs!"
        );
        uint256 nftId = _marketKeyToMarket[marketKey].nftId;
        string memory nftUri = _marketKeyToMarket[marketKey].nftUri;
        _mint(to, nftId, quantity, "");
        emit CollectibleMinted(marketKey, nftId, quantity, nftUri, to);
    }

    // generic mint currency - called by market contract to get all of initial currecny supply to itself
    function mintCurrency(string calldata marketKey, uint256 supply) public {
        require(
            _marketKeyToMarket[marketKey].registered == true,
            "Add market first!"
        );
        require(
            msg.sender == _marketKeyToMarket[marketKey].addr,
            "Only market contract can mint Currency!"
        );
        uint256 currencyTokenId = _marketKeyToMarket[marketKey].currencyTokenId;
        string memory currencyTokenUri = _marketKeyToMarket[marketKey]
            .currencyTokenUri;
        _mint(msg.sender, currencyTokenId, supply, "");
        emit CurrencyMinted(
            marketKey,
            currencyTokenId,
            supply,
            currencyTokenUri
        );
    }

    // Derived contract must override function "_beforeTokenTransfer".
    // Two or more base classes define function with same name and parameter types.
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
