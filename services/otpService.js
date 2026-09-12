import axios from 'axios';

// In-memory store for OTPs (For production, consider Redis or MongoDB)
const otpStore = {};

/**
 * Sends a 6-digit OTP via APITxT to the provided mobile number.
 * @param {string} phone - 10-digit mobile number
 * @returns {object} { success, message, otp (dev only) }
 */
export const sendOTP = async (phone) => {
  if (!phone || phone.length !== 10) {
    return { success: false, message: 'Invalid phone number format. Must be 10 digits.' };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5-minute expiry
  otpStore[phone] = { 
    otp, 
    expiry: Date.now() + 5 * 60 * 1000 
  };

  try {
    const params = new URLSearchParams({
      authkey: process.env.APITXT_API_KEY,
      mobile: phone,
      otp,
      channel: 'sms',
      country: '91',
    });

    const response = await axios.post('https://apitxt.com/api/sendOTP', params);
    
    if (response.data.status === 'success' || response.data.message === 'Message Sent Successfully') {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      console.error('APITxT Send Error:', response.data);
      return { success: false, message: response.data.message || 'Failed to send OTP via provider' };
    }
  } catch (err) {
    console.error('OTP Service Error:', err.message);
    return { success: false, message: 'Error communicating with SMS gateway' };
  }
};

/**
 * Verifies an OTP against the in-memory store.
 * @param {string} phone - 10-digit mobile number
 * @param {string} otp - 6-digit OTP
 * @returns {object} { success, message }
 */
export const verifyOTP = (phone, otp) => {
  const record = otpStore[phone];
  
  if (!record) {
    return { success: false, message: 'OTP not found or not generated for this number' };
  }
  
  if (Date.now() > record.expiry) {
    delete otpStore[phone]; // Cleanup expired
    return { success: false, message: 'OTP has expired' };
  }
  
  if (record.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }
  
  // Cleanup after successful verification
  delete otpStore[phone];
  
  return { success: true, message: 'OTP verified successfully' };
};
