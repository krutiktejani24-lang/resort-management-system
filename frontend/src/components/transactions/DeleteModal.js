import React from "react";

export default function DeleteModal({
  open,
  title = "Delete Transaction",
  message = "Are you sure you want to delete this transaction?",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 420,
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        }}
      >
        {/* Header */}

        <div
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            ⚠ {title}
          </h2>
        </div>

        {/* Body */}

        <div
          style={{
            padding: 25,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#374151",
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          <div
            style={{
              marginTop: 30,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              onClick={onCancel}
              style={{
                padding: "10px 22px",
                background: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              style={{
                padding: "10px 22px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}