// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ColorToken is ERC721 {
    uint256 tokenId = 1;
    address public owner;

    struct Color {
        uint tokenId;
        string colorValue;
        address owner;
    }
    
    Color[] public allColors;

    mapping(address => Color[]) public colorsByAddr;
    mapping(string => bool) public colorExists;

    constructor() ERC721("ColorToken", "CLRT") {
        owner = msg.sender;
    }

    function mintColor(string calldata _colorValue) public payable {
        require(!colorExists[_colorValue], "Color already exists");
        _safeMint(msg.sender, tokenId);
        allColors.push(Color(tokenId, _colorValue, msg.sender));
        colorsByAddr[msg.sender].push(Color(tokenId, _colorValue, msg.sender));
        colorExists[_colorValue] = true;
        tokenId++;
    }

    function getMyColors() public view returns (Color[] memory) {
        return colorsByAddr[msg.sender];
    }

    function getAllColors() public view returns (Color[] memory) {
        return allColors;
    }
}
