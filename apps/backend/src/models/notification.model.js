const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { type } = require('../config/transaction');

const notificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    preview: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: [type.recoverAccount, type.newPayment],
      required: true,
    },
    data: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
