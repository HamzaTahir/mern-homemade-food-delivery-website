const { errorHandler } = require('../helpers/dbErrorHandler');
const Foodie = require('../models/foodie');
const {Order} = require('../models/order');

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