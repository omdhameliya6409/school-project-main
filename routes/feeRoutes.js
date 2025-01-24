const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

router.get('/studentfee', feeController.getFeesByClassAndSection); 
router.post('/studentfee/collectfee/:studentId', feeController.collectFee);
router.get('/studentfee/:admissionNo', feeController.getFeeDetails);
router.get('/searchpaymentByPaymentId', feeController.searchPaymentsByPaymentId);
router.put('/studentfee/edit/:studentId', feeController.editFee);
module.exports = router;
