'use client';

import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

type FormType = {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  questions: Question[];
};

type Question = {
  id: number;
  label: string;
  type: 'text' | 'radio' | 'checkbox';
  options?: { id: number; text: string }[];
};

type Answer = {
  questionId: number;
  optionId: number | null;
  value: string;
}

type Prop = {
  id?: number,
  preview: boolean,
  form: FormType,
}

export default function FormView({preview, form}: Prop) {
  const [values, setValues] = useState<Answer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any, type: string, questionId: number, optionId: number | null) => {
    const key: string = type === 'checkbox' ? `${questionId}${optionId}` : `${questionId}`;
    const item: Answer = {
      questionId: questionId,
      optionId: e.target.checked ? optionId : null,
      value: e.target.checked || type === 'text' ? e.target.value : null,
    }

    setValues((prev) => ({ ...prev, [key]: item }))
  };

  const handleSubmit = async () => {
    if (!form) return;

    const items = Object.values(values).filter(val => val.value?.trim());
    const res = await fetch(`/api/response/${form.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      setError('送信に失敗しました');
    }
  };

  if (submitted) return <Alert variant="success">回答ありがとうございました！</Alert>;

  return (
    <Container>
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
            </Card.Body>
          </Card>
        ))}

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="text-end" hidden={preview}>
          <Button onClick={handleSubmit}>送信</Button>
        </div>
      </Form>
    </Container>
  );
}
