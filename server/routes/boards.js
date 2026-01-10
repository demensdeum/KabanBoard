const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const Column = require('../models/Column');
const Card = require('../models/Card');

// Default columns for new boards
const DEFAULT_COLUMNS = ['New', 'In Progress', 'Done'];

// Get all boards
router.get('/', async (req, res) => {
    try {
        const boards = await Board.find().sort({ createdAt: -1 });
        res.json(boards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new board with default columns
router.post('/', async (req, res) => {
    try {
        const board = new Board({ name: req.body.name });
        await board.save();

        // Create default columns
        for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
            const column = new Column({
                title: DEFAULT_COLUMNS[i],
                boardId: board._id,
                order: i
            });
            await column.save();
        }

        res.status(201).json(board);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get single board with columns and cards
router.get('/:id', async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const columns = await Column.find({ boardId: board._id }).sort({ order: 1 });

        const columnsWithCards = await Promise.all(
            columns.map(async (column) => {
                const cards = await Card.find({ columnId: column._id }).sort({ order: 1 });
                return {
                    ...column.toObject(),
                    cards
                };
            })
        );

        res.json({
            ...board.toObject(),
            columns: columnsWithCards
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update board
router.put('/:id', async (req, res) => {
    try {
        const board = await Board.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }
        res.json(board);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete board and all its columns and cards
router.delete('/:id', async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        // Delete all cards in columns of this board
        const columns = await Column.find({ boardId: board._id });
        for (const column of columns) {
            await Card.deleteMany({ columnId: column._id });
        }

        // Delete all columns
        await Column.deleteMany({ boardId: board._id });

        // Delete the board
        await Board.findByIdAndDelete(req.params.id);

        res.json({ message: 'Board deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
