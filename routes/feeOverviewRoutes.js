const express = require('express');
const router = express.Router();
const feeOverviewController = require('../controllers/feeOverviewController');

// Define the route for fee overview
router.get('/multi-branch/overview', feeOverviewController.getFeeOverview);

module.exports = router;
