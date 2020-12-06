const express = require('express');
const router = express('Router');

const {adminrequireSignin, isAuth, isAdmin} = require('../controllers/auth');

const {adminById} = require('../controllers/admin');

router.get('/secret/:adminId', adminrequireSignin, isAuth, isAdmin, (req, res)=>{
    res.json({
        admin:req.profile
    })
})
// router.get('/user/:userId', requireSignin, isAuth, read);
// router.put('/user/:userId', requireSignin, isAuth, update);

router.param('adminId',adminById)


module.exports = router;
