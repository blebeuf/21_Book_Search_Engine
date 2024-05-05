const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { expressMiddleware } = require('@apollo/server/express4');
const { authMiddleware } = require('./utils/auth');
const path = require('path');

const { typeDefs, resolvers } = require('./schemas');

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

// apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// If in production, serve client/dist as static assets
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server,{
    context:authMiddleware
  }));
  
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
  
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();
