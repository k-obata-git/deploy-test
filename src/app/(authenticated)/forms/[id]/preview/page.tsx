'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FormType } from '../../../../../../types/formType';
import FormView from '@/app/components/FormView';
import BlockingOverlay from '@/app/components/BlockingOverlay';

export default function FormPreviewPage() {
  const { id } = useParams();
  const [form, setForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/forms/${id}`, {
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

  return (
    <>
      {loading && (
        <div className="position-relative">
          <BlockingOverlay type={"loading"} />
        </div>
      )}
      <FormView preview={true} form={form!} />
    </>
  );
}
