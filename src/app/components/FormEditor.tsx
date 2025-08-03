'use client';

import { Alert, Button, Dropdown, Form, SplitButton } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import Loading from './Loading';
import { Question, Option, QuestionType, Template } from '../../../types/formType';
import { BlockingOverlay } from './BlockingOverlay';
import MasterQuestionSelectModal from './MasterQuestionSelectModal';
import SortableQuestionCard from './SortableQuestionCard';

type Props = {
  formTemplate?: Template | null,
};

export default function FormEditor({ formTemplate }: Props) {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // ドラッグアンドドロップ用
  const containerRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over?.id);
      const updated = arrayMove(questions, oldIndex, newIndex);
      setQuestions(updated);
    }
  };

  useEffect(() => {
    if(formTemplate) {
      setTitle(formTemplate.title);
      setDescription(formTemplate.description ?? "");
      const questions = formTemplate.questions.map((q, i) => {
        const dateNow = new Date();
        const options = q.options.map((opt: Option, j: number) => {
          return {
            id: Number(`${dateNow.getMinutes()}${dateNow.getSeconds()}${dateNow.getMilliseconds()}${i}${j}`),
            text: opt.text,
            position: opt.position
          }
        })

        return {
          id: Number(`${dateNow.getMinutes()}${dateNow.getSeconds()}${dateNow.getMilliseconds()}${i}`),
          label: q.label,
          type: q.type,
          position: q.position,
          options: options,
        }
      })
      setQuestions(questions || []);
      return;
    }

    if (!id) {
      return;
    }

    const fetchForm = async () => {
      const res = await fetch(`/api/forms/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description ?? "");
        setQuestions(data.questions || []);
        setIsPublic(data.isPublic);
      }
      setLoading(false);
    };
    fetchForm();
  }, [id, formTemplate]);

  const handleSave = async (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setIsSubmitting(true);

    const cleanedQuestions = questions.map((q, index) => ({
      id: q.id,
      label: q.label.trim(),
      type: q.type,
      position: index + 1,
      options: q.type === 'text' ? [] : (q.options || []).map((opt, index) => {
        return {
          id: opt.id,
          text: opt.text.trim(),
          position: index + 1,
        }
      }).filter(Boolean),
    }));

    const payload = {
      id: id ?? null,
      title: title.trim(),
      description: description?.trim().length ? description : null,
      questions: cleanedQuestions,
    };

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if(res.ok) {
        router.push(`/forms`);
      }else {
        setError("登録、更新に失敗しました");
      }
    } catch (err) {

    } finally {
      setIsSubmitting(false);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, createNewQuestion("", 'text', [])]);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter((question, index) => (question.id !== id)));
  };

  const updateLabel = (id: number, label: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, label } : q)));
  };

  const updateType = (id: number, type: Question['type']) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, type, options: type === 'text' ? [] : q.options || [] } : q
      )
    );
  };

  const updateOptions = (id: number, options: Option[]) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, options } : q))
    );
  };

  const handleToggle = async () => {
    const nextValue = !isPublic;
    setIsPublic(nextValue);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: nextValue }),
      });

      if(res.ok) {
        setError("");
      } else {
        // 状態を元に戻す
        setIsPublic(!nextValue);
        setError("更新に失敗しました");
      }
    } catch (err) {
      // 状態を元に戻す
      setIsPublic(!nextValue);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAdd = (q: Question) => {
    setQuestions([...questions, createNewQuestion(q.label, q.type, q.options)]);
  }

  const createNewQuestion = (label: string, type: QuestionType, options: Option[] | undefined) => {
    const dateNow = new Date();
    return {
      id: Number(`${dateNow.getMinutes()}${dateNow.getSeconds()}${dateNow.getMilliseconds()}`),
      label: label,
      type: type,
      options: options,
    };
  }

  if (loading){
    return <Loading />
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
      {error && <Alert variant="danger">{error}</Alert>}
      <Form noValidate validated={validated} onSubmit={handleSave}>
        <>
          {id && (
            <Form.Group className="mb-3 d-flex align-items-center justify-content-end">
              <Form.Label className="me-3 mb-0" style={{ minWidth: '3rem' }}>
                {isPublic ? '公開中' : '非公開'}
              </Form.Label>
              <Form.Check
                type="switch"
                id="isPublic-switch"
                checked={isPublic}
                disabled={loading}
                onChange={handleToggle}
              />
            </Form.Group>
          )}
        </>

        <Form.Group className="mb-3" >
          <Form.Label>フォームタイトル</Form.Label>
          <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>フォーム説明</Form.Label>
          <Form.Control
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div ref={containerRef} style={{ overflow: 'hidden' }}>
              {questions.map((q, index) => (
                <SortableQuestionCard
                  key={q.id}
                  question={q}
                  onLabelChange={(label) => updateLabel(q.id, label)}
                  onTypeChange={(type) => updateType(q.id, type)}
                  onOptionsChange={(options) => updateOptions(q.id, options)}
                  onMoveUp={() => moveQuestion(index, 'up')}
                  onMoveDown={() => moveQuestion(index, 'down')}
                  onDeleteQuestion={() => deleteQuestion(q.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="d-flex gap-3 mt-4">
          <div className="flex-grow-1">
            <SplitButton variant="outline-primary" title="質問を追加" id="add-question-split" onClick={addQuestion}>
              <Dropdown.Item onClick={() => setShowModal(true)}>マスタから選択</Dropdown.Item>
            </SplitButton>
          </div>
          <Button variant="primary" type="submit">保存する</Button>
        </div>
      </Form>

      <MasterQuestionSelectModal show={showModal} onClose={() => setShowModal(false)} onSelect={onAdd} />
    </>
  );
}
