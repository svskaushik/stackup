// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

import "./UpgradeableACL.sol";
import "../wallet/IWallet.sol";

/**
 * @dev Calldata helpers library
 */
library Calldata {
  using SafeMath for uint256;

  function isExecuteUserOp(bytes memory self) internal pure returns (bool) {
    return selector(self) == IWallet.executeUserOp.selector;
  }

  function isTransferOwner(bytes memory self) internal pure returns (bool) {
    return selector(self) == UpgradeableACL.transferOwner.selector;
  }

  function isERC20Approve(bytes memory self) internal pure returns (bool) {
    return selector(self) == IERC20.approve.selector;
  }

  function selector(bytes memory self) internal pure returns (bytes4) {
    return bytes4(BytesLib.slice(self, 0, 4));
  }

  function params(bytes memory self) internal pure returns (bytes memory) {
    return BytesLib.slice(self, 4, self.length.sub(4, "Calldata: No params to decode"));
  }
}
