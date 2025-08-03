'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { BsPlusLg, BsXCircle } from 'react-icons/bs';
import { Option, Question, QuestionType } from '../../../../types/formType';

interface EditQuestionModalProps {
  show: boolean;
  onHide: () => void;
  question: Question;
  onSave: (updatedQuestion: any) => void;
}

export default function EditQuestionModal({
  show,
  onHide,
  question,
  onSave,
}: EditQuestionModalProps) {
  const [editQuestionId, setEditQuestionId] = useState<number>(0);
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<QuestionType>('text');
  const [editOptions, setEditOptions] = useState<Option[]>([]);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setValidated(false);
    setEditQuestionId(question?.id);
    setEditLabel(question?.label || "");
    setEditType(question?.type || "text");
    setEditOptions(question?.options || []);
  }, [question]);

  const handleSave = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const updated = {
      id: editQuestionId,
      label: editLabel,
      type: editType,
      options: editOptions,
    };
    onSave(updated);
  };

  const handleOptionLabelChange = (index: number, value: string) => {
    const newOptions = [...(editOptions || [])];
    newOptions[index] = {
      id: Date.now(),
      position: 0,
      questionId: editQuestionId,
      text: value,
    };
    setEditOptions(newOptions);
  };

  const handleTypeChange = (type: Question['type']) => {
    setEditType(type);
    setEditOptions(type === 'text' ? [] : editOptions || []);
  };

  const handleAddOption = () => {
    const newOptions = [
      ...(editOptions || []),
      {
        id: Date.now(),
        position: editOptions?.length,
        questionId: editQuestionId,
        text: "",
      } as Option
    ];
    setEditOptions(newOptions);
  };

  const handleDeleteOption = (id: number) => {
    const newOptions = editOptions?.filter(option => option.id !== id) || [];
    setEditOptions(newOptions);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form noValidate validated={validated} onSubmit={handleSave}>
        <Modal.Header closeButton>
          <Modal.Title>マスタ質問編集</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Control value={editLabel} placeholder="質問" onChange={(e) => setEditLabel(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>タイプ</Form.Label>
            <Form.Select value={editType} onChange={(e) => handleTypeChange(e.target.value as Question['type'])}>
              <option value="text">テキスト</option>
              <option value="radio">単一選択（ラジオ）</option>
              <option value="select">単一選択（セレクトボックス）</option>
              <option value="checkbox">複数選択（チェックボックス）</option>
            </Form.Select>
          </Form.Group>
          {(editType === 'radio' || editType === 'checkbox' || editType === 'select') && (
            <>
              <div>
                <Form.Label hidden={!editOptions?.length}>選択肢</Form.Label>
                {(editOptions || []).map((opt, i) => (
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
              {(editType === 'radio' || editType === 'checkbox' || editType === 'select') && (
                <Button size="sm" variant="outline-secondary" onClick={handleAddOption}><BsPlusLg className="mb-1 me-1" />選択肢を追加</Button>
              )}
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
