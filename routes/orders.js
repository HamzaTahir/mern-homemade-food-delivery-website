const express = require('express');
const router = express('Router');
const {requireSignin, isAuth, isAdmin, isUserAuth, isFoodlancerAuth, isFoodlancer} = require('../controllers/auth');
// const {adminById} = require('../controllers/admin');
const {foodieById,addOrderToFoodieHistory} = require('../controllers/foodie');
const {foodlancerById} = require('../controllers/foodlancer');
const {adminById} = require('../controllers/admin');
const {create, listOrders, getStatusValues, orderById, updateOrderStatus} = require('../controllers/order');
const {read2} = require('../controllers/order');

router.get('/order/list/:adminId', requireSignin, isAuth, isAdmin, listOrders);
router.get('/order/status-values/:adminId', requireSignin, isAuth, isAdmin, getStatusValues);
router.put('/order/:orderId/status/:adminId', requireSignin, isAuth, isAdmin, updateOrderStatus);

router.post('/order/create/:foodieId', requireSignin, isUserAuth, addOrderToFoodieHistory, create);
router.post('/order/eta/:orderId/:foodieId', requireSignin, read2);


router.param('adminId', adminById);
router.param('foodieId', foodieById);

router.param('orderId', orderById);


module.exports = router