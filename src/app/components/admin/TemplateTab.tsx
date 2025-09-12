'use client';

import { useState } from 'react';
import { Table, Button, Form, InputGroup, Card, Alert } from 'react-bootstrap';
import { sortBy } from '../../../../lib/sort';
import { Option, Template } from '../../../../types/formType';
import { PAGINATION } from '../../../../constants/pagination';
import EditTemplateModal from './EditTemplateModal';
import ConfirmModal from '../ConfirmModal';
import BlockingOverlay from '../BlockingOverlay';
import Paginate from '../Paginate';

interface Props {
  isMobile: boolean;
  templates: Template[];
  reload: () => void;
}

export default function TemplateTab({ isMobile, templates, reload }: Props){
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState<Template | null>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<"" | "title" | "description">("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = templates.filter((t: Template) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = sortKey ? sortBy(filtered, sortKey, sortAsc) : filtered;
  const paginated = sorted.slice((currentPage - 1) * PAGINATION.ITEMS_PER_PAGE, currentPage * PAGINATION.ITEMS_PER_PAGE);
  const pageCount = Math.ceil(sorted.length / PAGINATION.ITEMS_PER_PAGE);

  const handleSort = (key: "" | "title" | "description") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const editTemplate = (id: number | null) => {
    const target = filtered.find((t: Template) => t.id === id);
    if(target) {
      setSelectedItem(target);
    } else {
      const dateNow = new Date();
      setSelectedItem({
        id: Number(`${dateNow.getMinutes()}${dateNow.getSeconds()}${dateNow.getMilliseconds()}`),
        title: "",
        description: "",
        questions: [],
      })
    }
    setShowEditModal(true);
  };

  const hideEditTemplateModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
  }

  const deleteTemplate = (t: Template) => {
    setSelectedItem(t);
    setShowModal(true);
  }

  const onSave = async (updated: Template) => {
    setShowEditModal(false);
    setIsSubmitting(true);

    const cleanedQuestions = updated.questions?.map((q, index) => ({
      label: q.label.trim(),
      type: q.type,
      position: index + 1,
      options: q.type === 'text' ? [] : (q.options || []).map((opt: Option, index: number) => {
        return {
          text: opt.text.trim(),
          position: index + 1,
        }
      }).filter(Boolean),
    }));

    const payload = {
      id: updated.id,
      title: updated.title.trim(),
      description: updated.description?.trim().length ? updated.description : null,
      questions: cleanedQuestions,
    };

    try {
      const res = await fetch(`/api/admin/templates`, {
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
      const res = await fetch(`/api/admin/templates/${selectedItem?.id}`, {
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
          placeholder="テンプレートを検索"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      <div className="d-flex justify-content-end gap-2 mb-2">
        <Button variant="outline-primary" onClick={() => editTemplate(null)}>新規登録</Button>
      </div>

      {isMobile ? (
        <div>
          {paginated.map((t: Template) => (
            <Card key={t.id} className="mb-3">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <Card.Title className="mb-0 text-truncate">{t.title}</Card.Title>
                </div>
                <Card.Subtitle className="mb-2 text-muted text-truncate">{t.description}</Card.Subtitle>
                <div className="d-flex justify-content-end">
                  <Button variant="warning" size="sm" className="me-2" onClick={() => editTemplate(t.id)}>編集</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteTemplate(t)}>削除</Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Table striped bordered hover style={{tableLayout: "fixed"}}>
          <thead>
            <tr>
              <th style={{ cursor: "pointer", width: "60%", minWidth: "60%" }} onClick={() => handleSort("title")}>
                タイトル {sortKey === 'title' ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{ cursor: "pointer" }} onClick={() => handleSort("description")}>
                説明 {sortKey === 'description' ? (sortAsc ? "▲" : "▼") : ""}
              </th>
              <th style={{width: "7.5rem", minWidth: "7.5rem"}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((t: Template) => (
              <tr key={t.id}>
                <td className="text-truncate">{t.title}</td>
                <td className="text-truncate">{t.description}</td>
                <td className="text-center">
                  <Button variant="warning" size="sm" className="me-2" onClick={() => editTemplate(t.id)}>編集</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteTemplate(t)}>削除</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-center m-0">
        <Paginate currentPage={currentPage} onPageChange={setCurrentPage} totalPages={pageCount}></Paginate>
      </div>

      <ConfirmModal show={showModal} onClose={() => setShowModal(false)} onConfirm={() => onDelete()} itemName={selectedItem?.title} />
      <EditTemplateModal show={showEditModal} onHide={hideEditTemplateModal} template={selectedItem!} onSave={(updated) => onSave(updated)} />
    </>
  );
}
