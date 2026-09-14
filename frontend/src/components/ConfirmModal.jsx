import { useEffect } from "react";
import {
  AlertTriangle,
  X,
} from "lucide-react";

import "./ConfirmModal.css";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Go Back",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        onCancel();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    loading,
    onCancel,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="confirm-modal__overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onCancel();
        }
      }}
    >
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          className="confirm-modal__close"
          aria-label="Close confirmation"
          disabled={loading}
          onClick={onCancel}
        >
          <X size={20} />
        </button>

        <div
          className={`confirm-modal__icon ${
            danger
              ? "is-danger"
              : ""
          }`}
        >
          <AlertTriangle
            size={26}
          />
        </div>

        <h2
          id="confirm-modal-title"
        >
          {title}
        </h2>

        <p>
          {message}
        </p>

        <div className="confirm-modal__actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`btn ${
              danger
                ? "confirm-modal__danger"
                : "btn-primary"
            }`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading
              ? "Processing..."
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}