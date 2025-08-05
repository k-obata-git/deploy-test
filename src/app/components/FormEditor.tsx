'use client';

import { Alert, Button, Dropdown, Form, SplitButton } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Question, Option, QuestionType, Template } from '../../../types/formType';
import MasterQuestionSelectModal from './MasterQuestionSelectModal';
import SortableQuestionCard from './SortableQuestionCard';
import BlockingOverlay from './BlockingOverlay';

type Props = {
  formTemplate?: Template | null,
};

export default function FormEditor({ formTemplate }: Props) {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [isRenderDataReady, setIsRenderDataReady] = useState(false);

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
    if (!id && !formTemplate) {
      return;
    }

    setLoading(true);
    if(formTemplate) {
      setFormDate(formTemplate.title, formTemplate.description, createTemplateQuestions(formTemplate), false);
      setIsRenderDataReady(true);
    } else {
      fetch(`/api/forms/${id}`, {
        method: 'GET',
      }).then((res) => {
        if(res.ok) {
          return res.json();
        } else {
          setError("取得に失敗しました");
        }
      }).then((data) => {
        setError("");
        setFormDate(data?.title, data?.description, data?.questions, data?.isPublic);
      }).finally(() => {
        setIsRenderDataReady(true);
      });
    }
  }, [id, formTemplate]);

  useEffect(() => {
    if(isRenderDataReady) {
      setLoading(false);
    }
  }, [isRenderDataReady])

  const createTemplateQuestions = (formTemplate: Template) => {
    const dateNow = new Date();
    return formTemplate.questions.map((q, i) => {
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
  }

  const setFormDate = (title: string, description: string | undefined, questions: Question[], isPublic: boolean) => {
    setTitle(title);
    setDescription(description ?? "");
    setQuestions(questions || []);
    setIsPublic(isPublic);
  }

  const handleToggle = () => {
    const nextValue = !isPublic;
    setIsPublic(nextValue);

    setIsSubmitting(true);
    fetch(`/api/forms/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isPublic: nextValue }),
    }).then((res) => {
      if(res.ok) {
        setError("");
      } else {
        // 状態を元に戻す
        setIsPublic(!nextValue);
        setError("更新に失敗しました");
      }
    }).finally(() => {
      setIsSubmitting(false);
    })
  }

  const handleSave = async(event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const payload = {
      id: id ?? null,
      title: title.trim(),
      description: description?.trim().length ? description : null,
      questions: createRequestQuestion(),
    };

    setIsSubmitting(true);
    fetch('/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((res) => {
      if(res.ok) {
        router.push(`/forms`);
      } else {
        setError("登録、更新に失敗しました");
      }
    }).finally(() => {
      setIsSubmitting(false);
    })
  };

  const createRequestQuestion = () => {
    return questions.map((q, index) => ({
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
    }))
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

  const onAdd = (q: Question) => {
    setQuestions([...questions, createNewQuestion(q.label, q.type, q.options)]);
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
      {error && <Alert variant="danger">{error}</Alert>}
      <Form noValidate validated={validated} onSubmit={handleSave} hidden={!!(id && !title)}>
        <>
          {id && (
            <Form.Group className="mb-3 d-flex align-items-center justify-content-end">
              <Form.Label className="me-3 mb-0" style={{ minWidth: '3rem' }}>
                {isPublic ? '公開中' : '非公開'}
              </Form.Label>
              <Form.Check
                type="switch"
                id="isPublic-switch"
                checked={isPublic ?? false}
                onChange={handleToggle}
              />
            </Form.Group>
          )}
        </>

        <Form.Group className="mb-3" >
          <Form.Label>フォームタイトル</Form.Label>
          <Form.Control value={title ?? ""} onChange={(e) => setTitle(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>フォーム説明</Form.Label>
          <Form.Control
            value={description ?? ""}
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
