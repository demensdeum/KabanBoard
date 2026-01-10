const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const Column = require('../models/Column');
const Card = require('../models/Card');

const User = require('../models/User');
const { checkPermission } = require('../middleware/rbac');

// Default columns for new boards (fallback if not provided by client)
const DEFAULT_COLUMNS = ['New', 'In Progress', 'Done'];

// Helper to check if user has access to a specific board
const canAccessBoard = (user, boardId) => {
    if (user.isAdmin || user.role === 'admin') return true;
    return user.allowedBoards.some(id => id.toString() === boardId.toString());
};

// Get all boards
router.get('/', async (req, res) => {
    try {
        // If auth is disabled (req.user undefined), return all boards
        if (!req.user) {
            const boards = await Board.find().sort({ createdAt: -1 });
            return res.json(boards);
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            // Token might be stale (user deleted), force re-login or return empty
            return res.status(401).json({ error: 'User not found' });
        }

        let query = {};

        if (!user.isAdmin && user.role !== 'admin') {
            query._id = { $in: user.allowedBoards };
        }

        const boards = await Board.find(query).sort({ createdAt: -1 });
        res.json(boards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new board
router.post('/', checkPermission('canManageBoards'), async (req, res) => {
    try {
        const board = new Board({ name: req.body.name });
        await board.save();

        // Use columns from request or fall back to defaults
        const columnNames = req.body.columns || DEFAULT_COLUMNS;

        // Create default columns
        for (let i = 0; i < columnNames.length; i++) {
            const column = new Column({
                title: columnNames[i],
                boardId: board._id,
                order: i
            });
            await column.save();
        }

        // Auto-add new board to creator's access list if they are not global admin
        if (req.user) {
            const user = await User.findById(req.user.userId);
            if (user && !user.isAdmin && user.role !== 'admin') {
                user.allowedBoards.push(board._id);
                await user.save();
            }
        }

        res.status(201).json(board);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get single board
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!canAccessBoard(user, req.params.id)) {
            return res.status(403).json({ error: 'Access denied to this board' });
        }

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
router.put('/:id', checkPermission('canManageBoards'), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!canAccessBoard(user, req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const board = await Board.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true }
        );
        res.json(board);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete board
router.delete('/:id', checkPermission('canManageBoards'), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!canAccessBoard(user, req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ error: 'Board not found' });

        const columns = await Column.find({ boardId: board._id });
        for (const column of columns) {
            await Card.deleteMany({ columnId: column._id });
        }
        await Column.deleteMany({ boardId: board._id });
        await Board.findByIdAndDelete(req.params.id);

        res.json({ message: 'Board deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
