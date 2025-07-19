'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import ConfirmModal from '@/app/components/ConfirmModal';
import Loading from '@/app/components/Loading';
import { FormType } from '../../../../types/formType';
import { BlockingOverlay } from '@/app/components/BlockingOverlay';

export default function FormListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getForms();
  }, []);

  const handleDeleteConfirm = async() => {
    if (!selectedForm) return;

    setIsSubmitting(true);
    const res = await fetch(`/api/forms/${selectedForm.id}`, {
      method: 'DELETE',
    });

    setIsSubmitting(false);

    if (res.ok) {
      setShowModal(false);
      getForms();
    }
  };

  const getForms = async() => {
    fetch('/api/forms')
      .then((res) => res.json())
      .then((data) => {
        setForms(data);
        setLoading(false);
      });
  }

  if (loading){
    return <Loading />
  }

  if(isSubmitting) {
    return (
      <div className="position-relative">
        <BlockingOverlay />
      </div>
    )
  }

  return (
    <Container className="">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>フォーム一覧</h2>
        <Button onClick={() => router.push('/forms/new')}>新規フォーム作成</Button>
      </div>

      <Row>
        {forms.length === 0 ? (
          <p>まだフォームが作成されていません。</p>
        ) : (
          forms.map((form) => (
            <Col key={form.id} md={6} lg={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title className="text-truncate">{form.title}</Card.Title>
                  <Card.Text className="text-truncate">{form.description ?? "-"}</Card.Text>
                  <Card.Text className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>作成日: {new Date(form.createdAt).toLocaleDateString()}</Card.Text>
                  <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>回答数: {form.responses?.length}件</Card.Text>
                  <div className="d-flex gap-2">
                    <div className="flex-grow-1">
                      <Button size="sm" variant="outline-danger" onClick={() => { setSelectedForm(form), setShowModal(true) }}>削除</Button>
                    </div>
                    <Button size="sm" variant="outline-secondary" onClick={() => router.push(`/forms/${form.id}/results`)}>回答結果</Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => router.push(`/forms/${form.id}/preview`)}>プレビュー</Button>
                    <Button size="sm" variant="outline-primary" onClick={() => router.push(`/forms/${form.id}/edit`)}>編集</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <ConfirmModal show={showModal} onClose={() => setShowModal(false)} onConfirm={handleDeleteConfirm} itemName={selectedForm?.title} />
    </Container>
  );
}
