const { AuthenticationError } = require('apollo-server-express'); // Import necessary modules
const { User } = require('../models'); // Import User model
const { signToken } = require('../utils/auth'); // Import utility for signing tokens

const resolvers = {
    Query: {
        // Define the resolver for the "me" query
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).select('-__v -password');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },

    Mutation: {
        // Define the resolver for adding a new user
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            // Generate a token for the new user
            const token = signToken(user);
            // Return the token and user object
            return { token, user };
        },

        // Define the resolver for user login
        login: async (parent, { email, password }) => {
            // Find a user by their email address
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('User not found. Do you have an account?');
            }

            // Check if the provided password matches the user's password
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials!');
            }
            // Generate a token for the user
            const token = signToken(user);
            return { token, user };
        },

        // Define the resolver for saving a book
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                // If the user is authenticated, update their saved books
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: newBook } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        // Define the resolver for removing a book
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                // If the user is authenticated, remove the specified book
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Login required!');
        },
    },

    // Define a resolver for the User type
    User: {
        // Calculate the number of saved books for a user
        bookCount: (parent) => parent.savedBooks.length,
    },
};

module.exports = resolvers; 
