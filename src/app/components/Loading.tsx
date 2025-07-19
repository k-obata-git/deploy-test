'use client';

import { Container, Spinner } from 'react-bootstrap';

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Container className="d-flex flex-column align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <p>読み込み中</p>
      </Container>
    </div>
  );
}
