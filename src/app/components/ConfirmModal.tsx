'use client';

import { Modal, Button } from 'react-bootstrap';

type DeleteConfirmModalProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
};

export default function ConfirmModal({
  show,
  onClose,
  onConfirm,
  itemName = 'このアイテム',
}: DeleteConfirmModalProps) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>削除の確認</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-truncate"><strong>{itemName}</strong></p>
        <p>を本当に削除しますか？この操作は元に戻せません。</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          削除する
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
