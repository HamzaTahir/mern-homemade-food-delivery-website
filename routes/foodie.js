const express = require('express');
const router = express('Router');

const {requireSignin, isUserAuth, isAdmin} = require('../controllers/auth');

const {foodieById, read, update, purchaseHistory} = require('../controllers/foodie');
const {listOrders} = require('../controllers/order')
router.get('/secret/:foodieId', requireSignin, isUserAuth, isAdmin, (req, res)=>{
    res.json({
        foodie:req.profile
    })
})
router.get('/foodie/:foodieId', requireSignin, isUserAuth, read);
router.put('/foodie/:foodieId', requireSignin, isUserAuth, update);
router.get('/orders/by/foodie/:foodieId', requireSignin, isUserAuth, purchaseHistory);

router.param('foodieId',foodieById)


module.exports = router;
