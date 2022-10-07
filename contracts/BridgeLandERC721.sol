// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BridgeLandERC721 is
  ERC721,
  ERC721Enumerable,
  ERC721URIStorage,
  ERC721Burnable,
  Ownable,
  ERC2981
{
  using Counters for Counters.Counter;
  uint256 constant MAX_BATCH_SIZE = 50;

  Counters.Counter private _tokenIdCounter;

  address public allowedMinter;
  string private contractUri;

  constructor(
    string memory collectionName,
    string memory collectionSymbol,
    string memory _contractURI,
    uint96 _royaltyPercentage,
    address _allowedMinter,
    address _owner
  ) ERC721(collectionName, collectionSymbol) {
    allowedMinter = _allowedMinter;
    contractUri = _contractURI;
    _setDefaultRoyalty(_owner, _royaltyPercentage);
    _transferOwnership(_owner);
    _tokenIdCounter.increment();
  }

  function setAllowedMinter(address _allowedMinter) public onlyOwner {
    allowedMinter = _allowedMinter;
  }

  function setContractURI(string memory _contractURI) public onlyOwner {
    contractUri = _contractURI;
  }

  function contractURI() public view returns (string memory) {
    return contractUri;
  }

  function safeMint(address to, string memory _tokenURI) public {
    require(msg.sender == allowedMinter, "Only allowed minter can mint");

    uint256 tokenId = _tokenIdCounter.current();

    _safeMint(to, tokenId);
    _setTokenURI(tokenId, _tokenURI);
    _tokenIdCounter.increment();
  }

  function safeBatchMint(address to, string[] memory tokenURI_) public {
    require(msg.sender == allowedMinter, "Only allowed minter can mint");

    uint256 arraySize = tokenURI_.length;
    require((arraySize > 0), "Array is empty");
    require((arraySize <= MAX_BATCH_SIZE), "Qty exceeds Max array size");

    unchecked {
      for (uint256 i = 0; i < arraySize; i++) {
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_[i]);
        _tokenIdCounter.increment();
      }
    }
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
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
    virtual
    override(ERC2981, ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function setDefaultRoyalty(address receiver, uint96 feeNumerator)
    public
    onlyOwner
  {
    _setDefaultRoyalty(receiver, feeNumerator);
  }

  function deleteDefaultRoyalty() public onlyOwner {
    _deleteDefaultRoyalty();
  }

  function setTokenRoyalty(
    uint256 tokenId,
    address receiver,
    uint96 feeNumerator
  ) public onlyOwner {
    _setTokenRoyalty(tokenId, receiver, feeNumerator);
  }

  function resetTokenRoyalty(uint256 tokenId) public onlyOwner {
    _resetTokenRoyalty(tokenId);
  }
}
