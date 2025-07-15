'use client';

import Loading from '@/app/components/Loading';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Card, ProgressBar } from 'react-bootstrap';
import { FormType } from '../../../../../../types/formType';

type QuestionSummary =
  | {
      id: number;
      label: string;
      type: 'text';
      texts: string[];
    }
  | {
      id: number;
      label: string;
      type: 'radio' | 'checkbox';
      counts: Record<string, number>;
    };

export default function FormResultsPage() {
  const { id } = useParams();
  const [form, setForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/forms/${id}`)
      if (res.ok) {
        const data = await res.json();
        setForm(data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading || !form){
    return <Loading />
  }

  const totalResponses = form.responses.length;

  const questionSummaries: QuestionSummary[] = form.questions.map((q) => {
    const answers = form.responses.flatMap((r) =>
      r.answers.filter((a) => a.questionId === q.id)
    );

    if (q.type === 'text') {
      return {
        id: q.id,
        label: q.label,
        type: 'text' as const,
        texts: answers.map((a) => a.text),
      };
    }

    if (q.type === 'radio' || q.type === 'checkbox') {
      const counts: Record<string, number> = {};
      q.options!.forEach((opt) => {
        counts[opt.text] = 0;
      });

      for (const a of answers) {
        if (counts[a.text] !== undefined) {
          counts[a.text]++;
        }
      }

      return {
        id: q.id,
        label: q.label,
        type: q.type,
        counts,
      };
    }

    return {
      id: q.id,
      label: q.label,
      type: 'text',
      texts: [],
    };
  });

  if(form.responses.length === 0) {
    return (
      <Container>
        <h5 className="mb-4 text-truncate">{form.title}</h5>
        <p className="text-muted">まだ回答がありません。</p>
      </Container>
    )
  }

  return (
    <Container>
      <h5 className="mb-4 text-truncate">{form.title}</h5>

      <Tabs defaultActiveKey="summary" id="result-tabs" className="mb-4">
        <Tab eventKey="summary" title="集計結果">
          <p className="mb-3 text-muted">回答件数：{totalResponses} 件</p>

          {questionSummaries.map((q, i) => (
            <Card key={q.id} className="mb-4">
              <Card.Body>
                <h5 className="mb-3">Q{i + 1}. {q.label}</h5>

                {q.type === 'text' && (
                  <>
                    {q.texts.length === 0 && <p className="text-muted">回答なし</p>}
                    <ul>
                      {q.texts.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </>
                )}

                {(q.type === 'radio' || q.type === 'checkbox') && (
                  <div>
                    {Object.entries(q.counts).map(([optionText, count]) => {
                      const percent =
                        totalResponses === 0 ? 0 : Math.round((count / totalResponses) * 100);
                      return (
                        <div key={optionText} className="mb-2">
                          <div className="d-flex justify-content-between">
                            <strong>{optionText}</strong>
                            <span>{count} 件 ({percent}%)</span>
                          </div>
                          <ProgressBar now={percent} label={`${percent}%`} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </Tab>

        <Tab eventKey="responses" title="個別回答">
          {
            form.responses.map((response, rIndex) => (
              <Card key={response.id} className="mb-4">
                <Card.Header>
                  <div className="d-flex gap-2">
                    <div className="flex-grow-1">
                      <strong>回答 {rIndex + 1}</strong>
                    </div>
                      <span className="ps-4">回答日時: {new Date(response.submittedAt).toLocaleDateString()}</span>
                  </div>
                </Card.Header>
                <Card.Body>
                  {form.questions.map((question) => {
                    if(response.answers.length) {
                      const answer = Object.values(response.answers).filter((a: any) => a.questionId === question.id).map((a: any) => a.text)
                      return (
                        <div key={question.id} className="mb-3">
                          <strong>{question.label}</strong>
                          <>
                            {
                              answer.map((ans: string, index: number) => {
                                return <div className="ms-3" key={index}>{ans}</div>
                              })
                            }
                          </>
                        </div>
                      );
                    }
                  })}
                </Card.Body>
              </Card>
            ))
          }
        </Tab>
      </Tabs>
    </Container>
  );
}
