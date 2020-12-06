const express = require('express');
const router = express('Router');
const {create, productById, read, remove, update, list, listRelated, listCategories, listBySearch, photo, listSearch} = require('../controllers/product');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {adminById} = require('../controllers/admin');

// product get
router.get('/product/:productId',read);

router.post('/product/create/:adminId',requireSignin, isAuth, isAdmin, create);
router.delete('/product/:productId/:adminId',requireSignin, isAuth, isAdmin, remove);
router.put('/product/:productId/:adminId',requireSignin, isAuth, isAdmin, update);
router.get('/products', list);
router.get("/products/search", listSearch);
router.get('/products/related/:productId', listRelated);
router.get('/products/categories', listCategories);
router.post("/products/by/search", listBySearch);
router.get('/product/photo/:productId', photo);


router.param('adminId',adminById)
router.param('productId',productById)





module.exports = router;
