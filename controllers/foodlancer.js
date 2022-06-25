const Foodlancer = require('../models/foodlancer');
const Product = require('../models/product');
const {Order} = require("../models/order");

const mongoose = require('mongoose');
const { last } = require('lodash');
const formidable = require('formidable');
const _ = require('lodash');
const {errorHandler} = require('../helpers/dbErrorHandler');
const fs = require('fs');

exports.foodlancerById = (req, res, next, id)=>{
    Foodlancer.findById(id).exec((err, foodlancer)=>{
        if(err || !foodlancer){
            return res.status(400).json({
                error:'Foodlancer not Found'
            })
        }
        req.profile = foodlancer
        // console.log(foodlancer)
        next();
    });
};

exports.foodlancerById2 = (req, res, next, id)=>{
    Foodlancer.findById(id).exec((err, foodlancer)=>{
        if(err || !foodlancer){
            return res.status(400).json({
                error:'Foodlancer not Found'
            })
        }
        req.foodlancer = foodlancer
        next();
    });
};


exports.read = (req, res)=>{
    req.profile.hash_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile)
};

exports.update = (req, res)=>{
    

    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files)=>{
     //    console.log(err);
        //  if(err){
        //      return res.status(400).json({
        //          error:'Image Could not be Uploaded'
        //      })
        //  }
 
         // check for all fields
         const {name, email, password, photo} = fields;
         if(!name || !email){
             return res.status(400).json({
                 error:'All fields are required'
             })
         }
         else{
             
                // console.log(name + " " + email + " " + password)
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
                Foodlancer.findOneAndUpdate({email:email},{$set: {name: name, email: email, password: password, photo: foodlancer.photo}}, {$new: true},(err, foodlancer)=>{
                    if(err){
                        return res.status(400).json({
                            error: err
                            // error:'You are not Authorized to perform this action'
                        })
                    }
                    foodlancer.hash_password = undefined;
                    foodlancer.salt = undefined;
                    // res.json("Foodlancer is Updated")
                    res.json(foodlancer)
                })
         }
    })  
    
};

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

exports.listKitchen = (req, res)=>{
    // let order = req.query.order ? req.query.order: 'asc';
    const productsArray =  [];
    const idsArray = [];
    let order = req.query.order ? req.query.order: 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy: '_id';
    let limit = req.query.limit ? parseInt(req.query.limit): 10;

    Product.find()
    .select("-photo")
    // .populate("foodlancer")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products)=>{
        if(err){
            return res.status(400).json({
                error: 'Product Not Found'
                // error: errorHandler(err)
             });
        }
        // res.json(products)
        productsArray.push(products)
        // console.log(productsArray)
        for(var i=0; i<limit; i++){
            idsArray.push(productsArray[0][i].foodlancer)
        }
        console.log(idsArray)
        var idsFiltered = idsArray.filter(function (el) {
            return el != undefined;
        });
        idsFiltered.push('5ff63694fc5ff901cc8f9501')
        idsFiltered.push('5ff63b25c6acf63274445351')
        idsFiltered.push('5ff63be5c6acf63274445355')
        Foodlancer.find().where('_id').in(idsFiltered).exec((err, foodlancer) => {
            if(err || !foodlancer ){
                console.log("ERROR : " + err)
            }
            else{
                for(var i=0; i<foodlancer.length; i++){
                    foodlancer[i].hashed_password = undefined;
                    foodlancer[i].salt = undefined;
                }
                // console.log("FOODLANCER : " + foodlancer)
                res.status(200).json({
                    foodlancer
                })
            }
        });
        // for(var i=0; i<idsFiltered.length; i++){
        //     let _id = idsFiltered[i];
        //     console.log(_id)
           
        // }
        //  Foodlancer.findById('5fd0d7ab220bec6540d7b22e').exec((err, foodlancer)=>{
        //     if(err || !foodlancer ){
        //         console.log("ERROR : " + err)
        //     }
        //     else{
        //         console.log("FOODLANCER : " + foodlancer)
        //     }
        // });   
    });
};

  // idsFiltered = idsFiltered.map(String);
        // console.log(idsFiltered.map(String));
        // Foodlancer.find().where('_id').in(idsFiltered).exec((err, records) => {
        //     console.log(records)
        // });

exports.readFoodlancersOrdersInformation = (req, res)=>{
    foodlancerId = req.profile._id
    allOrdersArray = [];
    ordersArray = [];
    Order.find({status: 'Delivered'}).exec((err, orders) =>{
        if(err || !orders){
            // res.status(400).json({
            //     error: err
            // })
            console.log("ERROR :: " + err)
        }
        else{
            for(var i=0 ; i<orders.length; i++){
                if(orders[i].products.length > 1){
                    for(var j=0 ; j<orders[i].products.length; j++){
                        allOrdersArray.push(orders[i].products[j])
                    }
                }
                else if(orders[i].products.length === 1){
                    allOrdersArray.push(orders[i].products[0])
                }
            }
            // console.log("ALL ORDER PRODUCTS :: " + allOrdersArray)
            // console.log("FOODLANCER ID :: " + foodlancerId)
            for( var z=0 ; z<allOrdersArray.length; z++){
                if(String(allOrdersArray[z].foodlancer) === String(foodlancerId)){
                    ordersArray.push(allOrdersArray[z])
                }
                else{
                    // console.log(allOrdersArray[z])
                }
            }
            // console.log("ORDER PRODUCTS :: " + ordersArray)
            // console.log(product)
            res.status(200).json({
                ordersArray
            })
        }
    })
};

exports.photo = (req, res, next)=>{
    
    if(req.profile.photo.data){
        res.set('Content-Type', req.profile.photo.contentType)
        return res.send(req.profile.photo.data)
    }
    next();
};