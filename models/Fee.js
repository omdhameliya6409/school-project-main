const mongoose = require("mongoose");
  const FeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feesGroup: { type: String, required: true }, 
  feesCode: { type: String, required: true },   
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], default: 'Unpaid' },
  amount: { type: Number, required: true },
  paymentId: { type: String },
  mode: { type: String, enum: ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'], required: true },
  discount: { type: Number, default: 0 },
  fine: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  balance: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Fee', FeeSchema);
