const mongoose = require('mongoose');

const IntelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    type: {
      type: String,
      enum: ['OSINT', 'HUMINT', 'IMINT'],
      required: true,
      uppercase: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      default: 'manual',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Intel', IntelSchema);
