const express = require('express');
const router = express.Router();
const feeOverviewController = require('../controllers/feeOverviewController');


router.get('/multi-branch/overview', feeOverviewController.getOverview);

module.exports = router;
