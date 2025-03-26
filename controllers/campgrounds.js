const Campground = require("../models/Campground");

// @desc:    Get all campgrounds
// @route:   GET /api/v1/campgrounds
// @access:  Public
exports.getCampgrounds = async (req, res, next) => {
  let query;
  console.log(req);

  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over remove fields and delete them from reqQuery
  removeFields.forEach((params) => delete reqQuery[params]);

  let queryStr = JSON.stringify(req.query);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //Finding resource
  query = Campground.find(JSON.parse(queryStr)).populate("appointments");

  // Select
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("name");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Campground.countDocuments();

  query = query.skip(startIndex).limit(limit);

  try {
    const campgrounds = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: campgrounds.length,
      pagination,
      data: campgrounds,
    });
    console.log('success', campgrounds.length);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc:    Get a single campgrounds with an id
// @route:   GET /api/v1/campgrounds/:id
// @access:  Public
exports.getCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: campground,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc:    Create a new campground
// @route:   POST /api/v1/campgrounds
// @access:  Private
exports.createCampground = async (req, res, next) => {
  try {
    const campground = await Campground.create(req.body);

    res.status(201).json({
      success: true,
      data: campground,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc:    Update a campground with an id
// @route:   PUT /api/v1/campgrounds
// @access:  Private
exports.updateCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({
      success: true,
      data: campground,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc:    Delete a campground with an id
// @route:   DELETE /api/v1/campgrounds/:id
// @access:  Private
exports.deleteCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
      return res.status(400).json({ success: false });
    }

    await campground.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
