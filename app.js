const express = require('express');
const mongoose = require('mongoose');
const authRouter  = require('./routes/auth');
const foodieRouter  = require('./routes/foodie');
const foodlancerRouter  = require('./routes/foodlancer');
const adminRouter  = require('./routes/admin');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');

// const braintreeRoutes = require('./routes/braintree');
const orderRoutes = require('./routes/orders');
const braintreeRoutes = require('./routes/braintree');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const cors = require('cors');

require('dotenv').config()

// app
const app = express(); 

// database
mongoose.connect(process.env.DATABASE, {
     useNewUrlParser: true,
     useCreateIndex: true
}).then(()=>{
    console.log("Database Connected.")
})


// middlewares
app.use(morgan('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.json()); 
// app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

// routes middleware 
app.use('/api',authRouter);
app.use('/api',foodieRouter);
app.use('/api',foodlancerRouter);
app.use('/api',adminRouter);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", braintreeRoutes);
// app.use("/api", braintreeRoutes);
app.use("/api", orderRoutes);

const port = process.env.POPT || 8000

app.listen(port, ()=>{
    console.log(`Server is running on ${port}`);
});

