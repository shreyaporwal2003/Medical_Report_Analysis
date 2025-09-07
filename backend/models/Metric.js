const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metric: { type: String, required: true },
  value: { type: Number },
  unit: { type: String, default: '-' },   // ✅ instead of required
  status: { type: String, enum: ['low', 'normal', 'high' , "abnormal"], default: 'normal' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Metric', metricSchema);
