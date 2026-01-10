const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

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
            role: 'admin',
            isAdmin: true,
            canManageUsers: true,
            canManageBoards: true,
            canManageTasks: true
        });
        await user.save();

        res.status(201).json({ message: 'Authentication enabled', username: user.username });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Disable auth (delete all users)
router.post('/disable', authMiddleware, checkPermission('isAdmin'), async (req, res) => {
    try {
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
            {
                userId: user._id,
                username: user.username,
                role: user.role,
                isAdmin: user.isAdmin,
                canManageUsers: user.canManageUsers,
                canManageBoards: user.canManageBoards,
                canManageTasks: user.canManageTasks
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                username: user.username,
                role: user.role,
                isAdmin: user.isAdmin,
                canManageUsers: user.canManageUsers,
                canManageBoards: user.canManageBoards,
                canManageTasks: user.canManageTasks,
                allowedBoards: user.allowedBoards
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            username: user.username,
            role: user.role,
            isAdmin: user.isAdmin,
            canManageUsers: user.canManageUsers,
            canManageBoards: user.canManageBoards,
            canManageTasks: user.canManageTasks,
            allowedBoards: user.allowedBoards
        });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// User Management (Admin only)
router.get('/users', authMiddleware, checkPermission('canManageUsers'), async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/users', authMiddleware, checkPermission('canManageUsers'), async (req, res) => {
    try {
        const { username, password, permissions, allowedBoards } = req.body;
        const user = new User({
            username,
            passwordHash: password,
            ...permissions,
            allowedBoards
        });
        await user.save();
        res.status(201).json({ _id: user._id, username: user.username });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/users/:id', authMiddleware, checkPermission('canManageUsers'), async (req, res) => {
    try {
        const { username, password, permissions, allowedBoards } = req.body;
        const userToUpdate = await User.findById(req.params.id);

        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent self-demotion from isAdmin or canManageUsers
        if (req.user.userId === req.params.id) {
            if (userToUpdate.isAdmin && permissions && permissions.isAdmin === false) {
                return res.status(400).json({ error: 'Cannot remove your own admin status' });
            }
            if (userToUpdate.canManageUsers && permissions && permissions.canManageUsers === false) {
                return res.status(400).json({ error: 'Cannot remove your own user management permissions' });
            }
        }

        userToUpdate.username = username || userToUpdate.username;
        if (password) {
            userToUpdate.passwordHash = password;
        }

        if (permissions) {
            Object.keys(permissions).forEach(key => {
                userToUpdate[key] = permissions[key];
            });
        }

        if (allowedBoards) {
            userToUpdate.allowedBoards = allowedBoards;
        }

        await userToUpdate.save();
        res.json({ _id: userToUpdate._id, username: userToUpdate.username });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/users/:id', authMiddleware, checkPermission('canManageUsers'), async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (userToDelete?.isAdmin) {
            return res.status(400).json({ error: 'Cannot delete superuser' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
