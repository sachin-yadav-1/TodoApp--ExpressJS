const express = require('express');
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');

const router = express.Router();

router.use(authController.protected);
router.route('/').post(itemController.createItem).get(itemController.searchItems).patch(itemController.updateItem);
router.route('/:id').get(itemController.getItemById).delete(itemController.deleteItem);

module.exports = router;
