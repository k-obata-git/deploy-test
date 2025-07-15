import { Container } from 'react-bootstrap';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ maxWidth: 1080 }}>
        <img src="/logo.svg" alt="Company Logo" style={{ height: '80px' }} />
        <p className="text-muted mb-4">誰でもかんたんに、美しいフォームを作成・共有・管理</p>

        <Container className="py-5">
          {children}
        </Container>
        <p className="text-muted mt-5" style={{ fontSize: '0.9rem' }}>© 2025 QuickForm. フォーム作成をもっとかんたんに。</p>
      </Container>
    </>
  );
}
