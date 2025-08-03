'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Option, Question, QuestionType, Template } from '../../../../types/formType';
import SortableQuestionCard from '../SortableQuestionCard';

interface EditTemplateModalProps {
  show: boolean;
  onHide: () => void;
  template: Template;
  onSave: (updatedTemplate: any) => void;
}

export default function EditTemplateModal({
  show,
  onHide,
  template,
  onSave,
}: EditTemplateModalProps) {
  const [editTemplateId, setEditTemplateId] = useState<number>(0);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);
  const [validated, setValidated] = useState(false);

  // ドラッグアンドドロップ用
  const containerRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: any) => {

    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = editQuestions.findIndex((q) => q.id === active.id);
      const newIndex = editQuestions.findIndex((q) => q.id === over?.id);
      const updated = arrayMove(editQuestions, oldIndex, newIndex);
      setEditQuestions(updated);
    }
  };

  useEffect(() => {
    setValidated(false);
    setEditTemplateId(template?.id);
    setEditTitle(template?.title || "");
    setEditDescription(template?.description || "");
    const questions = template?.questions.map((q, index) => {
      q.id = index;
      return q;
    })
    setEditQuestions(questions || []);
  }, [template]);

  const handleSave = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const updated = {
      id: editTemplateId,
      title: editTitle,
      description: editDescription,
      questions: editQuestions,
    };
    onSave(updated);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...editQuestions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;
    setEditQuestions(newQuestions);
  };

  const addQuestion = () => {
    setEditQuestions([...editQuestions, createNewQuestion("", 'text', [])]);
  };

  const deleteQuestion = (id: number) => {
    setEditQuestions(editQuestions.filter((question, index) => (question.id !== id)));
  };

  const updateLabel = (id: number, label: string) => {
    setEditQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, label } : q)));
  };

  const updateType = (id: number, type: Question['type']) => {
    setEditQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, type, options: type === 'text' ? [] : q.options || [] } : q
      )
    );
  };

  const updateOptions = (id: number, options: Option[]) => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, options } : q))
    );
  };

  const createNewQuestion = (label: string, type: QuestionType, options: Option[] | undefined) => {
    const dateNow = new Date();
    return {
      id: Number(`${dateNow.getMinutes()}${dateNow.getSeconds()}${dateNow.getMilliseconds()}`),
      label: label,
      type: type,
      options: options,
    };
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form noValidate validated={validated} onSubmit={handleSave}>
        <Modal.Header closeButton>
          <Modal.Title>テンプレート編集</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" >
            <Form.Label>フォームタイトル</Form.Label>
            <Form.Control value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>フォーム説明</Form.Label>
            <Form.Control value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </Form.Group>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
            <SortableContext items={editQuestions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div ref={containerRef} style={{ overflow: 'hidden' }}>
                {editQuestions.map((q, index) => (
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
              <Button variant="outline-primary" onClick={addQuestion}>質問を追加</Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>キャンセル</Button>
          <Button variant="primary" type="submit">保存</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
