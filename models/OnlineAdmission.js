const mongoose = require('mongoose');

const onlineAdmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  applicationDate: Date,
  status: String,
});

module.exports = mongoose.model('OnlineAdmission', onlineAdmissionSchema);
