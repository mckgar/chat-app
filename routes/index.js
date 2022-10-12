const express = require('express');
const router = express.Router();

const chatRoute = require('./chat');
const userRoute = require('./user');
const loginRoute = require('./login');

router.get('/', (req, res, next) => {
  res.send("Under construction");
});

router.use('/user', userRoute);

router.use('/login', loginRoute);

router.use('/chat', chatRoute);

module.exports = router;
