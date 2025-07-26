'use client'

import { useEffect, useState } from 'react'
import { Modal, Button, Form, ListGroup } from 'react-bootstrap'
import { Question } from '../../../types/formType'

type Props = {
  show: boolean
  onClose: () => void
  onSelect: (question: Question) => void
}

export default function MasterQuestionModal({ show, onClose, onSelect }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedId, setSelectedId] = useState<Number | null>(null)

  useEffect(() => {
    if (show) {
      setSelectedId(null);
      setQuestions([]);
      fetch('/api/master-questions')
        .then(res => res.json())
        .then(setQuestions)
    }
  }, [show])

  const handleAdd = () => {
    const selected = questions.find(q => Number(q.id) === selectedId)
    if (selected) {
      onSelect(selected)
      setSelectedId(null)
      onClose()
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>定型質問を追加</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Select
          value={selectedId?.toString()}
          onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">選択してください</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.label}（{q.type}）
            </option>
          ))}
        </Form.Select>

        {selectedId && (
          <div className="mt-3">
            <strong>選択中:</strong>{' '}
            {questions.find((q) => Number(q.id) === selectedId)?.label}
            <ListGroup className="mt-2">
              {(questions.find((q) => Number(q.id) === selectedId)?.options ?? []).map(opt => (
                <ListGroup.Item key={opt.id}>{opt.text}</ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>閉じる</Button>
        <Button variant="primary" onClick={handleAdd} disabled={!selectedId}>追加</Button>
      </Modal.Footer>
    </Modal>
  )
}
