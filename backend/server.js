const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// API Routes
const apiRoutes = require('./routes/api');
const hotelRoutes = require('./routes/hotels');
const eventRoutes = require('./routes/events');
const archiveRoutes = require('./routes/archives'); // ← NEW

app.use('/api', apiRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/archives', archiveRoutes); // ← NEW

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/map.html'));
});

app.get('/hotels', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/hotels.html'));
});

app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/calendar.html'));
});

app.get('/archives', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/archives.html'));
}); // ← NEW

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Virtual Tours Page
app.get('/vtour', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/vtour.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🏔️  MONASTERY 360 - API Server'.padStart(35));
    console.log('='.repeat(50));
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('\n📍 Available Routes:');
    console.log(`   🏠 Home:      http://localhost:${PORT}/`);
    console.log(`   🗺️  Map:       http://localhost:${PORT}/map`);
    console.log(`   🏨 Hotels:    http://localhost:${PORT}/hotels`);
    console.log(`   📅 Calendar:  http://localhost:${PORT}/calendar`);
    console.log(`   📚 Archives:  http://localhost:${PORT}/archives`);
    console.log('\n🔌 API Endpoints:');
    console.log(`   📡 Monasteries: http://localhost:${PORT}/api/monasteries`);
    console.log(`   🏨 Hotels:      http://localhost:${PORT}/api/hotels`);
    console.log(`   📅 Events:      http://localhost:${PORT}/api/events`);
    console.log(`   📚 Archives:    http://localhost:${PORT}/api/archives`);
    console.log('='.repeat(50) + '\n');
});
