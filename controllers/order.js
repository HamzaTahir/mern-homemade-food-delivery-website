const { Order, CartItem } = require("../models/order");
const {errorHandler} = require('../helpers/dbErrorHandler');
// const order = require("../models/order");
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox50919f5392cb4c57a39995c50b766d1b.mailgun.org';
const api_key = 'ddddfa8d54ae0fcd0df456291bb5c91d-4879ff27-10a3e8b0';
const mg = mailgun({apiKey: api_key, domain: DOMAIN});
const Admin = require('../models/admin');
const Foodie = require('../models/foodie');
const Foodlancer = require('../models/foodlancer');
const order = require("../models/order");

exports.create = (req, res) =>{
    // console.log("Create Order: ", req.body.order);
    // admin mail
    // foodie mail
    // foodlancer mail
   
    req.body.order.user = req.profile
    const order = new Order(req.body.order)

    // console.log("Order: ", order);
    order.save((error, data)=>{
        if(error){
            return res.status(400).json({
                error: error
            });
        }
        else{
            // res.json(data)
                // order mail send to admin 
            const data = {
                from: 'KHANSAMA@support.com.pk',
                to: 'sulemanhamzatahir@gmail.com',
                subject: 'Admin New Order Alert',
                html: `
                    <p>Order Id: ${order._id}</p>
                    <p>Order Amount: ${order.amount} Rs.</p>
                    <p>User Id: ${order.user._id}</p>
                    <p>User Name: ${order.user.name}</p>
                    <br>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data, function (error, body) {
                if(error){
                    // return res.json({
                    //     error: error.message
                    // })
                    console.log("Admin Error "+ error.message);
                }
                else{
                    console.log("Email Has Been Sent, Kindly Check Your Email");
                    // return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                }
            });
            // order mail send to fodie 
            const data2 = {
                from: 'KHANSAMA@support.com.pk',
                to: req.profile.email,
                subject: 'Foodie Order Alert',
                html: `
                    <p>Order Id: ${order._id}</p>
                    <p>Order Amount: ${order.amount} Rs.</p>
                    <p>User Name: ${order.user.name}</p>
                    <br>
                    <p>Love From KHANSAMA</p>
                    `
            };
            mg.messages().send(data2, function (error, body) {
                if(error){
                    // return res.json({
                    //     error: error.message
                    // })
                    console.log("Foodie Error "+ error.message);
                }
                else{
                    console.log("Email Has Been Sent, Kindly Check Your Email");
                    // return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                }
            });
            for(var i=0; i<order.products.length; i++){
                var foodlancerId = order.products[i].foodlancer;
                var currentFoodlancer = '';
                Foodlancer.findById(foodlancerId).exec((err, foodlancer)=>{
                    if(err || !foodlancer){
                        // return res.status(400).json({
                        //     error:'Foodlancer not Found'
                        // })
                        console.log("Foodlancer Error "+ err);
                    }
                    else{
                        currentFoodlancer  = foodlancer
                        console.log(foodlancer.email)
                        const data3 = {
                            from: 'KHANSAMA@support.com.pk',
                            to: foodlancer.email,
                            subject: 'Foodlancer Order Alert',
                            html: `
                                <p>Order Id: ${order._id}</p>
                                <p>Order Amount: ${order.amount} Rs.</p>
                                <p>User Name: ${order.user.name}</p>
                                <br>
                                <p>Love From KHANSAMA</p>
                                `
                        };
                        mg.messages().send(data3, function (error, body) {
                            if(error){
                                // return res.json({
                                //     error: error.message
                                // })
                                console.log("Foodlancer Error "+ error.message);
                            }
                            else{
                                console.log("Email Has Been Sent, Kindly Check Your Email");
                                // return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                            }
                        });
                    }
                    // console.log("foodlancer :: " + foodlancer)
                });
                // console.log("currentFoodlancer :: " + currentFoodlancer)
                
            }

            res.status(200).json(data)
        }
    });
};
exports.orderByStatus = (req, res, next, orderStatus)=>{
    req.orderStatus = orderStatus;
    next();
};

exports.orderById = (req, res, next, id) =>{
    Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order)=>{
        if(err || !order){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        req.order = order;
        next();
    });
};


exports.listOrders = (req, res) =>{
    Order.find()
    .populate("foodie", "_id name address")
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
exports.foodlancerListOrders = (req, res) =>{
    var ordersArray = [];
    var user = req.profile;
    // console.log(user)
    Order.find()
    .populate("foodie", "_id name address")
    .sort('-created')
    .exec((err, orders)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        else{
            for(var i=0; i<orders.length; i++){
                for(var j=0; j<orders[i].products.length; j++){
                    if(JSON.stringify(orders[i].products[j].foodlancer) === JSON.stringify(user._id)){
                        ordersArray.push(orders[i])
                    }
                }
            }
        }
        // console.log(orders[5].products)
        res.json(ordersArray)

    });
};
exports.foodlancerListOrdersByOrderStatus = (req, res) =>{
    var ordersArray = [];
    var user = req.profile;
    // console.log(user)
    Order.find({status: req.orderStatus})
    .exec((err, orders)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        else{
            for(var i=0; i<orders.length; i++){
                for(var j=0; j<orders[i].products.length; j++){
                    // console.log(orders[i].products[j].foodlancer)
                    // console.log(user._id)
                    // console.log('////////////')
                    if(JSON.stringify(orders[i].products[j].foodlancer) === JSON.stringify(user._id)){
                        ordersArray.push(orders[i])
                        // ordersArray.push(orders[i].products[j])
                    }
                }
            }
        }
        // console.log(orders[5].products)
        res.json(ordersArray)

    });
};


exports.getStatusValues = (req, res) =>{
    res.json(Order.schema.path('status').enumValues)

}

exports.updateOrderStatus = (req, res) =>{
    var orderDetails;
    var adminEmail;
    var foodlancerEmails;
    var foodieEmail;
    Order.update({_id: req.body.orderId}, {$set:{status: req.body.status}}, (err, foodie)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        else{
            Order.findById(req.body.orderId)
            .populate('user','_id email name')
            .exec((err, order)=>{
                if(err){
                    return res.status(400).json({
                        error: errorHandler(error)
                    });
                }
                else{
                    orderDetails = order
                    // console.log("ORDER Details: " + orderDetails.user)
                    // admin send email
                    const data = {
                        from: 'KHANSAMA@support.com.pk',
                        to: 'sulemanhamzatahir@gmail.com',
                        subject: 'Admin Order Status Alert',
                        html: `
                            <p>Order Id: ${order._id}</p>
                            <p>Order Status :${req.body.status}</p>
                            <p>Order Amount: ${order.amount} Rs.</p>
                            <br>
                            <p>Love From KHANSAMA</p>
                            `
                    };
                    mg.messages().send(data, function (error, body) {
                        if(error){
                            // return res.json({
                            //     error: error.message
                            // })
                            console.log("Foodlancer Error "+ error.message);
                        }
                        else{
                            console.log("Admin Email Has Been Sent, Kindly Check Your Email");
                            // return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                        }
                    });
                    // foodlancer find and send email
                    for(var i=0; i<order.products.length; i++){
                        var foodlancerId = order.products[i].foodlancer;
                        var currentFoodlancer = '';
                        Foodlancer.findById(foodlancerId).exec((err, foodlancer)=>{
                            if(err || !foodlancer){
                                // return res.status(400).json({
                                //     error:'Foodlancer not Found'
                                // })
                                console.log("Foodlancer Error "+ err);
                            }
                            else{
                                currentFoodlancer  = foodlancer
                                // console.log(foodlancer.email)
                                const data2 = {
                                    from: 'KHANSAMA@support.com.pk',
                                    to: foodlancer.email,
                                    subject: 'Foodlancer Order Status Alert',
                                    html: `
                                        <p>Order Id: ${order._id}</p>
                                        <p>Order Status :${req.body.status}</p>
                                        <p>Foodie Name: ${order.user.name}</p>
                                        <p>Order Amount: ${order.amount} Rs.</p>
                                        <br>
                                        <p>Love From KHANSAMA</p>
                                        `
                                };
                                mg.messages().send(data2, function (error, body) {
                                    if(error){
                                        // return res.json({
                                        //     error: error.message
                                        // })
                                        console.log("Foodlancer Error "+ error.message);
                                    }
                                    else{
                                        console.log("Foodlancer Email Has Been Sent, Kindly Check Your Email");
                                        // return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                                    }
                                });
                            }
                        });
                        
                    }
                    // foodie find and send email
                    Foodie.findById(orderDetails.user).exec((err, foodie)=>{
                        if(err){
                            return res.status(400).json({
                                error: errorHandler(error)
                            });
                        }
                        else{
                            // foodieEmail = foodie.email
                            const data3 = {
                                from: 'KHANSAMA@support.com.pk',
                                to: foodie.email,
                                subject: 'Foodie Order Status Alert',
                                html: `
                                    <p>Order Id: ${order._id}</p>
                                    <p>Your Order is :${req.body.status}</p>
                                    <p>Foodie Name: ${order.user.name}</p>
                                    <p>Order Amount: ${order.amount} Rs.</p>
                                    <br>
                                    <p>Love From KHANSAMA</p>
                                    `
                            };
                            mg.messages().send(data3, function (error, body) {
                                if(error){
                                    // return res.json({
                                    //     error: error.message
                                    // })
                                    console.log("Foodlancer Error "+ error.message);
                                }
                                else{
                                    console.log("Foodie Email Has Been Sent, Kindly Check Your Email");
                                    // return res.json({message: 'Email Has Been Sent, Kindly Activate Your Account'})
                                }
                            });
                        }
                    })
                    res.json(order);
                }
            })
        }
    })
}
exports.read2 = (req, res)=>{
    const order = req.order;
    const foodieId = req.profile.id;
    // console.log(orderUserId + " :: " + foodieId)
    // if(){

    // }
    // else{

    // }
    if(order.user.valueOf() == foodieId.valueOf()){
        // if(order.status === 'Shipped'){
        //     return res.status(200).json(`Order is Shipped`);
        // }
        // else{
            return res.status(200).json(`Order is ${order.status}`);
        // }
    }
    else{
        return res.status(400).json({
            error: "Invalid Id"
        })
    }
};