const Campground = require("../models/Campground");
const { convert } = require("geo-coordinates-parser");
const axios = require("axios");
const { unix_to_date } = require("time-stamps");

const UTCOffset = 7 * 60 * 60;

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const aqiQualitativeName = [
  "null",
  "Good",
  "Fair",
  "Moderate",
  "poor",
  "Very Poor",
];

const aqiAdvices = [
  "null",
  "Air quality is satisfactory, and air pollution poses little or no risk.",
  "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
  "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
  "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
  "Health alert: The risk of health effects is increased for everyone.",
];

// @desc:   Get weathers of campground with an ID of campgroundId
// @route:  GET /api/v1/campgrounds/:campgroundId/weather/general
// @access: Public
exports.getWeather = async (req, res, next) => {
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

    const measurementUnits = 'metric';

    const rawWeatherInfo = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longtitude}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=${measurementUnits}`
    );

    console.log(rawWeatherInfo.data);

    const weatherInfo = new Object();

    weatherInfo.temp = rawWeatherInfo.data.main.temp;
    weatherInfo.tempFeel = rawWeatherInfo.data.main.feels_like;
    weatherInfo.description = rawWeatherInfo.data.weather.at(0).description;
    console.log(weatherInfo.description);

    const measuredTimeStamp = unix_to_date(
      rawWeatherInfo.data.dt + UTCOffset
    );

    const day = days.at(measuredTimeStamp.getDay());

    res.status(200).json({
      success: true,
      message: `we're having a ${weatherInfo.description} right now at ${campgroundObj.name}, the temperature is ${weatherInfo.temp} but it will feel like ${weatherInfo.tempFeel}`,
      data: rawWeatherInfo.data
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather information",
    });
  }
};

// @desc:   Get pollution infos of campground with an ID of campgroundId
// @route:  GET /api/v1/campgrounds/:campgroundId/weather/pollution/
// @access: Public
exports.getPollution = async (req, res, next) => {
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

    const rawPollutionInfo = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longtitude}&appid=${process.env.OPEN_WEATHER_API_KEY}`
    );

    console.log(rawPollutionInfo.data);

    const pollutionInfo = new Object();

    pollutionInfo.AQI = rawPollutionInfo.data.list.at(0).main.aqi;
    pollutionInfo.PM2_5 = rawPollutionInfo.data.list.at(0).components.pm2_5;

    const measuredTimeStamp = unix_to_date(
      rawPollutionInfo.data.list.at(0).dt + UTCOffset
    );
    const day = days.at(measuredTimeStamp.getDay());

    res.status(200).json({
      success: true,
      message: `The weather as of ${day} at ${
        campgroundObj.name
      } considered ${aqiQualitativeName.at(pollutionInfo.AQI)} with an AQI of ${
        pollutionInfo.AQI
      } and pm2.5 level of ${pollutionInfo.PM2_5}. ${aqiAdvices.at(
        pollutionInfo.AQI
      )}`,
      data: rawPollutionInfo.data
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pollution information",
    });
  }
};

exports.getWrongRouteMessage = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'oops! you did not specify whether to get /general or /pollution'
  })
};