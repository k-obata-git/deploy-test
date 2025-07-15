'use client';

import { Container, Button, Card, Form, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if(status == "authenticated" && session?.user.id) {
      router.push('/dashboard');
    }
  }, [status]);

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();

    try {
      'use server'
      await signIn("credentials", {
        redirect: false,
        username,
        password,
      }).then(res => {
        if (res?.error) {
          setError('入力内容をご確認ください。');
        } else {
          setUsername('');
          setPassword('');
          setError('')
          router.push('/dashboard');
        }
      })
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <>
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: 1080 }}>
        <Card className="w-100 shadow-sm p-4 text-center bg-white">
          <Form onSubmit={handleLogin} className="text-start mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>ユーザID</Form.Label>
              <Form.Control
                type="text"
                value={username}
                placeholder="Enter your user ID"
                onChange={(e) => setUsername(e.target.value)}
                className='mb-2'
              />
              <Form.Label>パスワード</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <div className="d-grid">
              <Button variant="primary" type="submit">
                ログインする
              </Button>
            </div>
          </Form>
        </Card>
      </Container>
    </>
  );
}
