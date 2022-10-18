const Chat = require('../models/chat');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
require('../passport');

exports.get_chats = [
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const chats = await Chat.find({ users: { $in: req.user.username } });
      res.status(200).json(
        {
          chats
        }
      );
      return;
    } catch (err) {
      next(err);
    }
  }
];

exports.create_chat = [
  passport.authenticate('jwt', { session: false }),
  body('username')
    .trim()
    .isLength({ min: 1 }).withMessage('Username is required')
    .escape()
    .isLength({ max: 20}).withMessage('Username is invalid')
    .custom(async value => {
      try {
        const valid = await User.findOne({ username: value });
        if (!valid) {
          return Promise.reject(`Username ${value} does not exist`);
        }
      } catch (err) {
        console.log(err);
        return Promise.reject('Oops, an error has occured');
      }
    }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(
        {
          errors: errors.array()
        }
      );
      return;
    }
    try {
      // Search without respect to username ordering?
      const exists = await Chat.findOne({ users: [req.user.username, req.body.username] });
      const exists2 = await Chat.findOne({ users: [req.body.username, req.user.username] });
      if (exists || exists2) {
        res.status(400).json(
          {
            error: `Chat already exists`
          }
        );
        return;
      }
      const newChat = await new Chat(
        {
          users: [req.user.username, req.body.username]
        }
      ).save();
      res.status(201).json(
        {
          chatId: newChat._id
        }
      );
      return;
    } catch (err) {
      next(err);
    }
  }
];
