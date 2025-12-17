const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const MONGODB_URI = 'mongodb://localhost:27017/kaban-board';

async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const server = new ApolloServer({
            typeDefs,
            resolvers,
        });

        const { url } = await startStandaloneServer(server, {
            listen: { port: 4000 },
        });

        console.log(`🚀  Server ready at: ${url}`);
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

startServer();
