const express = require('express');
const router = express.Router();
const Column = require('../models/Column');
const Card = require('../models/Card');

// Create new column
router.post('/', async (req, res) => {
    try {
        const { title, boardId } = req.body;

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
router.put('/:id', async (req, res) => {
    try {
        const column = await Column.findByIdAndUpdate(
            req.params.id,
            { title: req.body.title },
            { new: true }
        );
        if (!column) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.json(column);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete column and its cards
router.delete('/:id', async (req, res) => {
    try {
        const column = await Column.findById(req.params.id);
        if (!column) {
            return res.status(404).json({ error: 'Column not found' });
        }

        // Delete all cards in this column
        await Card.deleteMany({ columnId: column._id });

        // Delete the column
        await Column.findByIdAndDelete(req.params.id);

        res.json({ message: 'Column deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reorder columns
router.put('/:id/reorder', async (req, res) => {
    try {
        const { order } = req.body;
        const column = await Column.findByIdAndUpdate(
            req.params.id,
            { order },
            { new: true }
        );
        if (!column) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.json(column);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
