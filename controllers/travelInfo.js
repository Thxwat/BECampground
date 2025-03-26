const Campground = require("../models/Campground");
const { convert } = require("geo-coordinates-parser");
const axios = require("axios");
const { application } = require("express");

// @desc:   Get Places around campground with an ID of campgroundId
// @route:  GET /api/v1/campgrounds/:campgroundId/around/
// @access: Public
exports.getPlace = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.campgroundId);

    if (!campground) {
      return res.status(400).json({
        success: false,
        message: "Cannot find campground with the provided ID",
      });
    }

    const campgroundObj = campground.toObject();
    let rawCoordinate = campgroundObj.coordinate;

    rawCoordinate = convert(rawCoordinate);
    const latitude = rawCoordinate.decimalLatitude;
    const longtitude = rawCoordinate.decimalLongitude;
    const latLong = latitude + ',' + longtitude;

    const resultsWanted = 10;
    const searchRadius = 3000; // In meters
    const searchKeyword = '';
    const searchProvince = campgroundObj.province;

    const rawPlacesInfo = await axios.get(`https://tatapi.tourismthailand.org/tatapi/v5/places/search?keyword=${searchKeyword}&location=${latLong}&numberofresult=${resultsWanted}&searchradius=${searchRadius}&provinceName=${searchProvince}`,{
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TAT_API_KEY}`,
      'Accept-Language': 'TH'
      }
    });

    for (places of rawPlacesInfo.data.result) {
      delete places.sha;
      delete places.place_id;
      delete places.thumbnail_url;
      delete places.tags;
      delete places.update_date;
      delete places.distance;
      console.log(places);
    }

    //console.log(rawPlacesInfo.data);

    res.status(200).json({
      success: true,
      message: `places around ${campgroundObj.name} in ${campgroundObj.province} provinces`,
      data: rawPlacesInfo.data
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch places information",
    });
  }
}