// SPDX-License-Identifier: GPL-2.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Locker is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address;

    uint256 private counter = 1;  // Start from 1 to avoid zero-value IDs
    uint256 immutable MIN_DEPOSIT = 1000;
    uint256 immutable MAX_LOCK_DURATION = 9999 * 1 days;

    mapping (address => uint256[]) public addressToIds;
    mapping (uint256 => Safe) public idToSafe;

    // Struct representing a locked safe with details about the owner, token, amount, unlock time, and activity status
    struct Safe {
        address owner;
        address token;
        uint256 amount;
        uint256 unlock;
        bool active;
    }

    event Deposit(uint256 id, address indexed user, address indexed token, uint256 amount, uint256 unlock);
    event Unlock(uint256 id, address indexed user, address indexed token, uint256 amount);

    /**
     * @notice Deposit tokens into a locked safe.
     * @param user The user who will own the safe.
     * @param token The ERC20 token address being deposited.
     * @param amount The amount of tokens to be deposited.
     * @param length The duration (in seconds) until the tokens can be unlocked.
     * @return id The unique identifier of the newly created safe.
     */
    function deposit(address user, address token, uint256 amount, uint256 length) external nonReentrant returns (uint256 id) {
        require(amount > MIN_DEPOSIT, "Deposit too low");
        require(length > 0 && length <= MAX_LOCK_DURATION, "9999 days max lock");

        IERC20 lp = IERC20(token);
        lp.safeTransferFrom(msg.sender, address(this), amount);

        uint256 currentID = counter++;
        Safe memory newSafe = Safe({
            owner: user,
            token: token,
            amount: amount,
            unlock: block.timestamp + length,
            active: true
        });

        addressToIds[user].push(currentID);
        idToSafe[currentID] = newSafe;

        emit Deposit(currentID, user, token, amount, newSafe.unlock);

        return currentID;
    }

    /**
     * @notice Unlock the tokens from a specific safe.
     * @param id The unique identifier of the safe to unlock.
     * @return bool Returns true if the unlocking is successful.
     */
    function unlock(uint256 id) external nonReentrant returns (bool) {
        Safe storage userSafe = idToSafe[id];
        require(userSafe.owner == msg.sender, "Not the owner of this safe");
        require(userSafe.unlock <= block.timestamp, "Still locked");
        require(userSafe.amount > 0, "Already unlocked");

        uint256 amount = userSafe.amount;
        userSafe.amount = 0;
        userSafe.active = false;

        IERC20(userSafe.token).safeTransfer(msg.sender, amount);

        emit Unlock(id, msg.sender, userSafe.token, amount);

        return true;
    }

    function getSafe(uint256 id) external view returns (Safe memory) {
        return idToSafe[id];
    }

    function getIds(address user) external view returns (uint256[] memory) {
        return addressToIds[user];
    }
}