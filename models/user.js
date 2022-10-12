const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      maxLength: 30
    },
    password: {
      type: String,
      required: true
    }
  }
);

module.exports = mongoose.model('User', UserSchema);
