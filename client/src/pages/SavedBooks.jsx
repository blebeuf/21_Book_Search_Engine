import { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Row, 
  Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from "../utils/queries"; // Import queries from queries.js
import { REMOVE_BOOK } from "../utils/mutations"; // Correctly import mutations from mutations.js
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';



const SavedBooks = () => {
  const { loading, data, error, refetch } = useQuery(GET_ME, {
    fetchPolicy: "cache-and-network"
  });

  const [removeBook, { error: mutationError }] = useMutation(REMOVE_BOOK, {
    onError: (error) => console.error("Error removing book:", error),
    onCompleted: (data) => {
      refetch(); // Refetch user data
      removeBookId(data.removeBook.bookId); // Assuming this mutation returns the id of the removed book
    }
  });

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      console.error("User must be logged in to delete a book.");
      return;
    }

    try {
      await removeBook({ variables: { bookId } });
    } catch (err) {
      console.error("Error in deleting book:", err);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    console.error('GraphQL query error:', error);
    return <h2>Error loading your books. Please try again later.</h2>;
  }

  if (!data || !data.me || !data.me.savedBooks) {
    return <h2>No data found. Please log in again or check if you have saved books.</h2>;
  }

  const { savedBooks } = data.me;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {savedBooks.length
            ? `Viewing ${savedBooks.length} saved ${savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {savedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border='dark'>
                {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
