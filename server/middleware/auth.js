const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'kaban-secret-key-change-in-production';

const authMiddleware = async (req, res, next) => {
    try {
        // Check if auth is enabled
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            // No users = auth disabled, allow all
            return next();
        }

        // Auth is enabled, check token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
