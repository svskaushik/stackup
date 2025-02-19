// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Staking.sol";
import "./IEntryPoint.sol";
import "./ISingletonFactory.sol";
import "./EntryPointHelpers.sol";
import "../UserOperation.sol";
import "../helpers/Calls.sol";
import "../helpers/GasUsed.sol";
import "../wallet/IWallet.sol";
import "../paymaster/IPaymaster.sol";

contract EntryPoint is IEntryPoint, Staking {
  using Calls for address;
  using Calls for address payable;
  using Address for address;
  using SafeMath for uint256;
  using EntryPointHelpers for UserOperation;

  struct UserOpVerification {
    bytes context;
    uint256 gasUsed;
  }

  ISingletonFactory public immutable create2Factory;

  constructor(ISingletonFactory _create2Factory) {
    create2Factory = _create2Factory;
  }

  function getGasPrice(UserOperation calldata op) external view returns (uint256) {
    return op.gasPrice();
  }

  function getRequiredPrefund(UserOperation calldata op) external view returns (uint256) {
    return op.requiredPrefund();
  }

  function getSenderAddress(bytes memory initCode, uint256 salt) external view returns (address) {
    bytes32 data = keccak256(abi.encodePacked(bytes1(0xff), address(create2Factory), salt, keccak256(initCode)));
    return address(uint160(uint256(data)));
  }

  function simulateValidation(UserOperation calldata op) external returns (uint256 preOpGas, uint256 prefund) {
    require(msg.sender == address(0), "EntryPoint: Caller not zero");
    uint256 preGas = gasleft();
    _verifyOp(op);
    preOpGas = GasUsed.since(preGas) + op.preVerificationGas;
    prefund = op.requiredPrefund();
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer) external {
    UserOpVerification[] memory verifications = new UserOpVerification[](ops.length);
    for (uint256 i = 0; i < ops.length; i++) verifications[i] = _verifyOp(ops[i]);

    uint256 totalGasCost;
    for (uint256 i = 0; i < ops.length; i++) totalGasCost += _executeOp(ops[i], verifications[i]);
    redeemer.sendValue(totalGasCost, "EntryPoint: Failed to redeem");
  }

  function _verifyOp(UserOperation calldata op) internal returns (UserOpVerification memory verification) {
    uint256 preValidationGas = gasleft();
    _createWalletIfNecessary(op);
    _validateWallet(op);

    // Marker used of-chain for opcodes validation
    block.number;

    uint256 walletValidationGas = GasUsed.since(preValidationGas);
    uint256 paymasterValidationGas = op.verificationGas.sub(walletValidationGas, "EntryPoint: Verif gas not enough");
    verification.context = _validatePaymaster(op, paymasterValidationGas);
    verification.gasUsed = GasUsed.since(preValidationGas);
    require(verification.gasUsed <= op.verificationGas, "EntryPoint: Verif gas not enough");
  }

  function _createWalletIfNecessary(UserOperation calldata op) internal {
    bool hasInitCode = op.hasInitCode();
    bool isAlreadyDeployed = op.isAlreadyDeployed();
    require((isAlreadyDeployed && !hasInitCode) || (!isAlreadyDeployed && hasInitCode), "EntryPoint: Wrong init code");

    if (!isAlreadyDeployed) {
      create2Factory.deploy(op.initCode, bytes32(op.nonce));
    }
  }

  function _validateWallet(UserOperation calldata op) internal {
    uint256 requiredPrefund = op.hasPaymaster() ? 0 : op.requiredPrefund();
    uint256 initBalance = address(this).balance;
    IWallet(op.sender).validateUserOp{ gas: op.verificationGas }(op, op.requestId(), requiredPrefund);

    uint256 actualPrefund = address(this).balance.sub(initBalance, "EntryPoint: Balance decreased");
    require(actualPrefund >= requiredPrefund, "EntryPoint: incorrect prefund");
  }

  function _validatePaymaster(UserOperation calldata op, uint256 validationGas) internal returns (bytes memory) {
    if (!op.hasPaymaster()) return new bytes(0);

    Stake storage stake = _getStake(op.paymaster);
    require(stake.isLocked, "EntryPoint: Stake not locked");
    uint256 requiredPrefund = op.requiredPrefund();
    stake.value = stake.value.sub(requiredPrefund, "EntryPoint: Insufficient stake");

    return IPaymaster(op.paymaster).validatePaymasterUserOp{ gas: validationGas }(op, op.requestId(), requiredPrefund);
  }

  function _executeOp(UserOperation calldata op, UserOpVerification memory verification)
    internal
    returns (uint256 totalGasCost)
  {
    uint256 preExecutionGas = gasleft();
    op.sender.callWithGas(op.callData, op.callGas, "EntryPoint: Execute failed");
    uint256 totalGasUsed = verification.gasUsed + GasUsed.since(preExecutionGas);
    totalGasCost = totalGasUsed * op.gasPrice();
    uint256 refund = op.requiredPrefund().sub(totalGasCost, "EntryPoint: Insufficient refund");

    // TODO: someone has to pay for this call
    if (op.hasPaymaster()) {
      IPaymaster(op.paymaster).postOp(PostOpMode.opSucceeded, verification.context, totalGasCost);
      Stake storage stake = _getStake(op.paymaster);
      stake.value = stake.value + refund;
    } else {
      payable(op.sender).sendValue(refund, "EntryPoint: Failed to refund");
    }
  }
}
