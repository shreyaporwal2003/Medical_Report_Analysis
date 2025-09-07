const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  extractedText: String,
  parsedData: Object,
  summary: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);