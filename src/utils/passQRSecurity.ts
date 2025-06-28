
import CryptoJS from 'crypto-js';

// Pass QR code security utilities
const PASS_QR_SECRET = 'transit-pass-qr-secret-2024'; // In production, use environment variable

export interface SecurePassQRData {
  passId: string;
  userId: string;
  routeId: string;
  expiryDate: string;
  timestamp: number;
  nonce: string;
}

export const generateSecurePassQRCode = (passData: {
  passId: string;
  userId: string;
  routeId: string;
  expiryDate: string;
}): string => {
  const data: SecurePassQRData = {
    ...passData,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15)
  };
  
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), PASS_QR_SECRET).toString();
  return encrypted;
};

export const validatePassQRCode = (qrData: string): { 
  isValid: boolean; 
  passData?: SecurePassQRData; 
  error?: string 
} => {
  try {
    const decrypted = CryptoJS.AES.decrypt(qrData, PASS_QR_SECRET).toString(CryptoJS.enc.Utf8);
    const data: SecurePassQRData = JSON.parse(decrypted);
    
    // Check if QR code is not older than 24 hours
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (data.timestamp < twentyFourHoursAgo) {
      return { isValid: false, error: 'Pass QR code has expired' };
    }
    
    // Validate required fields
    if (!data.passId || !data.userId || !data.routeId) {
      return { isValid: false, error: 'Invalid pass data in QR code' };
    }
    
    // Check if pass is expired
    const expiryDate = new Date(data.expiryDate);
    if (expiryDate < new Date()) {
      return { isValid: false, error: 'Pass has expired' };
    }
    
    return { isValid: true, passData: data };
  } catch (error) {
    console.error('Pass QR validation error:', error);
    return { isValid: false, error: 'Invalid pass QR code format' };
  }
};

export const sanitizePassQRInput = (input: string): string => {
  // Remove any potentially dangerous characters
  return input.replace(/[<>\"'&]/g, '');
};
