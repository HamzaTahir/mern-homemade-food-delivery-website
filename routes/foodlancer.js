const express = require('express');
const router = express('Router');

const {foodlancerrequireSignin, isAuth, isAdmin, isFoodlancerAuth, isFoodlancer, contact} = require('../controllers/auth');
const {foodlancerById, read, update, listKitchen, readFoodlancersOrdersInformation, photo} = require('../controllers/foodlancer');
const {foodlancerListOrders, getStatusValues, updateOrderStatus, orderByStatus, foodlancerListOrdersByOrderStatus} = require('../controllers/order');
const {create} = require('../controllers/product');
// const {update} = require('../controllers/foodlancer');

router.get('/secret/:foodlancerId', foodlancerrequireSignin, isAuth, isAdmin, (req, res)=>{
    res.json({
        foodlancer:req.profile
    })
})
router.get('/foodlancer/:foodlancerId', foodlancerrequireSignin, isFoodlancerAuth, isFoodlancer, read);
router.put('/foodlancer/update/:foodlancerId', foodlancerrequireSignin, update);
router.get('/kitchens', listKitchen); 
// router.put('/foodlancer/:foodlancerId', foodlancerrequireSignin, isFoodlancerAuth, update);
router.get('/foodlancer/order/list/:foodlancerId', foodlancerrequireSignin, isFoodlancerAuth, isFoodlancer, foodlancerListOrders);
router.get('/foodlancer/order/list/:foodlancerId/:orderStatus', foodlancerrequireSignin, isFoodlancerAuth, isFoodlancer, foodlancerListOrdersByOrderStatus);
router.get('/foodlancer/order/status-values/:foodlancerId', foodlancerrequireSignin, isFoodlancerAuth, isFoodlancer, getStatusValues);
router.post('/foodlancer/product/create/:foodlancerId',foodlancerrequireSignin, isFoodlancerAuth, isFoodlancer, create);
router.put('/foodlancer/order/:orderId/status/:foodlancerId', foodlancerrequireSignin, isFoodlancerAuth, isFoodlancer, updateOrderStatus);
router.get('/foodlancer/orders/information/:foodlancerId', foodlancerrequireSignin, isFoodlancerAuth, isFoodlancer, readFoodlancersOrdersInformation);
router.post('/foodlancer/contact', contact);
router.get('/foodlancer/kitchen/photo/:foodlancerId', photo);

router.param('foodlancerId', foodlancerById)
router.param('orderStatus', orderByStatus)


module.exports = router;
