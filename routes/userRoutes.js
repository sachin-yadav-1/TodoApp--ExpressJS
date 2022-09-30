const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/').post(userController.createUser).get(userController.searchUsers).patch(userController.updateUser);
router.route('/:id').get(userController.getUserById).delete(userController.hardDeleteUser);
router.route('/soft/:id').delete(userController.softDeleteUser);

module.exports = router;
