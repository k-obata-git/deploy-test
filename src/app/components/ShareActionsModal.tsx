'use client';

import React from 'react';
import { Modal, ListGroup } from 'react-bootstrap';
import { BsBoxArrowUpRight, BsCopy } from 'react-icons/bs';
import QRCode from 'react-qr-code';

interface Props {
  show: boolean;
  onHide: () => void;
  formUrl: string;
}

const ShareActionsModal: React.FC<Props> = ({ show, onHide, formUrl }) => {
  const copyToClipboard = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(formUrl);
      } catch (err) {
        alert('コピーに失敗しました');
      }
    } else {
      // フォールバック（旧ブラウザ対応）
      const textArea = document.createElement('textarea');
      textArea.value = formUrl;
      textArea.style.position = 'fixed';  // iOS対応
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        alert('コピーに失敗しました');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleOpen = () => {
    window.open(formUrl, '_blank');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>共有オプション</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          <div className="text-center my-3"><QRCode value={formUrl} size={160} /></div>
          <ListGroup.Item action onClick={copyToClipboard}><BsCopy className="me-2" />リンクをコピー</ListGroup.Item>
          <ListGroup.Item action onClick={handleOpen}><BsBoxArrowUpRight className="me-2" />新しいタブで開く</ListGroup.Item>
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default ShareActionsModal;
