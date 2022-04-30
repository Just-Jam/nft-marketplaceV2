//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketplaceV2 is ReentrancyGuard, Ownable {
    
    event ItemListed(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event ItemPurchased(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    uint256 immutable feePercent;
    uint256 public itemCount;

    struct Item {
        IERC721 nft;
        uint256 id;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
    }

    mapping(uint256 => Item) public items;
    mapping(IERC721 => bool) public approvedCollections;

    constructor(uint256 _feePercent) {
        feePercent = _feePercent;
    }

    function getTotalPrice(uint _itemId) view public returns(uint){
        return(items[_itemId].price*(100 + feePercent)/100);
    }

    function listItem(IERC721 _nft, uint256 _tokenId, uint256 _price) external nonReentrant returns(uint256){
        require(approvedCollections[_nft], "Collection not approved");
        require(_price > 0, "Price must be greater than 0");
        itemCount++;
        items[itemCount] = Item(_nft, itemCount, _tokenId, _price, payable(msg.sender), false);
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        emit ItemListed(
            itemCount, 
            address(_nft), 
            _tokenId, 
            _price, 
            msg.sender
        );

        return itemCount;
    }

    function unlistItem(uint256 _itemId) external nonReentrant {
        require(_itemId > 0, "Item ID must be greater than 0");
        Item storage item = items[_itemId];
        require(item.seller == msg.sender, "Only the seller can unlist the item");
        require(!item.sold, "Item has already been sold");
        items[_itemId].nft.transferFrom(address(this), msg.sender, item.tokenId);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");
        require(msg.value >= _totalPrice, "Not enough ETH to cover item price and market fee");
        require(!item.sold, "Item has already been sold");
        item.seller.transfer(item.price);
        payable(owner()).transfer(_totalPrice - item.price);
        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit ItemPurchased(
            item.tokenId, 
            address(item.nft), 
            item.tokenId, 
            item.price, 
            item.seller, 
            msg.sender
        );
    }

    function approveCollection(IERC721 _nft) external onlyOwner {
        require(!approvedCollections[_nft], "Collection already approved");
        approvedCollections[_nft] = true;
    }
}