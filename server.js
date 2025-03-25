const express = require('express') ;
const dotenv = require('dotenv') ;
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path:'./config/config.env'}) ;

// Connect to Databse
connectDB();

//Route files
const campgrounds = require('./routes/campgrounds');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');

const app = express() ;

// Body Parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());
// Mount routers
app.use('/api/v1/campgrounds',campgrounds);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

const PORT = process.env.PORT || 5000 ;
const server = app.listen(
    PORT, 
    console.log(
        'Server running in ', 
        process.env.NODE_ENV,
        "on" + process.env.HOST + ":" + PORT 
    )
);

const swaggerOptions ={
    swaggerDefinition:{
        openapi:'3.0.0',
        info:{
            title:'Library API',
            version:'1.0.0',
            description:'Campground Booking API'
        },
        servers:[
            {
                url: process.env.HOST + ':' + PORT + '/api/v1'
            }
        ],
    }
}

// Handle unhandled promise rejections
process.on('unhadledRejection', (err,promise) => {
    console.log(`Error:${err.message}`);
    //close server & exit process
    server.close( () => process.exit(1) );
});