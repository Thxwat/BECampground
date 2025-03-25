const Campground = require('../models/Campground');
const Booking = require('../models/Booking');

//@desc     Get all campgrounds
//@routes   GET /api/v1/campgrounds
//@access   Public
exports.getCampgrounds = async (req, res, next) => {
    let query;
    
    // Copy req.query
    const reqQuery = {...req.query};

    // Fields to exclude
    const removeFields = ['select', 'sort'];

    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    // Create query string
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = Campground.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join('');
        query=query.select(fields);
    }

    // Sort 
    if ( req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ') ; 
        query = query.sort(sortBy) ;
    } else {
        query = query.sort('-createdAt') ;

    }

    try {
        const campgrounds = await query;

        res.status(200).json({
            success : true ,
            count : campgrounds.length,
            data : campgrounds
        });
    } catch (err) {
        res.status(400).json({success:false});
    }  
};

//@desc     Get one campgrounds
//@routes   GET /api/v1/campgrounds/:id
//@access   Public
exports.getCampground = async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id);
        
        if(!campground){
            return res.status(400).json({success:false});
        }

        res.status(200).json({
            success : true ,
            data : campground
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc     Create new campgrounds
//@routes   POST /api/v1/campgrounds
//@access   Private
exports.createCampground = async (req, res, next) => {
    // console.log(req.body);
    const campground = await Campground.create(req.body); 
    res.status(201).json({
        success : true ,
        data : campground
    });
};

//@desc     Update campgrounds
//@routes   PUT /api/v1/campgrounds/:id
//@access   Private
exports.updateCampground = async (req, res, next) => {
    try {
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true 
        });

        if (!campground) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({
            success : true ,
            data : campground
        });
    } catch (err) {
        res.status(400),json({success:false});
    }
};

//@desc     Delete campgrounds
//@routes   DELETE /api/v1/campgrounds/:id
//@access   Private
exports.deleteCampground = async (req, res, next) => {
    try {
        console.log("Request Body:", req.body);
        const campground = await Campground.findByIdAndDelete(req.params.id);

        if (!campground) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({
            success : true ,
            data : {}
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};