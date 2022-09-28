const express = require('express');
const router = express.Router();

const chatRoute = require('./chat');

router.get('/', (req, res, next) => {
  res.send("Under construction");
});

router.use('/chat', chatRoute);

module.exports = router;
