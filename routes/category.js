const express = require('express');
const router = express('Router');
const {create, categoryById, read, update, remove, list} = require('../controllers/category');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {adminById} = require('../controllers/admin');

router.get('/category/:categoryId', read);
router.post('/category/create/:adminId',requireSignin, isAuth, isAdmin, create);

router.put('/category/:categoryId/:adminId',requireSignin, isAuth, isAdmin, update);
router.delete('/category/:categoryId/:adminId',requireSignin, isAuth, isAdmin, remove);
router.get('/categories', list);

router.param('categoryId',categoryById)
router.param('adminId',adminById)


module.exports = router;
