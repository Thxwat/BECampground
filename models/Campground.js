const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,'Please add a name'],
        unique : true,
        trim : true,
        maxlength : [50, 'Name can not be more than 50 charactors']
    },
    address : {
        type : String,
        required : [true, 'Please add an address']
    },
    tel : {
        type : String
    }
},{
    toJSON : {virtuals:true},
    toObject : {virtuals:true}
    }
);

// Reverse populate with virtuals
CampgroundSchema.virtual('bookings',{
    ref : 'Booking',
    localField : '_id',
    foreignField: 'campground' ,
    justOne : false
  });
module.exports = mongoose.model('Campground', CampgroundSchema);