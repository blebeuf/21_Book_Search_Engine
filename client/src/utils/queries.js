import { gql } from '@apollo/client';

// Define queries and mutations
export const GET_ME = gql`
  query GetMe {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        title
      }
    }
  }
`;