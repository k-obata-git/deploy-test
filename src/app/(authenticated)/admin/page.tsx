'use client';

import MasterQuestionTab from '@/app/components/admin/MasterQuestionTab';
import TemplateTab from '@/app/components/admin/TemplateTab';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [key, setKey] = useState('questions');

  useEffect(() => {
    if(!session?.user.isAdmin) {
      router.replace('/dashboard');
    }
  }, []);

  return (session?.user.isAdmin &&
    <Container>
      <h2>管理者ダッシュボード</h2>
      <div className="mt-4">
        <Tabs activeKey={key} onSelect={(k) => setKey(k || 'questions')} className="mb-3">
          <Tab eventKey="questions" title="マスタ質問">
            <MasterQuestionTab />
          </Tab>
          <Tab eventKey="templates" title="テンプレート">
            <TemplateTab />
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}
