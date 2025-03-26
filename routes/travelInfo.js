const express = require('express');
const { getPlace } = require('../controllers/travelInfo');

const router = express.Router({mergeParams: true});

router
  .route('/')
  .get(getPlace);

module.exports = router;