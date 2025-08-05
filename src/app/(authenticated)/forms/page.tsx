'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Row, Col, SplitButton, Dropdown, Alert } from 'react-bootstrap';
import { FormType, Template } from '../../../../types/formType';
import ConfirmModal from '@/app/components/ConfirmModal';
import ShareActionsModal from '@/app/components/ShareActionsModal';
import TemplateSelectModal from '@/app/components/TemplateSelectModal';
import BlockingOverlay from '@/app/components/BlockingOverlay';

export default function FormListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareActionsModal, setShowShareActionsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    (async() => {
      await getForms();
      setLoading(false);
    })()
  }, []);

  const getForms = () => {
    fetch('/api/forms', {
      method: 'GET',
    }).then((res) => {
      if(res.ok) {
        return res.json();
      } else {
        setError("取得に失敗しました");
      }
    }).then((data) => {
      setForms(data);
    });
  }

  const handleTemplateSelect = (template: Template) => {
    setShowTemplateModal(false);
    router.push(`/forms/new?templateId=${template.id}`)
  };

  const handleDeleteConfirm = () => {
    if (!selectedForm) return;

    setShowModal(false);
    setIsSubmitting(true);
    fetch(`/api/forms/${selectedForm.id}`, {
      method: 'DELETE',
    }).then((res) => {
      if(res.ok) {
        getForms();
        setError("");
      } else {
        setError("削除に失敗しました");
      }
    }).finally(() => {
      setIsSubmitting(false);
    })
  }

  return (
    <>
      {loading && (
        <div className="position-relative">
          <BlockingOverlay type={"loading"} />
        </div>
      )}
      {isSubmitting && (
        <div className="position-relative">
          <BlockingOverlay type={"processing"} />
        </div>
      )}
      <h2>フォーム一覧</h2>
      <div className="d-flex justify-content-end mb-4">
        <SplitButton variant="outline-primary" title="新規フォーム作成" id="add-question-split" onClick={() => router.push('/forms/new')}>
          <Dropdown.Item onClick={() => setShowTemplateModal(true)}>テンプレートから作成</Dropdown.Item>
        </SplitButton>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {forms?.length === 0 ? (
          <p>まだフォームが作成されていません。</p>
        ) : (
          forms?.map((form) => (
            <Col key={form.id} lg={6} xl={4} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex gap-2">
                      <Card.Title className="text-truncate">{form.title}</Card.Title>
                    <div className="ms-auto">
                      <Button size="sm" variant="outline-secondary" className="text-nowrap" onClick={() => { setSelectedForm(form), setShowShareActionsModal(true) }} disabled={!form.isPublic}>共有</Button>
                    </div>
                  </div>
                  <Card.Text className="text-truncate">{form.description ?? "-"}</Card.Text>
                  <Card.Text className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>作成日: {new Date(form.createdAt).toLocaleDateString()}</Card.Text>
                  <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>回答数: {form.responses?.length}件</Card.Text>
                  <div className="d-flex gap-2">
                    <div className="flex-grow-1">
                      <Button size="sm" variant="outline-danger" className="text-nowrap" onClick={() => { setSelectedForm(form), setShowModal(true) }}>削除</Button>
                    </div>
                    <Button size="sm" variant="outline-secondary" className="text-nowrap" onClick={() => router.push(`/forms/${form.id}/results`)}>回答結果</Button>
                    <Button size="sm" variant="outline-secondary" className="text-nowrap" onClick={() => router.push(`/forms/${form.id}/preview`)}>プレビュー</Button>
                    <Button size="sm" variant="outline-primary" className="text-nowrap" onClick={() => router.push(`/forms/${form.id}/edit`)}>編集</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <ConfirmModal show={showModal} onClose={() => setShowModal(false)} onConfirm={handleDeleteConfirm} itemName={selectedForm?.title} />
      <ShareActionsModal show={showShareActionsModal} onHide={() => setShowShareActionsModal(false)} formUrl={`${new URL(window.location.href).origin}/public/${selectedForm?.id.toString()}`} />
      <TemplateSelectModal show={showTemplateModal} onClose={() => setShowTemplateModal(false)} onSelect={handleTemplateSelect} />
    </>
  );
}
