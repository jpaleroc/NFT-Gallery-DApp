// SPDX-License-Identifier: MIT
// Developed by Jesus Palero
pragma solidity ^0.8.0;

import "./721/ERC721.sol";

contract JPNFTGallery is ERC721 {
    uint256 private _tokenId;

    function getNextId() external view returns (uint256) {
        return _tokenId;
    }

    constructor() ERC721("JP-NFT-Gallery", "JP-NFT") {}

    function mint(address to, string memory uri, uint256 price) public {
        _mint(to, _tokenId, uri, price);
        _tokenId += 1;
    }
}