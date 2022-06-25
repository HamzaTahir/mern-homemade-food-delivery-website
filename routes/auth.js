const express = require('express');
const router = express.Router();

const {
        signup, signin, signout, requireSignin, 
        foodlancersignin, foodlancersignup, foodlancersignout, foodlancerrequireSignin,
        adminsignup, adminsignin, adminsignout, adminrequireSignin, activateAccount, token, 
        forgetPassword, resetPassword, facebookLogin, facebookSignup, googleLogin, googleSignup
        ,foodlancerForgetPassword, foodlancerResetPassword, adminForgetPassword, adminResetPassword,
        adminFacebookLogin, adminFacebookSignup, adminGoogleLogin, adminGoogleSignup,
        adminActivateAccount} = require("../controllers/auth");
const {foodieSignupValidator} = require("../validator");

// foodie routes auth start
router.post('/signin', signin);
router.post('/signup', foodieSignupValidator, signup);
router.get('/signout', signout);

router.post('/googlelogin', googleLogin);
router.post('/googlesignup', googleSignup);

router.post('/facebooklogin', facebookLogin);
router.post('/facebooksignup', facebookSignup);

router.post('/email-activate/:token', activateAccount);


router.post('/admin/googlelogin', adminGoogleLogin);
router.post('/admin/googlesignup', adminGoogleSignup);

router.post('/admin/facebooklogin', adminFacebookLogin);
router.post('/admin/facebooksignup', adminFacebookSignup);

router.post('/admin/email-activate/:token', adminActivateAccount);


router.post('/forget/password', forgetPassword);
router.post('/reset/password', resetPassword);

router.post('/foodlancer/forget/password', foodlancerForgetPassword);
router.post('/foodlancer/reset/password', foodlancerResetPassword);

router.post('/admin/forget/password', adminForgetPassword);
router.post('/admin/reset/password', adminResetPassword);

router.param('token',token)

// foodie routes auth end

// foodlancer routes auth start

router.post('/foodlancer/signup', foodlancersignup);
// router.post('/foodlancer/signup', foodieSignupValidator, foodlancersignup);
router.post('/foodlancer/signin', foodlancersignin);
router.get('/foodlancer/signout', foodlancersignout);

// foodlancer routes auth end

// admin routes auth start

router.post('/admin/signup', foodieSignupValidator, adminsignup);
router.post('/admin/signin', adminsignin);
router.get('/admin/signout', adminsignout);

// admin routes auth end

module.exports = router;