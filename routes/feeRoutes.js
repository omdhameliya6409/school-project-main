const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

router.get('/studentfee', feeController.getFeesByClassAndSection);  // Accessible by principal and teacher
router.post('/studentfee/collectfee/:studentId', feeController.collectFee);  // Accessible by principal only
router.get('/studentfee/:studentId', feeController.getFeeDetails);  // Accessible by principal and teacher
router.get('/searchpaymentByPaymentId', feeController.searchPaymentsByPaymentId);
router.put('/studentfee/edit/:studentId', feeController.editFee);
module.exports = router;
