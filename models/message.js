const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema(
  {
    content: {
      type: String,
      require: true,
      maxLength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    author: {
      type: String,
      require: true,
      maxLength: 20
    }
  }
);

module.exports = mongoose.model('Message', MessageSchema);
