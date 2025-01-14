const { ethers } = require("ethers");
const {
  initEncryptedIdentity,
  decryptSigner,
  reencryptSigner,
} = require("./proxy");
const { Wallet, EntryPoint } = require("../contracts");

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

describe("Wallet proxy", () => {
  describe("create initial identity", () => {
    it("has all the correct fields", async () => {
      const wallet = await initEncryptedIdentity("password", "salt", {
        guardians: [ethers.constants.AddressZero],
      });

      expect(wallet.walletAddress).toMatch(ADDRESS_REGEX);
      expect(wallet.initImplementation).toEqual(Wallet.address);
      expect(wallet.initEntryPoint).toEqual(EntryPoint.address);
      expect(wallet.initOwner).toMatch(ADDRESS_REGEX);
      expect(wallet.initGuardians.length).toEqual(1);
      expect(wallet.initGuardians[0]).toEqual(ethers.constants.AddressZero);
    });
  });

  describe("decrypting signer", () => {
    it("returns the signer when password is correct", async () => {
      const wallet = await initEncryptedIdentity("password", "salt");
      const signer = await decryptSigner(wallet, "password", "salt");

      expect(wallet.initOwner).toEqual(signer.address);
    });

    it("does not return the signer when password is incorrect", async () => {
      const wallet = await initEncryptedIdentity("password", "salt");
      const signer = await decryptSigner(wallet, "wrongPassword", "salt");

      expect(signer).toBeUndefined();
    });

    it("does not return the signer when salt is incorrect", async () => {
      const wallet = await initEncryptedIdentity("password", "salt");
      const signer = await decryptSigner(wallet, "password", "wrongSalt");

      expect(signer).toBeUndefined();
    });

    it("does not return the signer when password has different case", async () => {
      const wallet = await initEncryptedIdentity("password", "salt");
      const signer = await decryptSigner(wallet, "PASSWORD", "salt");

      expect(signer).toBeUndefined();
    });

    it("returns the signer when salt has different case", async () => {
      const wallet = await initEncryptedIdentity("password", "salt");
      const signer = await decryptSigner(wallet, "password", "SALT");

      expect(wallet.initOwner).toEqual(signer.address);
    });
  });

  describe("Reencrypt signer", () => {
    it("returns a new encryptedSigner value", async () => {
      const w1 = await initEncryptedIdentity("password", "salt");
      const w2 = {
        ...w1,
        encryptedSigner: await reencryptSigner(
          w1,
          "password",
          "newPassword",
          "salt"
        ),
      };

      const oldSigner = await decryptSigner(w1, "password", "salt");
      const newSigner = await decryptSigner(w2, "newPassword", "salt");

      expect(oldSigner.address).toEqual(newSigner.address);
    });

    it("does not return an encryptedSigner value if password is wrong", async () => {
      const w = await initEncryptedIdentity("password", "salt");
      const encryptedSigner = await reencryptSigner(
        w,
        "wrongPassword",
        "newPassword",
        "salt"
      );

      expect(encryptedSigner).toBeUndefined();
    });
  });
});
