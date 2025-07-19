'use client';

import { Button, Card, Collapse, Form } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { BsChevronDown, BsChevronUp, BsFillGrid3X2GapFill, BsPlusLg, BsTrash, BsXCircle } from "react-icons/bs";
import Loading from './Loading';
import { Question, Option } from '../../../types/formType';
import { BlockingOverlay } from './BlockingOverlay';

export default function FormEditor() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!id) return;
    const fetchForm = async () => {
      const res = await fetch(`/api/forms/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setDescription(data.description ?? "");
        setQuestions(data.questions || []);
      }
      setLoading(false);
    };
    fetchForm();
  }, [id]);

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

    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (res.ok) {
      const data = await res.json();
      router.push(`/forms`);
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
    const dateNow = new Date();
    const newQuestion: Question = {
      id: Number(`${dateNow.getHours()}${dateNow.getMinutes()}${dateNow.getSeconds()}${dateNow.getMilliseconds()}`),
      label: "",
      type: 'text',
      options: [],
    };
    setQuestions([...questions, newQuestion]);
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
    <Form noValidate validated={validated} onSubmit={handleSave}>
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
          <Button variant="outline-primary" onClick={addQuestion}><BsPlusLg />質問を追加</Button>
        </div>
        <Button variant="primary" type="submit">保存する</Button>
      </div>
    </Form>
  );
}

function SortableQuestionCard({ question, onLabelChange, onTypeChange, onOptionsChange, onDeleteQuestion }: {
  question: Question;
  onLabelChange: (label: string) => void;
  onTypeChange: (type: Question['type']) => void;
  onOptionsChange: (options: Option[]) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDeleteQuestion: (id: number) => void;
}) {

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
  });
  const [open, setOpen] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '16px',
  };

  const dragHandleStyle = {
    cursor: 'grab',
    color: '#C0C0C0'
  }

  const handleOptionLabelChange = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = {
      id: Date.now(),
      position: 0,
      questionId: Number(question.id),
      text: value,
    };
    onOptionsChange(newOptions);
  };

  const handleAddOption = () => {
    const newOptions = [
      ...(question.options || []),
      {
        id: Date.now(),
        position: question.options?.length,
        questionId: Number(question.id),
        text: "",
      } as Option
    ];
    onOptionsChange(newOptions);
  };

  const handleDeleteOption = (id: number) => {
    const newOptions = question.options?.filter(option => option.id !== id) || [];
    onOptionsChange(newOptions);
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <Card.Header style={{backgroundColor: "#fff"}}>
        <div className="d-flex justify-content-between align-items-start">
          {/* DnDハンドル：ここにだけ listener を付与 */}
          <div {...attributes} {...listeners} style={dragHandleStyle} className="flex-grow-1">
            <h5><BsFillGrid3X2GapFill className="" style={dragHandleStyle} /></h5>
          </div>
          <h5 className="" style={{cursor: "pointer", color: "#C0C0C0"}}>
            <div onClick={() => setOpen(true)} hidden={open}><BsChevronDown /></div>
            <div onClick={() => setOpen(false)} hidden={!open}><BsChevronUp /></div>
          </h5>
        </div>
      </Card.Header>
      <Collapse in={open}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <Form.Group className="mb-2">
                <Form.Control value={question.label} placeholder="質問" onChange={(e) => onLabelChange(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>タイプ</Form.Label>
                <Form.Select value={question.type} onChange={(e) => onTypeChange(e.target.value as Question['type'])}>
                  <option value="text">テキスト</option>
                  <option value="radio">単一選択（ラジオ）</option>
                  <option value="checkbox">複数選択（チェックボックス）</option>
                </Form.Select>
              </Form.Group>

              {(question.type === 'radio' || question.type === 'checkbox') && (
                <>
                  <div>
                    <Form.Label hidden={!question.options?.length}>選択肢</Form.Label>
                    {(question.options || []).map((opt, i) => (
                      <div key={i} className="d-flex gap-2 align-items-center mb-2">
                        <Form.Control value={opt.text} onChange={(e) => handleOptionLabelChange(i, e.target.value)} placeholder="新しい選択肢" required />
                        <BsXCircle className="text-danger" style={{cursor: "pointer"}} onClick={() => handleDeleteOption(opt.id)} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="d-flex mt-4">
                <div className="flex-grow-1">
                  {(question.type === 'radio' || question.type === 'checkbox') && (
                    <Button size="sm" variant="outline-secondary" onClick={handleAddOption}><BsPlusLg className="mb-1 me-1" />選択肢を追加</Button>
                  )}
                </div>
                <Button size="sm" variant="outline-danger" onClick={() => onDeleteQuestion(question.id)}><BsTrash className="mb-1 me-1" />質問を削除</Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Collapse>
      <Card.Footer style={{backgroundColor: "#fff"}} hidden={open}>
        <h6 className="m-0 text-truncate">{question.label || "無題の質問"}</h6>
      </Card.Footer>
    </Card>
  );
}
