'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { Question, Template } from '../../../../types/formType';
import TemplateTab from '@/app/components/admin/TemplateTab';
import MasterQuestionTab from '@/app/components/admin/MasterQuestionTab';
import BlockingOverlay from '@/app/components/BlockingOverlay';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

export default function AdminPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [key, setKey] = useState('questions');

  useEffect(() => {
    if(!session?.user.isAdmin) {
      router.replace('/dashboard');
    }

    (async() => {
      await fetchQuestions();
      await fetchTemplates();
      setLoading(false);
    })()
  }, []);

  const fetchQuestions = async () => {
    const res = await fetch('/api/admin/master-questions');
    if(res.ok) {
      const data = await res.json();
      setQuestions(data);
    }
  };

  const fetchTemplates = async () => {
    const res = await fetch('/api/admin/templates');
    if(res.ok) {
      const data = await res.json();
      setTemplates(data);
    }
  };

  return (session?.user.isAdmin &&
    <>
      <>
        {loading && (
          <div className="position-relative">
            <BlockingOverlay type={"loading"} />
          </div>
        )}
      </>
      <Container>
        <h2>管理者ダッシュボード</h2>
        <div className="mt-4">
          <Tabs activeKey={key} onSelect={(k) => setKey(k || 'questions')} className="mb-3">
            <Tab eventKey="questions" title="マスタ質問">
              <MasterQuestionTab isMobile={isMobile} questions={questions} reload={fetchQuestions} />
            </Tab>
            <Tab eventKey="templates" title="テンプレート">
              <TemplateTab isMobile={isMobile} templates={templates} reload={fetchTemplates} />
            </Tab>
          </Tabs>
        </div>
      </Container>
    </>
  );
}
