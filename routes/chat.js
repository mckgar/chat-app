const router = require('express').Router();
const chatController = require('../controllers/chatController');

router.get('/', chatController.get_all_chats);
router.post('/', chatController.create_chat);

router.get('/:chatid', chatController.get_chat);
router.post('/:chatid', chatController.send_message);
router.delete('/:chatid', chatController.leave_chat);

module.exports = router;
