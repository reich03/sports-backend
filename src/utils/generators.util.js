// Generate a random OTP code (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a random code for groups (8 characters)
const generateGroupCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Generate a random token for password reset
const generateResetToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

module.exports = {
  generateOTP,
  generateGroupCode,
  generateResetToken
};
