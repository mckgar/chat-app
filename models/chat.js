const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema(
  {
    users: [
      {
        type: String,
        maxLength: 20
      }
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      }
    ]
  }
);

module.exports = mongoose.model('Chat', ChatSchema);
