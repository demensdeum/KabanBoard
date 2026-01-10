const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'kaban-secret-key-change-in-production';

// Get auth status
router.get('/status', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({
            authEnabled: userCount > 0,
            hasAdmin: userCount > 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enable auth (create first admin)
router.post('/enable', async (req, res) => {
    try {
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            return res.status(400).json({ error: 'Authentication already enabled' });
        }

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        if (password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }

        const user = new User({
            username,
            passwordHash: password,
            role: 'admin'
        });
        await user.save();

        res.status(201).json({ message: 'Authentication enabled', username: user.username });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Disable auth (delete all users)
router.post('/disable', async (req, res) => {
    try {
        // Verify current user is admin via token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        await User.deleteMany({});
        res.json({ message: 'Authentication disabled' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { username: user.username, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ username: user.username, role: user.role });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
