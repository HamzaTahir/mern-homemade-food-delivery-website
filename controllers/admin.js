const Admin = require('../models/admin');
const Foodie = require('../models/foodie');
const Foodlancer = require('../models/foodlancer');

exports.adminById = (req, res, next, id)=>{
    Admin.findById(id).exec((err, admin)=>{
        if(err || !admin){
            return res.status(400).json({
                error:'Admin not Found'
            })
        }
        req.profile = admin
        next();
    });
};


exports.readFoodlancer = (req, res)=>{
    req.foodlancer.hash_password = undefined;
    req.foodlancer.salt = undefined;

    return res.json(req.foodlancer)
};

exports.readFoodie = (req, res)=>{
    req.foodie.hash_password = undefined;
    req.foodie.salt = undefined;

    return res.json(req.foodie)
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

exports.listFoodies = (req, res) =>{
    Foodie.find()
    .populate("foodie", "_id name")
    .sort('-created')
    .exec((err, orders)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        else{
            res.json(orders)
        }
    });
};

exports.listFoodlancers = (req, res) =>{
    Foodlancer.find()
    .populate("foodlancer", "_id name")
    .sort('-created')
    .exec((err, orders)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        else{
            res.json(orders)
        }
    });
};

exports.listAdmins = (req, res) =>{
    Admin.find()
    .populate("admin", "_id name")
    .sort('-created')
    .exec((err, orders)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        else{
            res.json(orders)
        }
    });
};

exports.removeFoodie = (req, res)=>{
    const foodie = req.foodie;
    // console.log(foodie)
    if(foodie.role === 0){
        Foodie.findByIdAndDelete(foodie._id, function(err, data){
            if(err || !data){
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json({
                message:"Foodie Deleted"
            })
        })
    }
};

exports.updateFoodie = (req, res)=>{
    Foodie.findOneAndUpdate({_id:req.foodie._id},{$set:req.body}, {$new: true},(err, foodie)=>{
        if(err){
            return res.status(400).json({
                error:'You are not Authorized to perform this action'
            })
        }
        foodie.hash_password = undefined;
        foodie.salt = undefined;
        res.json(foodie)
    })
};

exports.removeFoodlancer = (req, res)=>{
    const foodlancer = req.foodlancer;
    // console.log(foodlancer)
    if(foodlancer.role === 1){
        Foodlancer.findByIdAndDelete(foodlancer._id, function(err, data){
            if(err || !data){
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json({
                message:"Foodlancer Deleted"
            })
        })
    }
};

exports.updateFoodlancer = (req, res)=>{
    Foodlancer.findOneAndUpdate({_id:req.foodlancer._id},{$set:req.body}, {$new: true},(err, foodlancer)=>{
        if(err){
            return res.status(400).json({
                error:'You are not Authorized to perform this action'
            })
        }
        foodlancer.hash_password = undefined;
        foodlancer.salt = undefined;
        res.json(foodlancer)
    })
    
};

exports.removeAdmin = (req, res)=>{
    const admin = req.profile;
    // console.log(foodlancer)
    if(admin.role === 2){
        Admin.findByIdAndDelete(admin._id, function(err, data){
            if(err || !data){
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json({
                message:"Foodlancer Deleted"
            })
        })
    }
};

exports.updateAdmin = (req, res)=>{
    Admin.findOneAndUpdate({_id:req.profile._id},{$set:req.body}, {$new: true},(err, admin)=>{
        if(err){
            return res.status(400).json({
                error:'You are not Authorized to perform this action'
            })
        }
        admin.hash_password = undefined;
        admin.salt = undefined;
        res.json(admin)
    })
    
};
