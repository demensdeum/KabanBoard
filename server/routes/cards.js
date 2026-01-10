const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// Create new card
router.post('/', async (req, res) => {
    try {
        const { title, description, columnId, color } = req.body;

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
router.put('/:id', async (req, res) => {
    try {
        const { title, description, color } = req.body;
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { title, description, color },
            { new: true }
        );
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete card
router.delete('/:id', async (req, res) => {
    try {
        const card = await Card.findByIdAndDelete(req.params.id);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json({ message: 'Card deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Move card to different column
router.put('/:id/move', async (req, res) => {
    try {
        const { columnId, order } = req.body;
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { columnId, order },
            { new: true }
        );
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Batch update cards order
router.put('/batch/reorder', async (req, res) => {
    try {
        const { cards } = req.body; // Array of { id, columnId, order }

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
