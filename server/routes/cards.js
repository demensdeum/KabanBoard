const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

const Column = require('../models/Column');
const User = require('../models/User');
const { checkPermission } = require('../middleware/rbac');

// Helper to check if user has access to a specific board
const canAccessBoardByColumn = async (userId, columnId) => {
    const column = await Column.findById(columnId);
    if (!column) return false;
    const user = await User.findById(userId);
    if (user.isAdmin || user.role === 'admin') return true;
    return user.allowedBoards.some(id => id.toString() === column.boardId.toString());
};

// Create new card
router.post('/', checkPermission('canManageTasks'), async (req, res) => {
    try {
        const { title, description, columnId, color } = req.body;

        if (!await canAccessBoardByColumn(req.user.userId, columnId)) {
            return res.status(403).json({ error: 'Access denied to this board' });
        }

        // Get the highest order for this column
        const lastCard = await Card.findOne({ columnId }).sort({ order: -1 });
        const order = lastCard ? lastCard.order + 1 : 0;

        const card = new Card({ title, description, columnId, color, order });
        await card.save();

        res.status(201).json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update card
router.put('/:id', checkPermission('canManageTasks'), async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });

        if (!await canAccessBoardByColumn(req.user.userId, card.columnId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { title, description, color } = req.body;
        card.title = title || card.title;
        card.description = description || card.description;
        card.color = color || card.color;

        await card.save();
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete card
router.delete('/:id', checkPermission('canManageTasks'), async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });

        if (!await canAccessBoardByColumn(req.user.userId, card.columnId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await Card.findByIdAndDelete(req.params.id);
        res.json({ message: 'Card deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Move card to different column
router.put('/:id/move', checkPermission('canManageTasks'), async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).json({ error: 'Card not found' });

        const { columnId, order } = req.body;
        // Check access to both current and target columns
        if (!await canAccessBoardByColumn(req.user.userId, card.columnId) ||
            !await canAccessBoardByColumn(req.user.userId, columnId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        card.columnId = columnId;
        card.order = order;
        await card.save();
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Batch update cards order
router.put('/batch/reorder', checkPermission('canManageTasks'), async (req, res) => {
    try {
        const { cards } = req.body; // Array of { id, columnId, order }

        for (const c of cards) {
            if (!await canAccessBoardByColumn(req.user.userId, c.columnId)) {
                return res.status(403).json({ error: 'Access denied to one or more boards' });
            }
        }

        const updates = cards.map(({ id, columnId, order }) =>
            Card.findByIdAndUpdate(id, { columnId, order })
        );

        await Promise.all(updates);
        res.json({ message: 'Cards reordered' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
