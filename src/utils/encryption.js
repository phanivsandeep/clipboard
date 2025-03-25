import CryptoJS from 'crypto-js';

export const encryptData = (data, encryptionKey) => {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decryptData = (encryptedData, encryptionKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      return { success: false, message: 'Decryption failed' };
    }
    
    return { 
      success: true, 
      data: JSON.parse(decrypted)
    };
  } catch (error) {
    console.error('Decryption error:', error);
    return { success: false, message: 'Unable to decrypt data' };
  }
};