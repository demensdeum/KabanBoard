const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const boardRoutes = require('./routes/boards');
const columnRoutes = require('./routes/columns');
const cardRoutes = require('./routes/cards');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaban';

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/boards', authMiddleware, boardRoutes);
app.use('/api/columns', authMiddleware, columnRoutes);
app.use('/api/cards', authMiddleware, cardRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
