/**
 * seed.js — Run this to populate your MongoDB with sample intel data
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Intel = require('./models/Intel');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intel_dashboard';

const sampleData = [
  // OSINT
  {
    title: 'Signal Intercept Alpha',
    description: 'Unusual radio frequency activity detected near coastal area. Multiple transmissions recorded over a 48-hour period. Frequencies match known encrypted protocol.',
    latitude: 34.0522,
    longitude: -118.2437,
    type: 'OSINT',
    confidence: 72,
    source: 'SIGINT-AUTO',
  },
  {
    title: 'Social Media Cluster — District 7',
    description: 'Spike in encrypted messaging app usage originating from district 7. Pattern cross-referenced with prior operational signatures. Suspected coordination activity.',
    latitude: 28.6139,
    longitude: 77.2090,
    type: 'OSINT',
    confidence: 55,
    source: 'CYBER-OPS',
  },
  {
    title: 'Dark Web Chatter — NIGHTFALL',
    description: 'Forums indicate coordinated logistics operation planned for Q4. Codename NIGHTFALL referenced across 4 separate threads. Language analysis suggests non-native speakers.',
    latitude: 59.3293,
    longitude: 18.0686,
    type: 'OSINT',
    confidence: 42,
    source: 'DARKWEB-MONITOR',
  },
  {
    title: 'Network Node Tango',
    description: 'Fiber optic splice detected on secure government cable. Duration of unauthorized access unknown. Physical inspection requested.',
    latitude: 51.5074,
    longitude: -0.1278,
    type: 'OSINT',
    confidence: 73,
    source: 'INFRA-WATCH',
  },
  {
    title: 'Open Source Corroboration — Maritime',
    description: 'Cross-referencing satellite images with public shipping manifests reveals 3-day discrepancy in vessel location reporting. Possible AIS spoofing.',
    latitude: -33.8688,
    longitude: 151.2093,
    type: 'OSINT',
    confidence: 60,
    source: 'MARITIME-INTEL',
  },

  // HUMINT
  {
    title: 'Ground Asset Report — Northern Route',
    description: 'Field operative confirmed movement of heavy vehicles along northern route. Estimated 6-8 units, military-grade cargo trucks. Movement at night only.',
    latitude: 40.7128,
    longitude: -74.0060,
    type: 'HUMINT',
    confidence: 88,
    source: 'ASSET-KILO',
  },
  {
    title: 'Informant Report — Warehouse District',
    description: 'Insider confirmed transfer of unidentified materials at warehouse complex in sector 4. Transfer occurred between 02:00-04:00 local time. 12 personnel present.',
    latitude: 19.0760,
    longitude: 72.8777,
    type: 'HUMINT',
    confidence: 79,
    source: 'ASSET-ECHO',
  },
  {
    title: 'Human Source — Regional Command',
    description: 'Defector confirms location of regional command structure in sub-basement level. Access requires biometric clearance. Skeleton crew of 8-10 operatives.',
    latitude: 48.8566,
    longitude: 2.3522,
    type: 'HUMINT',
    confidence: 91,
    source: 'DEFECTOR-W',
  },
  {
    title: 'Field Operative Lima — Safe House',
    description: 'Source reports new safe house established in residential block, 3rd floor corner unit. Used for bi-weekly meetings. Occupants rotate every 72 hours.',
    latitude: 41.0082,
    longitude: 28.9784,
    type: 'HUMINT',
    confidence: 70,
    source: 'ASSET-LIMA',
  },
  {
    title: 'Penetration Asset — Leadership Meeting',
    description: 'Embedded asset confirms scheduled meeting of regional leadership on the 15th. Location: local facility east of the river. Expected 6-8 high-value attendees.',
    latitude: -23.5505,
    longitude: -46.6333,
    type: 'HUMINT',
    confidence: 88,
    source: 'ASSET-ROMEO',
  },

  // IMINT
  {
    title: 'Satellite Imagery Delta-7',
    description: 'High-resolution imagery shows construction of new structure at grid reference 7-Delta. Dimensions 40m x 80m suggest industrial or storage use. 3 excavators on site.',
    latitude: 51.5074,
    longitude: -0.1278,
    type: 'IMINT',
    confidence: 95,
    source: 'KH-SAT-07',
  },
  {
    title: 'Aerial Recon — Convoy Dispersal',
    description: 'UAV footage shows vehicle convoy dispersal pattern consistent with evasion protocol. 9 vehicles split into 3 groups at the fork. Destination unknown.',
    latitude: 48.1351,
    longitude: 11.5820,
    type: 'IMINT',
    confidence: 88,
    source: 'UAV-DELTA',
  },
  {
    title: 'SAR Satellite Foxtrot — Underground',
    description: 'Synthetic aperture radar reveals underground structure estimated 40m depth, 200m length. Soil displacement patterns indicate recent excavation within 6 months.',
    latitude: 30.0444,
    longitude: 31.2357,
    type: 'IMINT',
    confidence: 97,
    source: 'SAR-SAT-F',
  },
  {
    title: 'Orbital Imagery — Maritime Expansion',
    description: 'New construction identified at maritime facility. Additional dock construction matches Type-4 submarine pen specifications. Estimated completion 6 months.',
    latitude: 37.5665,
    longitude: 126.9780,
    type: 'IMINT',
    confidence: 86,
    source: 'KH-SAT-12',
  },
  {
    title: 'Thermal Imaging — Personnel Activity',
    description: 'Thermal imaging reveals activity at suspected facility. Estimated 12-15 personnel. Heat signature from northern building suggests active generators or furnaces.',
    latitude: 31.7683,
    longitude: 35.2137,
    type: 'IMINT',
    confidence: 91,
    source: 'TIR-SAT-02',
  },
];

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to:', MONGO_URI);

  // Clear existing data
  const existing = await Intel.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  Found ${existing} existing records. Clearing...`);
    await Intel.deleteMany({});
    console.log('🗑️  Cleared existing data.');
  }

  // Insert sample data
  console.log(`📥 Inserting ${sampleData.length} intel points...`);
  const inserted = await Intel.insertMany(sampleData);

  console.log('\n✅ Database seeded successfully!');
  console.log(`   Total inserted: ${inserted.length}`);
  console.log(`   OSINT:  ${inserted.filter(d => d.type === 'OSINT').length} points`);
  console.log(`   HUMINT: ${inserted.filter(d => d.type === 'HUMINT').length} points`);
  console.log(`   IMINT:  ${inserted.filter(d => d.type === 'IMINT').length} points`);
  console.log('\n🚀 Start your server: npm run dev');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
