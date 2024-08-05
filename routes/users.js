const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const userController = require('../controllers/users');


router.route('/register')
    .get(userController.register)
    .post(catchAsync(userController.registerPost));

router.route('/login')
    .get(userController.login)
    .post(
        // use the storeReturnTo middleware to save the returnTo value from session to res.locals
        storeReturnTo,
        // passport.authenticate logs the user in and clears req.session
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        // Now we can use res.locals.returnTo to redirect the user after login
        userController.loginPost
    );

router.get('/logout', userController.logout)

module.exports = router;