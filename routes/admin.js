const express = require('express');
const router = express('Router');

const {adminrequireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {listFoodies, listFoodlancers, removeFoodie, updateFoodie, removeFoodlancer, updateFoodlancer, readFoodlancer, readFoodie, listAdmins, read, removeAdmin, updateAdmin} = require('../controllers/admin');
const {adminById} = require('../controllers/admin');
const {foodieById2} = require('../controllers/foodie');
const {foodlancerById2} = require('../controllers/foodlancer');

router.get('/secret/:adminId', adminrequireSignin, isAuth, isAdmin, (req, res)=>{
    res.json({
        admin:req.profile
    })
})

router.get('/admin/get/admin/:adminId', adminrequireSignin, read);
router.get('/admins/list/:adminId', adminrequireSignin, isAuth, isAdmin, listAdmins);
router.delete('/admin/remove/admin/:adminId', adminrequireSignin, isAuth, isAdmin, removeAdmin);
router.put('/admin/update/admin/:adminId', adminrequireSignin, updateAdmin);



router.get('/admin/get/foodlancer/:foodlancerId', adminrequireSignin, readFoodlancer);
router.get('/foodlancers/list/:adminId', adminrequireSignin, isAuth, isAdmin, listFoodlancers);
router.delete('/admin/remove/foodlancer/:adminId/:foodlancerId', adminrequireSignin, isAuth, isAdmin, removeFoodlancer);
router.put('/admin/update/foodlancer/:adminId/:foodlancerId', adminrequireSignin, updateFoodlancer);

router.get('/admin/get/foodie/:foodieId', adminrequireSignin, readFoodie);
router.get('/admin/list/foodies/:adminId', adminrequireSignin, isAuth, isAdmin, listFoodies);
router.delete('/admin/remove/foodie/:adminId/:foodieId', adminrequireSignin, isAuth, isAdmin, removeFoodie);
router.put('/admin/update/foodie/:adminId/:foodieId', adminrequireSignin, updateFoodie);

router.param('adminId',adminById)
router.param('foodieId',foodieById2) 
router.param('foodlancerId',foodlancerById2)


module.exports = router;
