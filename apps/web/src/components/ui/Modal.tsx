import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button.tsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Buttons along the bottom. */
  footer?: ReactNode;
}

/**
 * A dialog built on the native <dialog> element, which handles focus trapping, Escape to close
 * and restoring focus to whatever opened it.
 */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-surface p-0 text-ink shadow-soft"
    >
      <div className="p-6">
        <h2 id={titleId} className="font-display text-2xl text-forest">
          {title}
        </h2>
        <div className="mt-3 text-sm leading-6 text-forest/75">{children}</div>
      </div>
      {footer && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-forest/10 px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Red confirm button, for actions that can't be undone. */
  destructive?: boolean;
  busy?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive = false,
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) onCancel();
      }}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
