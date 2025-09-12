'use client';

import { Modal, Button, ListGroup, Row, Col, Pagination } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import { Template } from '../../../types/formType';
import { PAGINATION } from '../../../constants/pagination';
import BlockingOverlay from './BlockingOverlay';
import Paginate from './Paginate';

type TemplateSelectModalProps = {
  show: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
};

export default function TemplateSelectModal({
  show,
  onClose,
  onSelect,
}: TemplateSelectModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = templates?.slice((currentPage - 1) * PAGINATION.ITEMS_PER_PAGE, currentPage * PAGINATION.ITEMS_PER_PAGE);
  const pageCount = Math.ceil(templates?.length / PAGINATION.ITEMS_PER_PAGE);

  useEffect(() => {
    if (show) {
      setSelectedTemplate(null);
      setTemplates([]);
      setCurrentPage(1);

      setLoading(true);
      fetch('/api/templates', {
        method: 'GET',
      }).then((res) => {
        if(res.ok) {
          return res.json();
        }
      }).then((data) => {
        setTemplates(data);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [show])

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  return (
    <>
      {loading && (
        <div className="position-relative">
          <BlockingOverlay type="loading" />
        </div>
      )}
      <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>テンプレートを選択</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {templates?.length === 0 ? (
              <p className="text-center m-0">未登録</p>
            ) : (
              paginated?.map((tpl) => (
                <ListGroup.Item key={tpl.id} onClick={() => setSelectedTemplate(tpl)} action>
                  <Row>
                    <Col xs={1} className="m-auto">
                      <BsFillCheckCircleFill style={{opacity: selectedTemplate?.id === tpl.id ? "1" : "0"}} />
                    </Col>
                    <Col xs={11}>
                      <div className="fw-bold text-truncate">{tpl.title}</div>
                      <p className="m-0 text-truncate"><small>{tpl.description ?? "-"}</small></p>
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
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button variant="primary" onClick={handleSelect} disabled={!selectedTemplate}>このテンプレートを使用</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
