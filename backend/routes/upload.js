const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const Intel = require('../models/Intel');
const dataModule = require('./data');

const { demoStore, isMongoConnected } = dataModule;

// Multer config for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/images');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Multer config for data files
const dataStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/data');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const dataUpload = multer({
  storage: dataStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv', '.json'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'));
    }
  },
});

// POST /api/upload-image
router.post('/upload-image', imageUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/upload-data
router.post('/upload-data', dataUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const content = fs.readFileSync(req.file.path, 'utf8');

    let records = [];
    if (ext === '.json') {
      const parsed = JSON.parse(content);
      records = Array.isArray(parsed) ? parsed : [parsed];
    } else if (ext === '.csv') {
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    }

    const validTypes = ['OSINT', 'HUMINT', 'IMINT'];
    const results = { inserted: 0, errors: [] };

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const lat = parseFloat(r.latitude || r.lat);
      const lng = parseFloat(r.longitude || r.lng || r.lon);

      if (isNaN(lat) || isNaN(lng)) {
        results.errors.push(`Row ${i + 1}: Invalid coordinates`);
        continue;
      }
      if (!r.title && !r.name) {
        results.errors.push(`Row ${i + 1}: Missing title`);
        continue;
      }

      const typeRaw = (r.type || 'OSINT').toUpperCase();
      const intelType = validTypes.includes(typeRaw) ? typeRaw : 'OSINT';

      const payload = {
        title: r.title || r.name || 'Unknown',
        description: r.description || r.desc || '',
        latitude: lat,
        longitude: lng,
        type: intelType,
        imageUrl: r.imageUrl || r.image_url || null,
        confidence: parseInt(r.confidence) || 50,
      };

      try {
        if (!isMongoConnected()) {
          demoStore.push({
            _id: 'upload_' + Date.now() + '_' + i,
            ...payload,
            createdAt: new Date().toISOString(),
          });
        } else {
          await new Intel(payload).save();
        }
        results.inserted++;
      } catch (e) {
        results.errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }

    fs.unlink(req.file.path, () => {});

    res.json({
      success: true,
      message: `Processed ${records.length} records. Inserted: ${results.inserted}, Errors: ${results.errors.length}`,
      ...results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
