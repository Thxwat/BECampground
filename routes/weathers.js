const express = require('express');
const { getWeather, getPollution, getWrongRouteMessage } = require('../controllers/weathers')

const router = express.Router({ mergeParams: true});

router
.route('/general')
.get(getWeather);

router
.route('/pollution')
.get(getPollution);

router
  .route('/')
  .get(getWrongRouteMessage);

module.exports = router;