'use client';

import { useState } from 'react';
import { Table, Button, Form, InputGroup, Card, Alert } from 'react-bootstrap';
import { sortBy } from '../../../../lib/sort';
import { Question } from '../../../../types/formType';
import { PAGINATION } from '../../../../constants/pagination';
import EditQuestionModal from './EditQuestionModal';
import ConfirmModal from '../ConfirmModal';
import BlockingOverlay from '../BlockingOverlay';
import QuestionTypeIcon from '../QuestionTypeIcon';
import Paginate from '../Paginate';

interface Props {
  isMobile: boolean;
  questions: Question[];
  reload: () => void;
}

export default function MasterQuestionTab({ isMobile, questions, reload }: Props){
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState<Question | null>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<"" | "label" | "type">("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = questions.filter((q: Question) =>
    q.label.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sortKey ? sortBy(filtered, sortKey, sortAsc) : filtered;
  const paginated = sorted.slice((currentPage - 1) * PAGINATION.ITEMS_PER_PAGE, currentPage * PAGINATION.ITEMS_PER_PAGE);
  const pageCount = Math.ceil(sorted.length / PAGINATION.ITEMS_PER_PAGE);

  const handleSort = (key: "label" | "type") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const editMasterQuestion = (id: number | null) => {
    const target = filtered.find((q: Question) => q.id === id);
    if(target) {
      setSelectedItem(target);
    } else {
      const dateNow = new Date();
      setSelectedItem({
        id: Number(`${dateNow.getMinutes()}${dateNow.getSeconds()}${dateNow.getMilliseconds()}`),
        label: "",
        type: "text",
        options: [],
      })
    }
    setShowEditModal(true);
  };

  const hideEditQuestionModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
  }

  const deleteMasterQuestion = (q: Question) => {
    setSelectedItem(q);
    setShowModal(true);
  }

  const onSave = async (updated: Question) => {
    setShowEditModal(false);
    setIsSubmitting(true);

    const payload = {
      id: updated.id,
      label: updated.label.trim(),
      type: updated.type,
      options: updated.type === 'text' ? [] : (updated.options || []).map((opt, index) => {
        return {
          id: opt.id,
          text: opt.text.trim(),
          position: index + 1,
        }
      }).filter(Boolean),
    };

    try {
      const res = await fetch(`/api/admin/master-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setError("");
        reload();
      } else {
        setError("登録、更新に失敗しました");
      }
    } catch (error) {
      setError("登録、更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  const onDelete = async () => {
    if (!selectedItem) return;

    setShowModal(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/master-questions/${selectedItem?.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setError("");
        reload();
        setCurrentPage(1);
      } else {
        setError("削除に失敗しました");
      }
    } catch (error) {
      setError("削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="position-relative">
          <BlockingOverlay type={"processing"} />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="質問を検索"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      <div className="d-flex justify-content-end gap-2 mb-2">
        <Button variant="outline-primary" onClick={() => editMasterQuestion(null)}>新規登録</Button>
      </div>

      {isMobile ? (
        <div>
          {paginated.map((q: Question) => (
            <Card key={q.id} className="mb-3">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <Card.Title className="mb-0 text-truncate">{q.label}</Card.Title>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <QuestionTypeIcon type={q.type} />
                </div>
                <div className="d-flex justify-content-end">
                  <Button variant="warning" size="sm" className="me-2" onClick={() => editMasterQuestion(q.id)}>編集</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteMasterQuestion(q)}>削除</Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Table striped bordered hover style={{tableLayout: "fixed"}}>
          <thead>
            <tr>
              <th style={{ cursor: "pointer", width: "60%", minWidth: "60%" }} onClick={() => handleSort("label")}>
                ラベル {sortKey === 'label' ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => handleSort("type")}>
                タイプ {sortKey === "type" ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{width: "7.5rem", minWidth: "7.5rem"}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((q: Question) => (
              <tr key={q.id}>
                <td className="text-truncate">{q.label}</td>
                <td>{q.type}</td>
                <td className="text-center">
                  <Button variant="warning" size="sm" className="me-2" onClick={() => editMasterQuestion(q.id)}>編集</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteMasterQuestion(q)}>削除</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-center m-0">
        <Paginate currentPage={currentPage} onPageChange={setCurrentPage} totalPages={pageCount}></Paginate>
      </div>

      <ConfirmModal show={showModal} onClose={() => setShowModal(false)} onConfirm={() => onDelete()} itemName={selectedItem?.label} />
      <EditQuestionModal show={showEditModal} onHide={hideEditQuestionModal} question={selectedItem!} onSave={(updated) => onSave(updated)} />
    </>
  );
}
