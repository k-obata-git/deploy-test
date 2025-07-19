'use client';

import { Container, Spinner } from 'react-bootstrap';

export const BlockingOverlay = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >

    <Container className="d-flex flex-column align-items-center justify-content-center">
      <Spinner animation="border" variant="primary" />
      <p>処理中</p>
    </Container>
  </div>
);
