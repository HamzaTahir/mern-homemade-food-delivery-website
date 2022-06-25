const { errorHandler } = require('../helpers/dbErrorHandler');
const Foodie = require('../models/foodie');
const foodlancer = require('../models/foodlancer');
const order = require('../models/order');
const {Order} = require('../models/order');
const Product = require('../models/product');
const Contact = require('../models/contact');
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox50919f5392cb4c57a39995c50b766d1b.mailgun.org';
const api_key = 'ddddfa8d54ae0fcd0df456291bb5c91d-4879ff27-10a3e8b0';
const mg = mailgun({apiKey: api_key, domain: DOMAIN});

exports.foodieById = (req, res, next, id)=>{
    Foodie.findById(id).exec((err, foodie)=>{
        if(err || !Foodie){
            return res.status(400).json({
                error:'Foodie not Found'
            })
        }
        req.profile = foodie
        next();
    });
};
exports.foodieById2 = (req, res, next, id)=>{
    Foodie.findById(id).exec((err, foodie)=>{
        if(err || !Foodie){
            return res.status(400).json({
                error:'Foodie not Found'
            })
        }
        req.foodie = foodie
        next();
    });
};

exports.read = (req, res)=>{
    req.profile.hash_password = undefined;
    req.profile.salt = undefined;

    return res.json(req.profile)
};

exports.update = (req, res)=>{
    Foodie.findOneAndUpdate({_id:req.profile._id},{$set:req.body}, {$new: true},(err, Foodie)=>{
        if(err){
            return res.status(400).json({
                error:'You are not Authorized to perform this action'
            })
        }
        Foodie.hash_password = undefined;
        Foodie.salt = undefined;
        res.json(Foodie)
    })
    
};

exports.addOrderToFoodieHistory = (req, res, next)=>{
    
    let history = [];
    req.body.order.products.forEach((item)=>{
        history.push({
        _id: item._id,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.count,
        transaction_id: req.body.order.transaction_id,
        amount: req.body.order.amount
        })
    })


    Foodie.findOneAndUpdate({_id:req.profile._id},{$push:{history: history}}, {$new: true},(error, data)=>{
        if(error){
            return res.status(400).json({
                error:'Could Not Update Foodie Purchase History'
            })
        }
        next();
    })
    
};

exports.purchaseHistory = (req, res)=>{
    Order.find({user:req.profile._id})
    .populate('foodie','_id name')
    .sort('-created')
    .exec((err, orders)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }
        res.json(orders);
    })
};
exports.foodlancerProducts = (req, res)=>{
    foodlancerId = req.profile._id
    // console.log("FOODLANCER ID :: " + foodlancerId)
    Product.find({foodlancer:foodlancerId})
    .populate("category")
    .populate("foodlancer")
    .exec((err, product) =>{
        if(err || !product){
            res.status(400).json({
                error: err
            })
        }
        // console.log(product)
        res.status(200).json({
            product
        })
    })
};
exports.foodlancerProfile = (req, res)=>{
    const foodlancer = req.profile
    foodlancer.hash_password = undefined;
    foodlancer.salt = undefined;
    if(!foodlancer){
        return res.status(400).json({
            error:'Foodlancer not Found'
        })
    }else{
        return res.status(200).json({
            foodlancer
        })
    }
};
