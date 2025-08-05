'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Card } from 'react-bootstrap';
import { FormType } from '../../../../../types/formType';
import FormView from '@/app/components/FormView';
import BlockingOverlay from '@/app/components/BlockingOverlay';

export default function PublicFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/public/${id}`, {
      method: 'GET',
    }).then((res) => {
      if(res.ok) {
        return res.json();
      }
    }).then((data) => {
      setForm(data);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  if(loading) {
    return (
      <div className="position-relative">
        <BlockingOverlay type={"loading"} />
      </div>
    )
  }

  return (
    <>
      {form && (
        <FormView preview={false} form={form!} />
      )}
      {!form && (
        <Container>
          <Card className="p-4">
            <p style={{textAlign: "center", margin: "0"}}>このフォームは存在しないか、非公開です。</p>
          </Card>
        </Container>
      )}
    </>
  )
}
