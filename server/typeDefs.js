const typeDefs = `#graphql
  type Card {
    id: ID!
    title: String!
    description: String
    labels: [String]
  }

  type Column {
    id: ID!
    title: String!
    cards: [Card]!
  }

  type Board {
    id: ID!
    title: String!
    columns: [Column]!
  }

  type Query {
    getBoards: [Board]
    getBoard(id: ID!): Board
  }

  type Mutation {
    createBoard(title: String!): Board
    deleteBoard(id: ID!): Boolean
    
    addColumn(boardId: ID!, title: String!): Column
    deleteColumn(boardId: ID!, columnId: ID!): Boolean
    
    addCard(boardId: ID!, columnId: ID!, title: String!): Card
    updateCard(boardId: ID!, columnId: ID!, cardId: ID!, title: String, description: String): Card
    deleteCard(boardId: ID!, columnId: ID!, cardId: ID!): Boolean
    
    moveCard(boardId: ID!, fromColumnId: ID!, toColumnId: ID!, cardId: ID!, index: Int!): Board
  }
`;

module.exports = typeDefs;
