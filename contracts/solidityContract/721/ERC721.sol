// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.2) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import "./IERC721.sol";
import "../165/ERC165.sol";

contract ERC721 is ERC165, IERC721 {

    // Token name & symbol
    string private _name;
    string private _symbol;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    // Mapping owner address to token count
    mapping(address => uint256) private _balances;
    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;
    // Mapping from token ID to creator address
    mapping(uint256 => address) private _creators;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    
    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
    * @dev Returns the name of the contract.
    * @return Name of the contract.
    */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
    * @dev Returns the symbol of the contract tokens.
    * @return Symbol of the contract tokens.
    */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }


    /**
    * @dev Internal fuction that returns the function caller.
    * @return Address of the function caller.
    */
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    /**
    * @dev Internal fuction that returns the data attached on the function call
    * @return Data on the funcion call.
    */
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }


    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view virtual override returns (uint256) {
        require(owner != address(0), "ERC721: address zero is not a valid owner");
        return _balances[owner];
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_owners[tokenId] != address(0), "ERC721: invalid token ID");
        return _owners[tokenId];
    }

    /**
    * @dev Returns the address of the creator of the NFT. NFTs assigned to the zero address are
    * considered invalid, and queries about them do throw.
    * @param tokenId The identifier for an NFT.
    * @return Address of tokenId creator.
    */
    function creatorOf(uint256 tokenId) public view virtual returns (address) {
        require(_creators[tokenId] != address(0), "ERC721: invalid token ID");
        return _creators[tokenId];
    }

    /**
    * @dev Returns the URL containing NFT metadata. NFTs assigned to the zero address are
    * considered invalid, and queries about them do throw.
    * @param tokenId The identifier for an NFT.
    * @return URL of the tokenId.
    */
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        require(_owners[tokenId] != address(0), "ERC721: invalid token ID");
        return _tokenURIs[tokenId];
    }


    /**
    * @dev Internal function that guarantees that the tokenUri for the new token is not already used in other. 
    * @param tokenId The identifier for an NFT, also the count for the tokens minted before it.
    * @param tokenUri URL containing NFT metadata.
    */
    function _validTokenURI(uint256 tokenId, string memory tokenUri) internal view {
        bool found = false;
        for (uint i = 0; i < tokenId && !found; i++)
            if (bytes(_tokenURIs[i]).length == bytes(tokenUri).length) {
                found = keccak256(abi.encodePacked(_tokenURIs[i])) == keccak256(abi.encodePacked(tokenUri));
            }
        require(!found, "Token uri already used in a minted token.");
    }

    /**
    * @dev Mints `tokenId` and transfers it to `to`. It guarantees that tokenId is not already minted, that 'to'
    * address is not the zero address, and that 'tokenUri' is not used in another token.
    * @param to Address 
    * @param tokenUri URL containing NFT metadata.
    * @param tokenUri URL containing NFT metadata.
    * Emits a {Transfer} event.
    */
    function _mint(address to, uint256 tokenId, string memory tokenUri) internal virtual {
        require(to != address(0), "ERC721: mint to the zero address");
        require(_owners[tokenId] == address(0), "ERC721: token already minted");
        _validTokenURI(tokenId, tokenUri);

        _balances[to] += 1;
        _creators[tokenId] = to;
        _owners[tokenId] = to;
        _tokenURIs[tokenId] = tokenUri;

        emit Transfer(address(0), to, tokenId);
    }

    /**
    * @notice This is an internal function which should be called from user-implemented external burn
    * function. Also, note that this burn implementation allows the minter to re-mint a burned
    * NFT.
    * @dev Burns a NFT.
    * @param tokenId ID of the NFT to be burned.
    */
    function _burn(uint256 tokenId) internal virtual {
        address owner = ERC721.ownerOf(tokenId);

        _balances[owner] -= 1;
        delete _tokenApprovals[tokenId];
        delete _creators[tokenId];
        delete _owners[tokenId];
        delete _tokenURIs[tokenId];

        emit Transfer(owner, address(0), tokenId);
    }


    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom( address from, address to, uint256 tokenId) public virtual override {
        transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom( address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom( address from, address to, uint256 tokenId) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        require(ERC721.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");

        // Clear approvals from the previous owner
        delete _tokenApprovals[tokenId];

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }


    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ERC721.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");
        require(_msgSender() == owner || isApprovedForAll(owner, _msgSender()), "ERC721: approve caller is not token owner or approved for all");
        
        _tokenApprovals[tokenId] = to;
        emit Approval(ERC721.ownerOf(tokenId), to, tokenId);
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        require(_owners[tokenId] != address(0), "ERC721: invalid token ID");
        return _tokenApprovals[tokenId];
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        address owner = ERC721.ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Emits an {ApprovalForAll} event.
     */
    function _setApprovalForAll( address owner, address operator, bool approved) internal virtual {
        require(owner != operator, "ERC721: approve to caller");
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }


    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC721).interfaceId || super.supportsInterface(interfaceId);
    }
}
