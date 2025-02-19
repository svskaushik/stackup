const catchAsync = require('../utils/catchAsync');
const { inviteService } = require('../services');
const { featureFlag } = require('../config/config');

module.exports.useInvite = catchAsync(async (req, res, next) => {
  if (featureFlag.whitelist) {
    const invite = await inviteService.findInviteByCode(req.query.inviteCode);
    await inviteService.updateInvite(invite, { used: true });
  }

  next();
});
