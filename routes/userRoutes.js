//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULE
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();

//-->#3.DEFINE ROUTES

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword); //resetpassword with the temp passtoken

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
); //Update password of logged in user

router.patch('/updateMe', authController.protect, userController.updateMe); //Let the user update his own data
router.delete('/deleteMe', authController.protect, userController.deleteMe); //Let the user delete himself

router
  .route('/') //Instead of repeating the HTTP verb for every single route, we define a common HTTP verb from which multiple HTTP methods do share
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

//-->#4.EXPORT MODULE
module.exports = router;
