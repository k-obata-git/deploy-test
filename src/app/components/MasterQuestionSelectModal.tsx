'use client'

import { useEffect, useState } from 'react'
import { Modal, Button, ListGroup, Row, Col } from 'react-bootstrap'
import { BsFillCheckCircleFill } from 'react-icons/bs'
import { Question } from '../../../types/formType'
import { PAGINATION } from '../../../constants/pagination'
import BlockingOverlay from './BlockingOverlay'
import QuestionTypeIcon from './QuestionTypeIcon'
import Paginate from './Paginate'

type Props = {
  show: boolean
  onClose: () => void
  onSelect: (question: Question) => void
}

export default function MasterQuestionSelectModal({ show, onClose, onSelect }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = questions?.slice((currentPage - 1) * PAGINATION.ITEMS_PER_PAGE, currentPage * PAGINATION.ITEMS_PER_PAGE);
  const pageCount = Math.ceil(questions?.length / PAGINATION.ITEMS_PER_PAGE);

  useEffect(() => {
    if (show) {
      setSelectedQuestion(null);
      setQuestions([]);
      setCurrentPage(1);

      setLoading(true);
      fetch('/api/master-questions', {
        method: 'GET',
      }).then((res) => {
        if(res.ok) {
          return res.json();
        }
      }).then((data) => {
        setQuestions(data);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [show])

  const handleAdd = () => {
    const selected = questions.find(q => Number(q.id) === selectedQuestion?.id);
    if (selected) {
      onSelect(selected);
      setSelectedQuestion(null);
      onClose();
    }
  }

  return (
    <>
      {loading && (
        <div className="position-relative">
          <BlockingOverlay type="loading" />
        </div>
      )}
      <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>質問を選択</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {questions?.length === 0 ? (
              <p className="text-center m-0">未登録</p>
            ) : (
              paginated?.map((q) => (
                <ListGroup.Item key={q.id} onClick={() => setSelectedQuestion(q)} action>
                  <Row>
                    <Col xs={1} className="m-auto">
                      <BsFillCheckCircleFill style={{opacity: selectedQuestion?.id === q.id ? "1" : "0"}} />
                    </Col>
                    <Col xs={11}>
                      <div className="fw-bold text-truncate">{q.label}</div>
                      <div className="d-flex align-items-center mb-2">
                        <QuestionTypeIcon type={q.type} />
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>

          <div className="d-flex justify-content-center m-0 pt-3">
            <Paginate currentPage={currentPage} onPageChange={setCurrentPage} totalPages={pageCount}></Paginate>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>閉じる</Button>
          <Button variant="primary" onClick={handleAdd} disabled={!selectedQuestion}>追加</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
