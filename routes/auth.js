const express = require('express');
const router = express.Router();

const {
        signup, signin, signout, requireSignin, 
        foodlancersignin, foodlancersignup, foodlancersignout, foodlancerrequireSignin,
        adminsignup, adminsignin, adminsignout, adminrequireSignin} = require("../controllers/auth");
const {foodieSignupValidator} = require("../validator");

// foodie routes auth start

router.post('/signup', foodieSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

// foodie routes auth end

// foodlancer routes auth start

router.post('/foodlancer/signup', foodieSignupValidator, foodlancersignup);
router.post('/foodlancer/signin', foodlancersignin);
router.get('/foodlancer/signout', foodlancersignout);

// foodlancer routes auth end

// admin routes auth start

router.post('/admin/signup', foodieSignupValidator, adminsignup);
router.post('/admin/signin', adminsignin);
router.get('/admin/signout', adminsignout);

// admin routes auth end

module.exports = router;