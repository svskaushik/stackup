const crypto = require('crypto');
const { intercom } = require('../config/config');

module.exports.getHmacHash = (userId) => {
  return crypto.createHmac('sha256', intercom.identityVerificationSecret).update(userId.toString()).digest('hex');
};
