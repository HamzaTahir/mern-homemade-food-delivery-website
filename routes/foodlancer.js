const express = require('express');
const router = express('Router');

const {foodlancerrequireSignin, isAuth, isAdmin} = require('../controllers/auth');

const {foodlancerById} = require('../controllers/foodlancer');

router.get('/secret/:foodlancerId', foodlancerrequireSignin, isAuth, isAdmin, (req, res)=>{
    res.json({
        foodlancer:req.profile
    })
})
// router.get('/user/:userId', requireSignin, isAuth, read);
// router.put('/user/:userId', requireSignin, isAuth, update);

router.param('foodlancerId',foodlancerById)


module.exports = router;
