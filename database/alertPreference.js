const mongoose = require('mongoose');

const alertPreferenceSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    priceField: { type: String, enum: ['buy', 'sell', 'both'], default: 'sell' },
    lastAlertAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlertPreference', alertPreferenceSchema);
