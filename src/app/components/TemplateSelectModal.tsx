'use client';

import { Modal, Button, ListGroup, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Template } from '../../../types/formType';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import BlockingOverlay from './BlockingOverlay';

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

  useEffect(() => {
    if (show) {
      setSelectedTemplate(null);
      setTemplates([]);

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
              templates?.map((tpl) => (
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleSelect} disabled={!selectedTemplate}>
            このテンプレートを使用
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
