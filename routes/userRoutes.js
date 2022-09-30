const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/soft/:id').delete(authController.protected, userController.softDeleteUser);

// 'ADMIN' & 'SUPERADMIN' only routes
router.use(authController.protected, authController.restrictRouteTo('ADMIN', 'SUPERADMIN'));
router.route('/').post(userController.createUser).get(userController.searchUsers).patch(userController.updateUser);
router.route('/:id').get(userController.getUserById).delete(userController.hardDeleteUser);

module.exports = router;
