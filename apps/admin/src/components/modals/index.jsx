export default function Modal({
  title = "Confirmation",
  description = "Please confirm this action before continuing.",
  children,
  isOpen = true,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div>
        <header>
          <h2 id="modal-title">{title}</h2>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <div>
          <p id="modal-description">
            {description}
          </p>

          {children}
        </div>

        <footer>
          <button
            type="button"
            onClick={handleClose}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}