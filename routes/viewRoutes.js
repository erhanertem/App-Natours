//-->#0.IMPORT CORE MODULE
const express = require('express');

//-->#1.IMPORT CUSTOM MODULE
const viewsController = require('../controllers/viewController');

//-->#2.CREATE CHILD ROUTER
const router = express.Router();

//-->#3.DEFINE ROUTES
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//   });
// }); //Let express define (router.get()) route for '/' from which in the event of a successful response, pug will render(router.render()) file called "base" inside the specified views folder.
// IMPORTANT! router.get() vs router.use() - since all routes start with / using router.use() would ovcerride the consequent routes. For that we use router.get() to only allow for / route and not the ones starting with /.

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

//-->#4.EXPORT MODULE
module.exports = router;
