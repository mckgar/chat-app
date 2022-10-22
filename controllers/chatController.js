const Chat = require('../models/chat');
const User = require('../models/user');
const Message = require('../models/message');
const { body, param, validationResult } = require('express-validator');
const passport = require('passport');
const { default: mongoose } = require('mongoose');
require('../passport');

exports.get_all_chats = [
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
    .isLength({ max: 20 }).withMessage('Username is invalid')
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


exports.get_chat = [
  passport.authenticate('jwt', { session: false }),
  param('chatid')
    .trim()
    .escape(),
  async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatid)) {
      next();
      return;
    }
    try {
      const chat = await Chat.findById(req.params.chatid).populate('messages');
      if (chat) {
        let participant = false;
        for (const chatter of chat.users) {
          if (chatter === req.user.username) {
            participant = true;
            break;
          }
        }
        if (!participant) {
          res.sendStatus(403);
          return;
        }
        res.status(200).json(
          {
            chat
          }
        );
        return;
      }
      next();
      return;
    } catch (err) {
      next(err);
    }
  }
];

exports.send_message = [
  passport.authenticate('jwt', { session: false }),
  param('chatid')
    .trim()
    .escape(),
  body('message')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message content required')
    .escape()
    .isLength({ max: 500 })
    .withMessage('Message content too long'),
  async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatid)) {
      next();
      return;
    }
    try {
      const chat = await Chat.findById(req.params.chatid);
      if (chat) {
        let participant = false;
        for (const chatter of chat.users) {
          if (chatter === req.user.username) {
            participant = true;
            break;
          }
        }
        if (!participant) {
          res.sendStatus(403);
          return;
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json(
            {
              errors: errors.array()
            }
          );
          return;
        }
        const message = await new Message(
          {
            content: req.body.message,
            author: req.user.username
          }
        ).save();
        await chat.updateOne(
          { $push: { messages: message._id } }
        );
        res.sendStatus(201);
        return;
      }
      next();
      return;
    } catch (err) {
      next(err);
    }
  }
];

exports.leave_chat = [
  passport.authenticate('jwt', { session: false }),
  param('chatid')
    .trim()
    .escape(),
  async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatid)) {
      next();
      return;
    }
    try {
      const chat = await Chat.findById(req.params.chatid);
      if (chat) {
        let participant = false;
        for (const chatter of chat.users) {
          if (chatter === req.user.username) {
            participant = true;
            break;
          }
        }
        if (!participant) {
          res.sendStatus(403);
          return;
        }
        await chat.updateOne({ $pull: { users: req.user.username } });
        if (chat.users.length === 1) {
          for (const message of chat.messages) {
            await Message.deleteOne({ _id: message });
          }
          await Chat.findByIdAndDelete(req.params.chatid);
        }
        res.sendStatus(200);
        return;
      }
      next();
      return;
    } catch (err) {
      next();
    }
  }
];
