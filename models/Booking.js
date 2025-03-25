const mongoose = require('mongoose');
const Campground = require('./Campground');

const BookingSchema = new mongoose.Schema({
    checkIn : {
        type : Date,
        required : [true, "Check-in date is required"]
    },
    checkOut : {
        type : Date,
        required : [true, "Check-out date is required"]
    },
    user : {
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    campground : {
        type:mongoose.Schema.ObjectId,
        ref : 'Campground',
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    }
});

module.exports=mongoose.model('Booking', BookingSchema) ;