import CryptoJS from 'crypto-js';

export const encryptData = (data, password) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
};

export const decryptData = (encryptedData, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return { success: true, data: decryptedData };
  } catch (error) {
    return { success: false, error: 'Incorrect password or corrupted data' };
  }
};