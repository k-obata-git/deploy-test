'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container, Navbar, NavbarBrand, Nav, Dropdown } from 'react-bootstrap';
import BreadcrumbsAuto from '../components/BreadcrumbsAuto';

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if(status !== "authenticated" && status !== "loading") {
      router.replace('/login');
      return;
    } else {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then(() => console.log('Service Worker registered'))
          .catch((err) => console.error('SW登録失敗:', err));
      }
    }
  }, [status]);

  const logout = () => {
    if(status === "authenticated") {
      signOut({ callbackUrl: "/login" })
    }
  }

  if(status === "authenticated") {
    return (
      <>
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <NavbarBrand>QuickForm</NavbarBrand>
            <Nav className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark" id="dropdown-basic" style={{maxWidth: "12rem"}} className="d-flex align-items-center">
                  <p className="m-0 text-truncate">{session?.user.userName}</p>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item href="/dashboard">ダッシュボード</Dropdown.Item>
                  {session?.user.isAdmin && (
                    <Dropdown.Item href="/admin">管理者ダッシュボード</Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>ログアウト</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Container>
        </Navbar>
        <Container className="py-2">
          <BreadcrumbsAuto />
        </Container>

        <Container className="py-3">
          {children}
        </Container>
      </>
    )
  } else {
    return <></>
  }
}
