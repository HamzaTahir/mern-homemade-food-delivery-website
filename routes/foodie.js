const express = require('express');
const router = express('Router');

const {requireSignin, isUserAuth, isAdmin, checkETA, contact} = require('../controllers/auth');

const {foodieById, read, read2, update, purchaseHistory, foodlancerProducts, foodlancerProfile} = require('../controllers/foodie');
const {foodlancerById} = require('../controllers/foodlancer');
const {listOrders} = require('../controllers/order');
const foodlancer = require('../models/foodlancer');
router.get('/secret/:foodieId', requireSignin, isUserAuth, isAdmin, (req, res)=>{
    res.json({
        foodie:req.profile
    })
})
router.get('/foodie/:foodieId', requireSignin, isUserAuth, read);
router.put('/foodie/update/:foodieId', requireSignin, isUserAuth, update);
router.get('/orders/by/foodie/:foodieId', requireSignin, isUserAuth, purchaseHistory);
router.get('/foodlancer/products/:foodlancerId', isUserAuth, foodlancerProducts);
router.get('/profile/foodlancer/:foodlancerId', isUserAuth, foodlancerProfile);
router.post('/foodie/contact', contact);

router.param('foodieId',foodieById)
router.param('foodlancerId',foodlancerById)
// router.param('adminId',adminById)


module.exports = router;
