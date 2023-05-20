// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./721/ERC721.sol";

contract JPNFTGallery is ERC721 {
    uint256 private _tokenId;

    function getNextId() external view returns (uint256) {
        return _tokenId;
    }

    constructor() ERC721("JP-NFT-Gallery", "JP-NFT") {}

    function mint(address to, string memory uri) public virtual {
        _mint(to, _tokenId, uri);
        _tokenId += 1;
    }

    function burn(uint256 tokenId) public virtual {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        _burn(tokenId);
    }
}
