'use client';

import { Button, Card, Collapse, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsChevronDown, BsChevronUp, BsFillGrid3X2GapFill, BsPlusLg, BsTrash, BsXCircle } from "react-icons/bs";
import { Question, Option } from '../../../types/formType';

export default function SortableQuestionCard({ question, onLabelChange, onTypeChange, onOptionsChange, onDeleteQuestion }: {
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
                  <option value="select">単一選択（セレクトボックス）</option>
                  <option value="checkbox">複数選択（チェックボックス）</option>
                </Form.Select>
              </Form.Group>

              {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && (
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
                  {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && (
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