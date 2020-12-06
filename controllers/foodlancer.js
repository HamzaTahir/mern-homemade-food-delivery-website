const Foodlancer = require('../models/foodlancer');

exports.foodlancerById = (req, res, next, id)=>{
    Foodlancer.findById(id).exec((err, foodlancer)=>{
        if(err || !foodlancer){
            return res.status(400).json({
                error:'Foodlancer not Found'
            })
        }
        req.profile = foodlancer
        next();
    });
};


// exports.read = (req, res)=>{
//     req.profile.hash_password = undefined;
//     req.profile.salt = undefined;

//     return res.json(req.profile)
// };

// exports.update = (req, res)=>{
    
//     Foodie.findOneAndUpdate({_id:req.profile._id},{$set:req.body}, {$new: true},(err, Foodie)=>{
//         if(err){
//             return res.status(400).json({
//                 error:'You are not Authorized to perform this action'
//             })
//         }
//         Foodie.hash_password = undefined;
//         Foodie.salt = undefined;
//         res.json(Foodie)
//     })
    
// };

// exports.addOrderToFoodieHistory = (req, res, next)=>{
    
//     let history = [];
//     req.body.order.products.forEach((item)=>{
//         history.push({
//         _id: item._id,
//         name: item.name,
//         description: item.description,
//         category: item.category,
//         quantity: item.count,
//         transaction_id: req.body.order.transaction_id,
//         amount: req.body.order.amount
//         })
//     })


//     Foodie.findOneAndUpdate({_id:req.profile._id},{$push:{history: history}}, {$new: true},(error, data)=>{
//         if(error){
//             return res.status(400).json({
//                 error:'Could Not Update Foodie Purchase History'
//             })
//         }
//         next();
//     })
    
// };
