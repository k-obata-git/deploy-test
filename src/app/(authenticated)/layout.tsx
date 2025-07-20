'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container, Navbar, NavbarBrand, Nav, NavItem } from 'react-bootstrap';
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
              <NavItem onClick={logout} style={{color: "#fff", cursor: "pointer"}}><span>ログアウト</span></NavItem>
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
