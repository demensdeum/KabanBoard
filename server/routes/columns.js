const express = require('express');
const router = express.Router();
const Column = require('../models/Column');
const Card = require('../models/Card');

const User = require('../models/User');
const { checkPermission } = require('../middleware/rbac');

// Helper to check if user has access to a specific board
const canAccessBoard = async (userId, boardId) => {
    const user = await User.findById(userId);
    if (user.isAdmin || user.role === 'admin') return true;
    return user.allowedBoards.some(id => id.toString() === boardId.toString());
};

// Create new column
router.post('/', checkPermission('canManageBoards'), async (req, res) => {
    try {
        const { title, boardId } = req.body;

        if (!await canAccessBoard(req.user.userId, boardId)) {
            return res.status(403).json({ error: 'Access denied to this board' });
        }

        // Get the highest order for this board
        const lastColumn = await Column.findOne({ boardId }).sort({ order: -1 });
        const order = lastColumn ? lastColumn.order + 1 : 0;

        const column = new Column({ title, boardId, order });
        await column.save();

        res.status(201).json({ ...column.toObject(), cards: [] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update column
router.put('/:id', checkPermission('canManageBoards'), async (req, res) => {
    try {
        const column = await Column.findById(req.params.id);
        if (!column) return res.status(404).json({ error: 'Column not found' });

        if (!await canAccessBoard(req.user.userId, column.boardId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        column.title = req.body.title || column.title;
        await column.save();
        res.json(column);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete column and its cards
router.delete('/:id', checkPermission('canManageBoards'), async (req, res) => {
    try {
        const column = await Column.findById(req.params.id);
        if (!column) return res.status(404).json({ error: 'Column not found' });

        if (!await canAccessBoard(req.user.userId, column.boardId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Delete all cards in this column
        await Card.deleteMany({ columnId: column._id });
        await Column.findByIdAndDelete(req.params.id);

        res.json({ message: 'Column deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reorder columns
router.put('/:id/reorder', checkPermission('canManageBoards'), async (req, res) => {
    try {
        const column = await Column.findById(req.params.id);
        if (!column) return res.status(404).json({ error: 'Column not found' });

        if (!await canAccessBoard(req.user.userId, column.boardId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        column.order = req.body.order;
        await column.save();
        res.json(column);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
