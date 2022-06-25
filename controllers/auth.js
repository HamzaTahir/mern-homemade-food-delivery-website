const User = require('../models/foodie');
const Foodlancer = require('../models/foodlancer');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); //for authorization check
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox50919f5392cb4c57a39995c50b766d1b.mailgun.org';
const api_key = 'ddddfa8d54ae0fcd0df456291bb5c91d-4879ff27-10a3e8b0';
const mg = mailgun({apiKey: api_key, domain: DOMAIN});
const Contact = require('../models/contact');
const { last } = require('lodash');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');


// if any mongo error try to change err to error

//
const {errorJandler, errorHandler} = require('../helpers/dbErrorHandler');
const foodie = require('../models/foodie');
const { response } = require('express');

exports.signup = (req, res)=>{
    // console.log('req.body: ',req.body);
    // const user = new User(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email},(err, user)=>{
        if(err || user){
            return res.status(400).json({
                error: 'User Exist with this Email.'
            })
        }
        else{
            
            
            
            // console.log(user)
            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_ACCOUNT_ACTIVATE, {expiresIn: '20m'})
            // res.cookie('t',token,{expire:new Date() + 9999})

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Email Activation Link',
                html: `
                    <h2>Click Here to Activate your email.</h2>
                    <p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                }
            });
        }
    })

};
exports.token = (req, res, next, id)=>{
    req.token = id
    next();
};
exports.activateAccount = (req, res)=>{
    const token = req.token;
    // console.log("TOKEN :: " +  req.body);
    if(token !== undefined){
        jwt.verify(token, process.env.JWT_SECRET_ACCOUNT_ACTIVATE, function(err, decodeToken){
            if(err){
                return res.json({
                    error: 'Incorrect Or Expired Link.'
                })
            }
            else{
                // console.log("decodeToken :: " + decodeToken.email);
                const  {name, email, password} = jwt.decode(token);
                const user = new User({
                    name, 
                    email, 
                    password
                })
                // console.log("PASSWORD :: " + password);
                // const user = new User(token);
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
            }
        })
    }
    else{   
        return res.json({message: 'Something went Wrong.'})
    }
    
}

exports.forgetPassword = (req, res)=>{
    // console.log('req.body: ',req.body);
    // const user = new User(req.body);
    const email = req.body.email;
    // console.log('req.body: ',req.body);

    User.findOne({email},(err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: 'User Does Not Exist with this Email.'
            })
        }
        else{
            // console.log(user)
            const email = user.email;
            const name = user.name;
            const password = user.hashed_password;
            // console.log(email + " " + name + " " + password);

            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_FORGET_PASSWORD, {expiresIn: '20m'})
            // res.cookie('t',token,{expire:new Date() + 9999})

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Foodie Password Reset Link',
                html: `
                    <h2>Click Here to Reset your email.</h2>
                    <p>${process.env.CLIENT_URL}/authentication/reset/password/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Reset Your Password'})
                }
            });
        }
    })

};

exports.resetPassword = (req, res)=>{
    const {token, password} = req.body;
    // const password = req.body.password;
    // console.log("TOKEN :: " +  password);
    if(token !== undefined){
        jwt.verify(token, process.env.JWT_SECRET_FORGET_PASSWORD, function(err, decodeToken){
            if(err){
                return res.json({
                    error: 'Incorrect Or Expired Link.'
                })
            }
            else{
                // console.log("decodeToken :: " + decodeToken.email);
                const  {email} = jwt.decode(token);
                // this._password = password
                // password = encryptPassword(password)
                let salt = uuidv1()
                let hash_password = crypto.createHmac('sha1', salt)
                         .update(password)
                         .digest('hex');
                // console.log("Hash Password :: " + hash_password);
                // console.log("SALT :: " + salt);
                User.findOneAndUpdate({email:email},{hashed_password:hash_password, salt: salt}, {$new: true},(err, user)=>{
                    if(err){
                        return res.status(400).json({
                            error:'You are not Authorized to perform this action'
                        })
                    }
                    user.hash_password = undefined;
                    user.salt = undefined;
                    // console.log(user);
                    res.json(user)
                })
            }
        })
    }
    else{   
        return res.json({message: 'Something went Wrong.'})
    }
    
}
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
        // res.cookie('t',token,{expire: '20m'})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})



    })  

};

exports.facebookLogin = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    let password = email + process.env.JWT_SECRET_FACEBOOK_PASSWORD + name;
    // console.log(name + " " + email)
    User.findOne({email}, (err, user)=>{
        if(err || !user ){
            return res.status(400).json({
                error:'User with this email does not exist. Please Create Account.'
            })
        }
        // if user is found make sure the email and password is matched
        // create authenticate method in user model
        // user.password = password;
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Password is not Matched'
            })
        }

        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)

        // persist the token as 't' in cookie with expiry date

        res.cookie('t',token,{expire:new Date() + 9999})
        // res.cookie('t',token,{expire: '20m'})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})
    })  

};

exports.facebookSignup = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    // console.log(email)

    User.findOne({email},(err, user)=>{
        if(err || user){
            return res.status(400).json({
                error: 'User Exist with this Email.'
            })
        }
        else{
            // console.log(user)
            let password = email + process.env.JWT_SECRET_FACEBOOK_PASSWORD + name;
            // password = jwt.sign({password},process.env.JWT_SECRET_FACEBOOK_PASSWORD, {expiresIn: '20m'})

            // console.log("PASS :: " + temp_pass)

            // const password = jwt.sign({temp_pass}, process.env.JWT_SECRET_FACEBOOK_LOGIN, {expiresIn:'20m'})
            // console.log("PASSWORD :: " + password)

            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_ACCOUNT_ACTIVATE, {expiresIn: '20m'})
            // console.log("TOKEN :: " + token)

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Email Activation Link',
                html: `
                    <h2>Click Here to Activate your email.</h2>
                    <p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.status(400).json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                }
            });
        }
    })

};
// google
exports.googleLogin = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    let password = email + process.env.JWT_SECRET_GOOGLE_PASSWORD + name;
    // console.log(name + " " + email)
    User.findOne({email}, (err, user)=>{
        if(err || !user ){
            return res.status(400).json({
                error:'User with this email does not exist. Please Create Account.'
            })
        }
        // if user is found make sure the email and password is matched
        // create authenticate method in user model
        // user.password = password;
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Password is not Matched'
            })
        }

        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)

        // persist the token as 't' in cookie with expiry date

        res.cookie('t',token,{expire:new Date() + 9999})
        // res.cookie('t',token,{expire: '20m'})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})
    })  

};

exports.googleSignup = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    // console.log(email)

    User.findOne({email},(err, user)=>{
        if(err || user){
            return res.status(400).json({
                error: 'User Exist with this Email.'
            })
        }
        else{
            // console.log(user)
            let password = email + process.env.JWT_SECRET_GOOGLE_PASSWORD + name;
            // password = jwt.sign({password},process.env.JWT_SECRET_FACEBOOK_PASSWORD, {expiresIn: '20m'})

            // console.log("PASS :: " + temp_pass)

            // const password = jwt.sign({temp_pass}, process.env.JWT_SECRET_FACEBOOK_LOGIN, {expiresIn:'20m'})
            console.log("PASSWORD :: " + password)

            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_ACCOUNT_ACTIVATE, {expiresIn: '20m'})
            // console.log("TOKEN :: " + token)

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Email Activation Link',
                html: `
                    <h2>Click Here to Activate your email.</h2>
                    <p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.status(400).json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                }
            });
        }
    })

};
// admin
exports.adminFacebookLogin = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    let password = email + process.env.JWT_SECRET_FACEBOOK_PASSWORD + name;
    // console.log(name + " " + email)
    Admin.findOne({email}, (err, user)=>{
        if(err || !user ){
            return res.status(400).json({
                error:'Admin with this email does not exist. Please Create Account.'
            })
        }
        // if user is found make sure the email and password is matched
        // create authenticate method in user model
        // user.password = password;
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Password is not Matched'
            })
        }

        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)

        // persist the token as 't' in cookie with expiry date

        res.cookie('t',token,{expire:new Date() + 9999})
        // res.cookie('t',token,{expire: '20m'})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})
    })  

};

exports.adminFacebookSignup = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    // console.log(email)

    Admin.findOne({email},(err, user)=>{
        if(err || user){
            return res.status(400).json({
                error: 'Admin Exist with this Email.'
            })
        }
        else{
            // console.log(user)
            let password = email + process.env.JWT_SECRET_FACEBOOK_PASSWORD + name;
            // password = jwt.sign({password},process.env.JWT_SECRET_FACEBOOK_PASSWORD, {expiresIn: '20m'})

            // console.log("PASS :: " + temp_pass)

            // const password = jwt.sign({temp_pass}, process.env.JWT_SECRET_FACEBOOK_LOGIN, {expiresIn:'20m'})
            // console.log("PASSWORD :: " + password)

            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_ACCOUNT_ACTIVATE, {expiresIn: '20m'})
            // console.log("TOKEN :: " + token)

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Admin Email Activation Link',
                html: `
                    <h2>Click Here to Activate your email.</h2>
                    <p>${process.env.CLIENT_URL}/admin/authentication/activate/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.status(400).json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                }
            });
        }
    })

};
// google
exports.adminGoogleLogin = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    let password = email + process.env.JWT_SECRET_GOOGLE_PASSWORD + name;
    // console.log(name + " " + email)
    Admin.findOne({email}, (err, user)=>{
        if(err || !user ){
            return res.status(400).json({
                error:'Admin with this email does not exist. Please Create Account.'
            })
        }
        // if user is found make sure the email and password is matched
        // create authenticate method in user model
        // user.password = password;
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Password is not Matched'
            })
        }

        // generate a signed token with user id and secret

        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)

        // persist the token as 't' in cookie with expiry date

        res.cookie('t',token,{expire:new Date() + 9999})
        // res.cookie('t',token,{expire: '20m'})

        // return response with user and token to frontend client
        const {_id, name, email, role} = user
        return res.json({token, user:{_id, email, name, role}})
    })  

};

exports.adminGoogleSignup = (req, res)=>{
    // find user based on email
    const {name, email} = req.body;
    // console.log(email)

    Admin.findOne({email},(err, user)=>{
        if(err || user){
            return res.status(400).json({
                error: 'Admin Exist with this Email.'
            })
        }
        else{
            // console.log(user)
            let password = email + process.env.JWT_SECRET_GOOGLE_PASSWORD + name;
            // password = jwt.sign({password},process.env.JWT_SECRET_FACEBOOK_PASSWORD, {expiresIn: '20m'})

            // console.log("PASS :: " + temp_pass)

            // const password = jwt.sign({temp_pass}, process.env.JWT_SECRET_FACEBOOK_LOGIN, {expiresIn:'20m'})
            // console.log("PASSWORD :: " + password)

            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_ACCOUNT_ACTIVATE, {expiresIn: '20m'})
            // console.log("TOKEN :: " + token)

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Email Activation Link',
                html: `
                    <h2>Click Here to Activate your email.</h2>
                    <p>${process.env.CLIENT_URL}/admin/authentication/activate/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.status(400).json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                }
            });
        }
    })

};
exports.adminActivateAccount = (req, res)=>{
    const token = req.token;
    // console.log("TOKEN :: " +  req.body);
    if(token !== undefined){
        jwt.verify(token, process.env.JWT_SECRET_ACCOUNT_ACTIVATE, function(err, decodeToken){
            if(err){
                return res.json({
                    error: 'Incorrect Or Expired Link.'
                })
            }
            else{
                // console.log("decodeToken :: " + decodeToken.email);
                const  {name, email, password} = jwt.decode(token);
                const user = new Admin({
                    name, 
                    email, 
                    password
                })
                // console.log("PASSWORD :: " + password);
                // const user = new User(token);
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
            }
        })
    }
    else{   
        return res.json({message: 'Something went Wrong.'})
    }
    
}

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
    // let user = req.profile.role && req.auth && req.profile.role !== null
    // console.log('req.profile: ' + req.profile.role);
    // console.log('req.auth: ' + req.auth._id);
    // let user = req.profile.role === 0;
    if(!req.profile){
        return res.status(400).json({
            // error:'Access Denied To User'
            error:'Kindly Login First'
        })
    }
    next();

}
exports.isFoodlancerAuth = (req, res, next)=>{
    // let user = req.profile.role && req.auth && req.profile._id == req.auth._id
    // console.log('req.profile: ' + req.profile.role);
    // console.log('req.auth: ' + req.auth._id);
    let user = req.profile.role === 1;
    if(!user){
        return res.status(400).json({
            error:'Access Denied To Foodlancer'
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
        
        let form = new formidable.IncomingForm()
        form.keepExtensions = true
        form.parse(req, (err, fields, files)=>{
 
         // check for all fields
         const {name, email, password, photo} = fields;
         if(!name || !email || !password){
             return res.status(400).json({
                 error:'All fields are required'
             })
         }
         else{
             
                console.log(name + " " + email + " " + password)
                let foodlancer = new Foodlancer(fields)
            
                // 1kb = 1000
                // 1mb = 1000000
                // 2mb = 2000000
                if(files.photo){
                    // console.log('Photo Files :' + files.photo.size)
                    if(files.photo.size > 2000000){
                        return res.status(400).json({
                            error:'Image cannot greater than 2MB'
                        })
                    }
                    foodlancer.photo.data = fs.readFileSync(files.photo.path)
                    foodlancer.photo.contentType = files.photo.type
                }
                
                // const user = new Foodlancer(req.body);
                foodlancer.save((err, user)=>{
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
         }
    })  
};

exports.isFoodlancer = (req, res, next)=>{
    if(req.profile.role !== 1 ){
        return res.status(403).json({
            error:'Foodlancer Resource! Access Denied 2'
        })
    }
    next();

}


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


exports.contact = (req, res)=>{
    const contact = new Contact(req.body)
    // console.log("contact: ", contact);
    let role = ''
    contact.save((error, data)=>{
        if(error){
            return res.status(400).json({
                error: error
            });
        }
        else{
            if(req.body.role === 0){
                role = "Foodie"
            }
            else if(req.body.role === 1){
                role = "Foodlancer"
            }
            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: 'sulemanhamzatahir@gmail.com',
                subject: `KHANSAMA ${role} Contact`,
                html: `
                    <h2>${role} Information</h2>
                    <h4>${role} Name: ${contact.name}</h4>
                    <h4>${role} Email: ${contact.email}</h4>
                    <div>${role} Query: ${contact.query}</div>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.json({
                        error: error.message
                    })
                }
                else{
                    // console.log(body);
                    // res.json(data)
                    return res.json({message: 'Query Has Been Sent. We will Contact you as soon as possible.'})
                }
            });
        }
    });
};

// foodlancer forget/reset password


exports.foodlancerForgetPassword = (req, res)=>{
    // console.log('req.body: ',req.body);
    // const user = new User(req.body);
    const email = req.body.email;
    // console.log('req.body: ',req.body);

    Foodlancer.findOne({email},(err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: 'Foodlancer Does Not Exist with this Email.'
            })
        }
        else{
            // console.log(user)
            const email = user.email;
            const name = user.name;
            const password = user.hashed_password;
            // console.log(email + " " + name + " " + password);

            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_FORGET_PASSWORD, {expiresIn: '20m'})
            // res.cookie('t',token,{expire:new Date() + 9999})

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Foodlancer Password Reset Link',
                html: `
                    <h2>Click Here to Reset your email.</h2>
                    <p>${process.env.CLIENT_URL}/foodlancer/authentication/reset/password/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Reset Your Password'})
                }
            });
        }
    })

};

exports.foodlancerResetPassword = (req, res)=>{
    const {token, password} = req.body;
    // const password = req.body.password;
    // console.log("TOKEN :: " +  password);
    if(token !== undefined){
        jwt.verify(token, process.env.JWT_SECRET_FORGET_PASSWORD, function(err, decodeToken){
            if(err){
                return res.json({
                    error: 'Incorrect Or Expired Link.'
                })
            }
            else{
                // console.log("decodeToken :: " + decodeToken.email);
                const  {email} = jwt.decode(token);
                // this._password = password
                // password = encryptPassword(password)
                let salt = uuidv1()
                let hash_password = crypto.createHmac('sha1', salt)
                         .update(password)
                         .digest('hex');
                // console.log("Hash Password :: " + hash_password);
                // console.log("SALT :: " + salt);
                Foodlancer.findOneAndUpdate({email:email},{hashed_password:hash_password, salt: salt}, {$new: true},(err, user)=>{
                    if(err){
                        return res.status(400).json({
                            error:'You are not Authorized to perform this action'
                        })
                    }
                    user.hash_password = undefined;
                    user.salt = undefined;
                    // console.log(user);
                    res.json(user)
                })
            }
        })
    }
    else{   
        return res.json({message: 'Something went Wrong.'})
    }
    
}

// admin forget/reset password


exports.adminForgetPassword = (req, res)=>{
    // console.log('req.body: ',req.body);
    // const user = new User(req.body);
    const email = req.body.email;
    // console.log('req.body: ',req.body);

    Admin.findOne({email},(err, user)=>{
        if(err || !user){
            return res.status(400).json({
                error: 'Admin Does Not Exist with this Email.'
            })
        }
        else{
            // console.log(user)
            const email = user.email;
            const name = user.name;
            const password = user.hashed_password;
            // console.log(email + " " + name + " " + password);

            const token = jwt.sign({name, email, password},process.env.JWT_SECRET_FORGET_PASSWORD, {expiresIn: '20m'})
            // res.cookie('t',token,{expire:new Date() + 9999})

            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: email,
                subject: 'Admin Password Reset Link',
                html: `
                    <h2>Click Here to Reset your email.</h2>
                    <p>${process.env.CLIENT_URL}/admin/authentication/reset/password/${token}</p>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    return res.json({
                        error: error.message
                    })
                }
                else{
                    console.log(body);
                    return res.json({message: 'Email Has Been Sent, Kindly Reset Your Password'})
                }
            });
        }
    })

};

exports.adminResetPassword = (req, res)=>{
    const {token, password} = req.body;
    // const password = req.body.password;
    // console.log("TOKEN :: " +  password);
    if(token !== undefined){
        jwt.verify(token, process.env.JWT_SECRET_FORGET_PASSWORD, function(err, decodeToken){
            if(err){
                return res.json({
                    error: 'Incorrect Or Expired Link.'
                })
            }
            else{
                // console.log("decodeToken :: " + decodeToken.email);
                const  {email} = jwt.decode(token);
                // this._password = password
                // password = encryptPassword(password)
                let salt = uuidv1()
                let hash_password = crypto.createHmac('sha1', salt)
                         .update(password)
                         .digest('hex');
                // console.log("Hash Password :: " + hash_password);
                // console.log("SALT :: " + salt);
                Admin.findOneAndUpdate({email:email},{hashed_password:hash_password, salt: salt}, {$new: true},(err, user)=>{
                    if(err){
                        return res.status(400).json({
                            error:'You are not Authorized to perform this action'
                        })
                    }
                    user.hash_password = undefined;
                    user.salt = undefined;
                    // console.log(user);
                    res.json(user)
                })
            }
        })
    }
    else{   
        return res.json({message: 'Something went Wrong.'})
    }
    
}
