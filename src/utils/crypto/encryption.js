
import crypto from 'crypto';


const ALGORITHM = 'aes-256-cbc';
const ENCODING = 'base64';
const IV_LENGTH = 16;


const SECRET_KEY = crypto.scryptSync(
  process.env.ENCRYPTION_SECRET, 
  'salt', 
);

export const encryptPhone = (phoneNumber) => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(phoneNumber, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);
    return `${iv.toString(ENCODING)}:${encrypted}`;
  } catch (error) {
    throw new Error('Phone encryption failed: ' + error.message);
  }
};

export const decryptPhone = (encryptedPhone) => {
  try {
    const parts = encryptedPhone.split(':');
    const iv = Buffer.from(parts[0], ENCODING);
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Phone decryption failed: ' + error.message);
  }
};

