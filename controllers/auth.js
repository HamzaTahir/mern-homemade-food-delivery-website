const User = require('../models/foodie');
const Foodlancer = require('../models/foodlancer');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); //for authorization check

//

// if any mongo error try to change err to error

//
const {errorJandler, errorHandler} = require('../helpers/dbErrorHandler');

exports.signup = (req, res)=>{
    console.log('req.body: ',req.body);
    const user = new User(req.body);
    user.save((err, user)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined; 
        res.json({
            user
        });
    })
};


exports.signin = (req, res)=>{
    // find user based on email
    const {email,password} = req.body;
    User.findOne({email}, (err, user)=>{
        if(err || !user ){
            return res.status(400).json({
                error:'User with this email does not exist. Please Create Account. '
            })
        }
        // if user is found make sure the email and password is matched
        // create authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Password is not Matched'
            })
        }

        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)

        // persist the token as 't' in cookie with expiry date

        res.cookie('t',token,{expire:new Date() + 9999})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})



    })  

};

exports.signout = (req, res) =>{
    res.clearCookie('t');
    res.json({message:'Sign Out Success'});
};

exports.requireSignin = expressJwt({
    secret: 'aswqejlktyuzxcasd',
    algorithms: ["HS256"], // added later
    userProperty: "auth",
  });

exports.isAuth = (req, res, next)=>{
    // let user = req.profile.role && req.auth && req.profile._id == req.auth._id
    // console.log('req.profile: ' + req.profile.role);
    // console.log('req.profile: ' + req.profile);
    let user = req.profile.role === 2;
    if(!user){
        return res.status(400).json({
            error:'Access Denied 1'
        })
    }
    next();

}
exports.isUserAuth = (req, res, next)=>{
    // let user = req.profile.role && req.auth && req.profile._id == req.auth._id
    // console.log('req.profile: ' + req.profile.role);
    // console.log('req.auth: ' + req.auth._id);
    let user = req.profile.role === 0;
    if(!user){
        return res.status(400).json({
            error:'Access Denied To User'
        })
    }
    next();

}

exports.isAdmin = (req, res, next)=>{
    if(req.profile.role !== 2 ){
        return res.status(403).json({
            error:'Admin Resource! Access Denied 2'
        })
    }
    next();

}

//////////// Foodlancer Start
exports.foodlancersignup = (req, res)=>{
    console.log('req.body: ',req.body);
    const user = new Foodlancer(req.body);
    user.save((err, user)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined; 
        res.json({
            user
        });
    })
};


exports.foodlancersignin = (req, res)=>{
    // find user based on email
    const {email,password} = req.body;
    Foodlancer.findOne({email}, (err, user)=>{
        if(err || !user ){
            return res.status(400).json({
                error:'User with this email does not exist. Please Create Account. '
            })
        }
        // if user is found make sure the email and password is matched
        // create authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Password is not Matched'
            })
        }

        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)

        // persist the token as 't' in cookie with expiry date

        res.cookie('t',token,{expire:new Date() + 9999})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})



    })  

};

exports.foodlancersignout = (req, res) =>{
    res.clearCookie('t');
    res.json({message:'Sign Out Success'});
};

exports.foodlancerrequireSignin = expressJwt({
    secret: 'aswqejlktyuzxcasd',
    algorithms: ["HS256"], // added later
    userProperty: "auth",
  });

// exports.foodlancerisAuth = (req, res, next)=>{
//     let user = req.profile && req.auth && req.profile._id == req.auth._id
//     // console.log('req.auth: ' + req.auth._id);
//     if(!user){
//         return res.status(400).json({
//             error:'Access Denied 3'
//         })
//     }
//     next();

// }

// exports.foodlancerisAdmin = (req, res, next)=>{
//     if(req.profile.role === 0 ){
//         return res.status(403).json({
//             error:'Admin Resource! Access Denied 4'
//         })
//     }
//     next();

// }
//////////// Foodlancer End
//////////// Admin Start

exports.adminsignup = (req, res)=>{
    console.log('req.body: ',req.body);
    const user = new Admin(req.body);
    user.save((err, user)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined; 
        res.json({
            user
        });
    })
};


exports.adminsignin = (req, res)=>{
    // find user based on email
    const {email,password} = req.body;
    Admin.findOne({email}, (err, user)=>{
        if(err || !user ){
            return res.status(400).json({
                error:'User with this email does not exist. Please Create Account. '
            })
        }
        // if user is found make sure the email and password is matched
        // create authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Password is not Matched'
            })
        }

        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)

        // persist the token as 't' in cookie with expiry date

        res.cookie('t',token,{expire:new Date() + 9999})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})



    })  

};

exports.adminsignout = (req, res) =>{
    res.clearCookie('t');
    res.json({message:'Sign Out Success'});
};

exports.adminrequireSignin = expressJwt({
    secret: 'aswqejlktyuzxcasd',
    algorithms: ["HS256"], // added later
    userProperty: "auth",
  });

// exports.adminisAuth = (req, res, next)=>{
//     let user = req.profile && req.auth && req.profile._id == req.auth._id
//     // console.log('req.auth: ' + req.auth._id);
//     if(!user){
//         return res.status(400).json({
//             error:'Access Denied 5'
//         })
//     }
//     next();

// }

// exports.adminisAdmin = (req, res, next)=>{
//     if(req.profile.role === 0 ){
//         return res.status(403).json({
//             error:'Admin Resource! Access Denied 6'
//         })
//     }
//     next();

// }


//////////// Admin End