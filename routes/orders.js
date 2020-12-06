const express = require('express');
const router = express('Router');
const {requireSignin, isAuth, isUserAuth, isAdmin} = require('../controllers/auth');
// const {adminById} = require('../controllers/admin');
const {foodieById,addOrderToFoodieHistory} = require('../controllers/foodie');
const {adminById} = require('../controllers/admin');
const {create, listOrders, getStatusValues, orderById, updateOrderStatus} = require('../controllers/order');

router.post('/order/create/:foodieId', requireSignin, isUserAuth, addOrderToFoodieHistory, create);
router.get('/order/list/:adminId', requireSignin, isAuth, isAdmin, listOrders);
router.get('/order/status-values/:adminId', requireSignin, isAuth, isAdmin, getStatusValues);
router.put('/order/:orderId/status/:adminId', requireSignin, isAuth, isAdmin, updateOrderStatus);


router.param('foodieId', foodieById);
router.param('adminId', adminById);
router.param('orderId', orderById);


module.exports = router