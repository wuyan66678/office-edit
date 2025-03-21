define(["common/main/lib/component/cryptojs/core", "common/main/lib/component/cryptojs/cipher-core"], function() {
	/**
	 * Electronic Codebook block mode.
	 */
	CryptoJS.mode.ECB = (function () {
			var ECB = CryptoJS.lib.BlockCipherMode.extend();

			ECB.Encryptor = ECB.extend({
					processBlock: function (words, offset) {
							this._cipher.encryptBlock(words, offset);
					}
			});

			ECB.Decryptor = ECB.extend({
					processBlock: function (words, offset) {
							this._cipher.decryptBlock(words, offset);
					}
			});

			return ECB;
	}());

	return CryptoJS.mode.ECB;
});