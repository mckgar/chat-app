const router = require('express').Router();
const chatController = require('../controllers/chatController');

router.get('/', chatController.get_chats);
router.post('/', chatController.create_chat);

module.exports = router;
