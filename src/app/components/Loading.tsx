'use client';

import { Container, Spinner } from 'react-bootstrap';

export default function Loading() {
  return (
    <>
      <Container className="d-flex flex-column align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <p>読み込み中</p>
      </Container>
    </>
  );
}
