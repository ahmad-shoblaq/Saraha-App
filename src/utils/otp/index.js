/**
 * Generate a random 6-digit OTP code
 * @param {number} expireTime - Time in milliseconds for OTP to expire (default: 15 minutes)
 * @returns {Object} { otp: string, otpExpire: number }
 */

export const generateOTP = (expireTime = 15 * 60 * 1000) => {
    const otp = Math.floor(Math.random() * 900000 + 100000);
    const otpExpire = Date.now() + expireTime; // default 15 minutes
    return { otp, otpExpire };
}

generateOTP();