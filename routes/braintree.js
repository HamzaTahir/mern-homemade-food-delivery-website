const express = require('express');
const router = express('Router');
const {requireSignin, isUserAuth} = require('../controllers/auth');
const {foodieById} = require('../controllers/foodie');
const {generateToken, processPayment} = require('../controllers/braintree');

router.get('/braintree/getToken/:foodieId', requireSignin, isUserAuth, generateToken);
router.post('/braintree/payment/:foodieId', requireSignin, isUserAuth, processPayment);



router.param('foodieId', foodieById);


module.exports = router