const Booking = require("../models/Booking");
const Campground = require("../models/Campground");
const User = require("../models/User");
// @desc    Get all booking
// @route   GET /api/v1/bookings
// @access  Public
exports.getBookings = async (req, res, next) => {
  let query;
  // General users can see only their bookings!
  if (req.user.role !== "admin") {
    query = Booking.find({ user: req.user.id }).populate({
      path: "campground",
      select: "name address tel",
    });
  } else {
    //If you are an admin, you can see all!
    if (req.params.campgroundId) {
      console.log(req.params.campgroundId);
      query = Booking.find({ campground: req.params.campgroundId }).populate({
        path: "campground",
        select: "name address tel",
      });
    } else {
      query = Booking.find().populate({
        path: "campground",
        select: "name address tel",
      });
    }
  }
  try {
    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot find Booking",
    });
  }
};

// @desc    Add booking
// @route   POST /api/v1/campgrounds/:campgroundId/bookings
// @access  Private
exports.addBooking = async (req, res, next) => {
  // console.log('Headers:', req.headers);  // Log the headers to verify the request
  // console.log('Body:', req.body);

  try {
    req.body.campground = req.params.campgroundId;

    const campground = await Campground.findById(req.params.campgroundId);

    if (!campground) {
      return res.status(404).json({
        success: false,
        msg: `No campground with the id of ${req.params.campgroundId}`,
      });
    }
    //add user Id to req.body
    console.log("body :", req.body);

    console.log("User ID:", req.user.id);
    req.body.user = req.user.id;

    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const newBookingNights = (checkOut - checkIn) / (1000 * 60 * 60 * 24); // Convert ms to days

    const existingBookings = await Booking.find({ user: req.user.id });

    // Calculate total nights from previous bookings
    const totalExistingNights = existingBookings.reduce((total, booking) => {
      const existingCheckIn = new Date(booking.checkIn);
      const existingCheckOut = new Date(booking.checkOut);
      const nights =
        (existingCheckOut - existingCheckIn) / (1000 * 60 * 60 * 24);
      return total + nights;
    }, 0);

    // Enforce 3-night limit for non-admins
    if (
      totalExistingNights + newBookingNights > 3 &&
      req.user.role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        msg: `User with ID ${req.user.id} can only book up to 3 nights in total.`,
      });
    }

    const booking = await Booking.create(req.body);

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Cannot create Booking" });
  }
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Public
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "campground",
      select: "name description tel",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: `Cannot find Booking` });
  }
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        msg: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        msg: `User with ID ${req.user.id} is not authorized to update booking ${booking._id}`,
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err);

    res.status(500).json({ success: false, msg: "Cannot update Booking" });
  }
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        msg: `No booking with the id of ${req.params.id}`,
      });
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        msg: `User with ID ${req.user.id} is not authorized to delete booking ${booking._id}`,
      });
    }
    await booking.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: "Cannot delete Booking" });
  }
};
