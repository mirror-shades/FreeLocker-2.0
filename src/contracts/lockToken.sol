//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract LockToken is ERC20 {
    constructor() ERC20("LockToken", "LTK") {
    }

    //this is a contract for a testnet project and acts as a faucet for free ERC20 tokens
    function publicMint(address recevier) public {
       _mint(recevier, 100* 10**18);
    }
}