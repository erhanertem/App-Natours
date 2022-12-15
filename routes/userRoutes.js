//-->#0.IMPORT CORE MODULE
const express = require('express');
const multer = require('multer'); //form encoding middleware which is good at handling multi-part form data

//-->#1.IMPORT CUSTOM MODULE
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();
const upload = multer({ dest: 'public/img/users' }); //calling multer without options would have saved it into the memory - NOTE: body parser can not handle files so we need this middleware to deal with this problem

//-->#3.DEFINE ROUTES

//--->COMMON ROUTES OPEN TO EVERYONE
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword); //resetpassword with the temp passtoken

//IMPORTANT! PROTECT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.protect); //ONCE WE START USING AUTHCONTROLLER.PROTECT, IT WOULD APPLY TO ANYTHING BELOW...

//--->USER ROUTES
router.patch(
  '/updateMyPassword',
  // authController.protect,
  authController.updatePassword
); //Update password of logged in user

router.get(
  '/me',
  // authController.protect,
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  // authController.protect,
  upload.single('photo'), //single: as we have a single file to upload | name of the field that it would hold the item - CORRESPONDS TO POST-MAN>PATCH~update current user data>FORM-DATA>name/photo fields...
  userController.updateMe
); //Let the user update his own data
router.delete(
  '/deleteMe',
  // authController.protect,
  userController.deleteMe
); //Let the user delete himself

//--->ADMIN ROUTES
//IMPORTANT! ACCESS TO ALL ROUTES BELOW IS EXCLUSIVE TO ADMIN ACCESS ONLY BESIDES BEING PROTECTED
router.use(authController.restrictTo('admin'));

router
  //THIS ROUTE OPERATIONS ARE PROTECTED BY router.use(authController.protect);
  .route('/') //Instead of repeating the HTTP verb for every single route, we define a common HTTP verb from which multiple HTTP methods do share
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  //THIS ROUTE OPERATIONS ARE PROTECTED BY router.use(authController.protect);
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

//-->#4.EXPORT MODULE
module.exports = router;
