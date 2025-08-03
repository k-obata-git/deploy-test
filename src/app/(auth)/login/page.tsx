'use client';

import { Container, Button, Card, Form, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { BlockingOverlay } from '@/app/components/BlockingOverlay';

export default function LoginPage() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if(status == "authenticated" && session?.user.id) {
      router.push('/dashboard');
    }
  }, [status]);

  const handleLogin = async(event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn("credentials", {
        redirect: false,
        username,
        password,
      }).then(res => {
        if (res?.error) {
          setValidated(false);
          setError('入力内容をご確認ください。');
        } else {
          setUsername('');
          setPassword('');
          setError('')
          router.push('/dashboard');
        }
      })
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <>
        {isSubmitting && (
          <div className="position-relative">
            <BlockingOverlay />
          </div>
        )}
      </>
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: 1080 }}>
        <Card className="w-100 shadow-sm p-4 text-center bg-white">
          <Form className="text-start mt-4" noValidate validated={validated} onSubmit={handleLogin}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>ユーザID</Form.Label>
              <Form.Control
                type="text"
                value={username}
                placeholder="Enter your user ID"
                onChange={(e) => setUsername(e.target.value)}
                className='mb-2'
                required
              />
              <Form.Label>パスワード</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-grid">
              <Button variant="primary" type="submit">ログインする</Button>
            </div>
          </Form>
        </Card>
      </Container>
    </>
  );
}
