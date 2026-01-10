const User = require('../models/User');

const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            // No users exist = auth disabled = allow all
            const userCount = await User.countDocuments();
            if (userCount === 0) return next();

            // req.user is set by authMiddleware
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Global admin has all permissions
            if (user.isAdmin || user.role === 'admin') return next();

            // Check specific permission flag
            if (user[permission]) return next();

            res.status(403).json({ error: `Permission denied: ${permission} required` });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
};

module.exports = { checkPermission };
