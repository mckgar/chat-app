const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.create_user = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username is required')
    .escape()
    .custom(async value => {
      try {
        const search = await User.find({ username: value });
        if (search.length > 0) {
          return Promise.reject('Username is already in use');
        }
      } catch (err) {
        return Promise.reject('An error has occured');
      }
    }),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be length 8 or greater')
    .escape(),
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
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      new User(
        {
          username: req.body.username,
          password: hashedPassword
        }
      ).save();
      const payload = {
        username: req.body.username
      };
      const opts = {};
      opts.expiresIn = 600;
      const token = jwt.sign(payload, process.env.JWT_SECRET, opts);
      res.status(201).json(
        {
          token
        }
      );
      return;
    } catch (err) {
      next(err);
    }
  }
];
