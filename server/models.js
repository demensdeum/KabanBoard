const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    labels: [{ type: String }]
});

const columnSchema = new mongoose.Schema({
    title: { type: String, required: true },
    cards: [cardSchema]
});

const boardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    columns: [columnSchema]
});

const Board = mongoose.model('Board', boardSchema);

module.exports = { Board };
