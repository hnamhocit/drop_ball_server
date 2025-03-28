import * as CryptoJS from 'crypto-js';

const encrypt = (text: string) => {
  const secretKey = process.env.KEY?.replace(/\\n/g, '\n');
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Hex.parse(secretKey as string),
    {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    },
  );

  const encryptedBase64 = CryptoJS.enc.Base64.stringify(
    iv.concat(encrypted.ciphertext),
  );

  return encryptedBase64;
};

const decrypt = (encryptedText: string) => {
  try {
    const fullCipher = CryptoJS.enc.Base64.parse(encryptedText);

    const iv = CryptoJS.lib.WordArray.create(fullCipher.words.slice(0, 4), 16);
    const ciphertext = CryptoJS.lib.WordArray.create(fullCipher.words.slice(4));

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const secretKey = process.env.KEY?.replace(/\\n/g, '\n');

    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      CryptoJS.enc.Hex.parse(secretKey as string),
      {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      },
    );

    // Return decrypted text in UTF-8 format
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return;
  }
};

const uins = ['10001', '10002', '10003', '10004'];
for (const testUIN of uins) {
  console.log('Bearer ' + encrypt(testUIN));
}

export { decrypt, encrypt };
