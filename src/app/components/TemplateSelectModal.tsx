'use client';

import { Modal, Button, ListGroup, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Template } from '../../../types/formType';
import Loading from './Loading';
import { BsFillCheckCircleFill } from 'react-icons/bs';

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (show) {
      setSelectedTemplate(null);
      setTemplates([]);
      fetch('/api/templates')
        .then(res => res.json())
        .then(setTemplates)
        .then(() => setLoading(false))
    } else {
      setLoading(true);
    }
  }, [show])

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  return (!loading &&
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>テンプレートを選択</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {templates.length === 0 ? (
            <p className="text-center m-0">未登録</p>
          ) : (
            templates.map((tpl) => (
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
  );
}
