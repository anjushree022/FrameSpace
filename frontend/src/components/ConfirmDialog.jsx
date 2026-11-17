import { Loader2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} title={title}>
      <p className="font-serif text-lg leading-snug text-mute">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-outline" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
