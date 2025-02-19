const { ethers } = require("ethers");
const ERC20 = require("../contracts/erc20");
const EntryPoint = require("../contracts/entryPoint");
const Wallet = require("../contracts/wallet");
const userOperations = require("../constants/userOperations");

module.exports.ERC20Approve = (tokenAddress, spender, value) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    tokenAddress,
    0,
    ERC20.interface.encodeFunctionData("approve", [spender, value]),
  ]);
};

module.exports.ERC20Transfer = (tokenAddress, to, value) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    tokenAddress,
    0,
    ERC20.interface.encodeFunctionData("transfer", [to, value]),
  ]);
};

module.exports.executeUserOp = (to, value, data) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    to,
    value ?? ethers.constants.Zero,
    data ?? userOperations.nullCode,
  ]);
};

module.exports.initialize = (entryPoint, owner, guardians) => {
  return Wallet.interface.encodeFunctionData("initialize", [
    entryPoint,
    owner,
    guardians,
  ]);
};

module.exports.transferOwner = (newOwner) => {
  return Wallet.interface.encodeFunctionData("transferOwner", [newOwner]);
};

module.exports.grantGuardian = (guardian) => {
  return Wallet.interface.encodeFunctionData("grantGuardian", [guardian]);
};

module.exports.revokeGuardian = (guardian) => {
  return Wallet.interface.encodeFunctionData("revokeGuardian", [guardian]);
};

module.exports.addEntryPointStake = (value) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    EntryPoint.address,
    value._isBigNumber ? value : ethers.utils.parseEther(value),
    EntryPoint.interface.encodeFunctionData("addStake"),
  ]);
};

module.exports.lockEntryPointStake = () => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    EntryPoint.address,
    0,
    EntryPoint.interface.encodeFunctionData("lockStake"),
  ]);
};

module.exports.upgradeTo = (newImplementation) => {
  return Wallet.interface.encodeFunctionData("upgradeTo", [newImplementation]);
};
