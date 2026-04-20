const express = require('express');
const router = express.Router();
const Intel = require('../models/Intel');
const mongoose = require('mongoose');

// Shared in-memory demo store
const demoStore = [
  {
    _id: 'demo1',
    title: 'Signal Intercept Alpha',
    description: 'Unusual radio frequency activity detected near coastal area. Multiple transmissions recorded over 48h period.',
    latitude: 34.0522,
    longitude: -118.2437,
    type: 'OSINT',
    imageUrl: null,
    confidence: 72,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo2',
    title: 'Ground Asset Report',
    description: 'Field operative confirmed movement of heavy vehicles along northern route. Estimated 6-8 units.',
    latitude: 40.7128,
    longitude: -74.006,
    type: 'HUMINT',
    imageUrl: null,
    confidence: 88,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo3',
    title: 'Satellite Imagery Delta-7',
    description: 'High-resolution imagery shows construction of new structure. Dimensions suggest industrial use.',
    latitude: 51.5074,
    longitude: -0.1278,
    type: 'IMINT',
    imageUrl: null,
    confidence: 95,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo4',
    title: 'Social Media Analysis',
    description: 'Spike in encrypted messaging app usage in the region. Cross-referenced with known network patterns.',
    latitude: 48.8566,
    longitude: 2.3522,
    type: 'OSINT',
    imageUrl: null,
    confidence: 60,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo5',
    title: 'Human Source Echo',
    description: 'Insider report indicates scheduled meeting of high-value individuals at local facility.',
    latitude: 35.6762,
    longitude: 139.6503,
    type: 'HUMINT',
    imageUrl: null,
    confidence: 78,
    createdAt: new Date().toISOString(),
  },
];

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// GET /api/data
router.get('/data', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      let result = [...demoStore];
      if (req.query.type) {
        result = result.filter(d => d.type === req.query.type.toUpperCase());
      }
      return res.json({ success: true, count: result.length, data: result });
    }
    const filter = {};
    if (req.query.type) filter.type = req.query.type.toUpperCase();
    const data = await Intel.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/data/:id
router.get('/data/:id', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const item = demoStore.find(d => d._id === req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      return res.json({ success: true, data: item });
    }
    const item = await Intel.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/data
router.post('/data', async (req, res) => {
  try {
    const { title, description, latitude, longitude, type, imageUrl, confidence } = req.body;
    if (!isMongoConnected()) {
      const newItem = {
        _id: 'manual_' + Date.now(),
        title,
        description: description || '',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        type: (type || 'OSINT').toUpperCase(),
        imageUrl: imageUrl || null,
        confidence: parseInt(confidence) || 50,
        createdAt: new Date().toISOString(),
      };
      demoStore.push(newItem);
      return res.status(201).json({ success: true, data: newItem });
    }
    const intel = new Intel({ title, description, latitude, longitude, type, imageUrl, confidence });
    await intel.save();
    res.status(201).json({ success: true, data: intel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/data/:id
router.delete('/data/:id', async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const idx = demoStore.findIndex(d => d._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
      demoStore.splice(idx, 1);
      return res.json({ success: true, message: 'Deleted' });
    }
    await Intel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.demoStore = demoStore;
module.exports.isMongoConnected = isMongoConnected;
