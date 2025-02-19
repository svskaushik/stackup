// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import "../UserOperation.sol";
import "../helpers/Calldata.sol";
import "../paymaster/PaymasterHelpers.sol";
import "../paymaster/Paymaster.sol";

struct WalletCallData {
  address to;
  uint256 value;
  bytes data;
}

struct WalletSignature {
  WalletSignatureMode mode;
  WalletSignatureValue[] values;
}

struct WalletSignatureValue {
  address signer;
  bytes signature;
}

enum WalletSignatureMode {
  owner,
  guardians
}

library WalletHelpers {
  using ECDSA for bytes32;
  using Calldata for bytes;
  using PaymasterHelpers for bytes;
  using PaymasterHelpers for UserOperation;

  /**
   * @dev Tells if a wallet signature value is valid or not
   */
  function isValid(WalletSignatureValue memory self, bytes32 requestId) internal view returns (bool) {
    return SignatureChecker.isValidSignatureNow(self.signer, requestId.toEthSignedMessageHash(), self.signature);
  }

  /**
   * @dev Guardians can only perform the following actions:
   * 1. Approve token allowance for paymaster
   * 2. Transfer owner for social recovery
   */
  function isGuardianActionAllowed(UserOperation calldata op) internal pure returns (bool) {
    if (op.callData.length == 0) return false;
    return isAllowingTokensForPaymaster(op) || op.callData.isTransferOwner();
  }

  /**
   * @dev Checks if the op's calldata is calling IERC20#approve through IWallet#executeUserOp for the paymaster
   * This function does not check if the approved amount is enough, the paymaster should control that
   */
  function isAllowingTokensForPaymaster(UserOperation calldata op) internal pure returns (bool) {
    if (op.paymasterData.length == 0 || !op.callData.isExecuteUserOp()) return false;

    WalletCallData memory walletCallData = decodeWalletCallData(op);
    if (!walletCallData.data.isERC20Approve()) return false;
    if (walletCallData.to != address(op.decodePaymasterData().token)) return false;
    return op.paymaster == abi.decode(walletCallData.data.params(), (address));
  }

  /**
   * @dev Decodes operation's calldata assuming it is calling IWallet#executeUserOp
   */
  function decodeWalletCallData(UserOperation calldata op) internal pure returns (WalletCallData memory) {
    (address to, uint256 value, bytes memory data) = abi.decode(op.callData.params(), (address, uint256, bytes));
    return WalletCallData(to, value, data);
  }

  /**
   * @dev Decodes operation's signature assuming the expected layout defined by WalletSignatureMode
   */
  function decodeWalletSignature(UserOperation calldata op) internal pure returns (WalletSignature memory) {
    (WalletSignatureMode mode, WalletSignatureValue[] memory values) = abi.decode(
      op.signature,
      (WalletSignatureMode, WalletSignatureValue[])
    );
    return WalletSignature(mode, values);
  }
}
