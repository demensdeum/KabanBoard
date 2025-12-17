const { Board } = require('./models');

const resolvers = {
    Query: {
        getBoards: async () => {
            return await Board.find();
        },
        getBoard: async (_, { id }) => {
            return await Board.findById(id);
        },
    },
    Mutation: {
        createBoard: async (_, { title }) => {
            const newBoard = new Board({ title, columns: [] });
            return await newBoard.save();
        },
        deleteBoard: async (_, { id }) => {
            await Board.findByIdAndDelete(id);
            return true;
        },
        addColumn: async (_, { boardId, title }) => {
            const board = await Board.findById(boardId);
            if (!board) throw new Error('Board not found');

            const newColumn = { title, cards: [] };
            board.columns.push(newColumn);
            await board.save();
            return board.columns[board.columns.length - 1];
        },
        deleteColumn: async (_, { boardId, columnId }) => {
            const board = await Board.findById(boardId);
            if (!board) throw new Error('Board not found');

            board.columns.pull(columnId);
            await board.save();
            return true;
        },
        addCard: async (_, { boardId, columnId, title }) => {
            const board = await Board.findById(boardId);
            if (!board) throw new Error('Board not found');

            const column = board.columns.id(columnId);
            if (!column) throw new Error('Column not found');

            const newCard = { title, description: '', labels: [] };
            column.cards.push(newCard);
            await board.save();
            return column.cards[column.cards.length - 1]; // Return the last added card with ID
        },
        updateCard: async (_, { boardId, columnId, cardId, title, description }) => {
            const board = await Board.findById(boardId);
            if (!board) throw new Error('Board not found');

            const column = board.columns.id(columnId);
            if (!column) throw new Error('Column not found');

            const card = column.cards.id(cardId);
            if (!card) throw new Error('Card not found');

            if (title !== undefined) card.title = title;
            if (description !== undefined) card.description = description;

            await board.save();
            return card;
        },
        deleteCard: async (_, { boardId, columnId, cardId }) => {
            const board = await Board.findById(boardId);
            if (!board) throw new Error('Board not found');
            const column = board.columns.id(columnId);
            if (!column) throw new Error('Column not found');

            column.cards.pull(cardId);
            await board.save();
            return true;
        },
        moveCard: async (_, { boardId, fromColumnId, toColumnId, cardId, index }) => {
            const board = await Board.findById(boardId);
            if (!board) throw new Error('Board not found');

            const fromColumn = board.columns.id(fromColumnId);
            const toColumn = board.columns.id(toColumnId);

            if (!fromColumn || !toColumn) throw new Error('Column not found');

            const card = fromColumn.cards.id(cardId);
            if (!card) throw new Error('Card not found');

            // Remove from source
            fromColumn.cards.pull(cardId);

            // Add to destination at specific index
            // Mongoose doesn't have a simple 'insert at index' for subdocs array easily without full reassign or splice
            // We can use JS splice on the array

            if (fromColumnId === toColumnId) {
                // Same column move
                toColumn.cards.splice(index, 0, card);
            } else {
                // Different column move
                toColumn.cards.splice(index, 0, card);
            }

            await board.save();
            return board;
        }
    }
};

module.exports = resolvers;
