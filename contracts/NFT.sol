// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable, EIP712, ERC721Votes {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    //updatable state (global) variables 
    uint256 public salesPrice;
    // uint256 public balance;
    uint256 public maxSupply;  
    string  public contractMetadata;// Experimental: openSea contract-level metadata  

    constructor( string memory _contractMetadata ) payable ERC721("My Token", "MYT") EIP712("My Token", "1") {

       salesPrice = 10**16; // or use: 0.01 ether or  0.01 * 10**18;
       maxSupply = 5;
       contractMetadata = _contractMetadata;

   }

    function contractURI() public view returns (string memory) {
        return contractMetadata;
    }

    function setContractURI( string memory _contractMetadata ) public  onlyOwner{
        contractMetadata = _contractMetadata;
    }

    function getTokenCurrentTokenID() public view returns(uint256){
        uint256 tokenId = _tokenIdCounter.current();
        return tokenId;
    }    

    function getTotalSupply() public view returns (uint256) { //from MOCK template
        return _getTotalSupply();
    }

    function setTotalSupply(uint256 _maxSupply) public onlyOwner{
        maxSupply = _maxSupply;
    }

    function setSalesPrice(uint256 _salesPrice) public onlyOwner{
        salesPrice = _salesPrice;
    }

    //TODO: delete in production: for unit testing only
    function deleteContract(address payable _admin) public onlyOwner{ 
        selfdestruct(_admin); 
    } 

    function withdraw(uint256 amount, address payable destAddress) public onlyOwner{
        require(amount <= address(this).balance, "Can't withdraw more than current balance");
        destAddress.transfer(amount);
    }  

    receive() payable external {}

    function receivePayThenMint(address to, string memory _tokenURI) payable public {    
        require(msg.value == salesPrice, "Please pay the correct sales price");
        safeMint(to, _tokenURI);
    }  

    function safeMint(address to,  string memory uri) private {
        require( _tokenIdCounter.current() < maxSupply, "Max supply of NFTs exhausted"); //custom hack see comment obove
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);  //TODO is tokenId zero-indexed?
        _setTokenURI(tokenId, uri);
    }
    //End custom fuctions
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Votes)
    {
        super._afterTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}