'use client';

import { useState } from 'react';
import { Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { Answer, FormType } from '../../../types/formType';
import { BlockingOverlay } from './BlockingOverlay';

type Prop = {
  id?: number,
  preview: boolean,
  form: FormType,
}

export default function FormView({preview, form}: Prop) {
  const [values, setValues] = useState<Answer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: any, type: string, questionId: number, optionId: number | null) => {
    const key: string = type === 'checkbox' ? `${questionId}${optionId}` : `${questionId}`;
    const item: Answer = {
      questionId: questionId,
      optionId: e.target.checked ? optionId : null,
      value: e.target.checked || type === 'text' ? e.target.value : null,
    }

    setValues((prev) => ({ ...prev, [key]: item }))
  };

  const handleSelectChange = (e: any, questionId: number) => {
    const optionId = e.target.selectedOptions[0].id
    const key: string = `${questionId}`;
    const item: Answer = {
      questionId: questionId,
      optionId: optionId ? Number(optionId) : null,
      value: optionId ? e.target.value : null,
    }

    setValues((prev) => ({ ...prev, [key]: item }))
  };

  const handleSubmit = async () => {
    if (!form) return;

    setIsSubmitting(true);
    const items = Object.values(values).filter(val => val.value?.trim());
    const res = await fetch(`/api/response/${form.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    setIsSubmitting(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      setError('送信に失敗しました');
    }
  };

  if (submitted) {
    return (
      <Alert variant="success">回答ありがとうございました！</Alert>
    )
  }

  return (
    <>
      <>
        {isSubmitting && (
          <div className="position-relative">
            <BlockingOverlay />
          </div>
        )}
      </>

      <Card className="my-4">
        <Card.Body>
          <h5 className="mb-3 text-muted text-break" style={{width: "100%"}}>{form?.title}</h5>
          <p className="text-muted text-break" style={{width: "100%"}}>{form?.description}</p>
        </Card.Body>
      </Card>

      <Form>
        {form?.questions.map((q) => (
          <Card key={q.id} className="my-4">
            <Card.Body>
              <Form.Label className="fw-bold" style={{width: "100%"}}>{q.label}</Form.Label>

              {q.type === 'text' && (
                <Form.Control
                  type="text"
                  value={values[Number(q.id)]?.value || ''}
                  onChange={(e) => handleChange(e, q.type, q.id, null)}
                  disabled={preview}
                  placeholder={preview ? "ここに入力（プレビュー中）" : ""}
                />
              )}

              {q.type === 'radio' &&
                q.options?.map((opt) => (
                  <Form.Check
                    key={opt.id}
                    type="radio"
                    name={opt.id.toString()}
                    label={opt.text}
                    value={opt.text}
                    checked={values[Number(q.id)]?.optionId === opt.id ? true : false}
                    onChange={(e) => handleChange(e, q.type, q.id, opt.id)}
                    disabled={preview}
                  />
                ))}

              {q.type === 'checkbox' &&
                q.options?.map((opt) => (
                  <Form.Check
                    key={opt.id}
                    type="checkbox"
                    name={opt.id.toString()}
                    label={opt.text}
                    value={opt.text}
                    checked={values[Number(`${q.id}${opt.id}`)]?.optionId === opt.id ? true : false}
                    onChange={(e) => handleChange(e, q.type, q.id, opt.id)}
                    disabled={preview}
                  />
                ))}

              {q.type === 'select' && (
                <>
                  {preview && (
                    <>
                      <Form.Select disabled>
                        <option>セレクトボックス（プレビュー中）</option>
                      </Form.Select>
                      <ListGroup>
                        {
                          q.options?.map((opt) => (
                            <ListGroup.Item key={opt.id}>{opt.text}</ListGroup.Item>
                          ))
                        }
                      </ListGroup>
                    </>
                  )}
                  {!preview && (
                    <Form.Select onChange={(e) => handleSelectChange(e, q.id)}>
                      <option id={undefined} value={undefined}>未選択</option>
                      {
                        q.options?.map((opt) => (
                          <option key={opt.id} id={opt.id.toString()} value={opt.text}>{opt.text}</option>
                        ))
                      }
                    </Form.Select>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        ))}

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="text-end" hidden={preview}>
          <Button onClick={handleSubmit}>送信</Button>
        </div>
      </Form>
    </>
  );
}
