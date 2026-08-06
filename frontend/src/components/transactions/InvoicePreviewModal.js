import React from "react";

export default function InvoicePreviewModal({
  open,
  invoice,
  onClose,
}) {

  if (!open || !invoice) return null; 

  const pdfUrl = invoice?.invoicePdfUrl
  ? invoice.invoicePdfUrl.startsWith("http")
    ? invoice.invoicePdfUrl
    : `http://localhost:8000${invoice.invoicePdfUrl}`
  : "";

  
return (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: "90%",
        height: "90%",
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "#15803d",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Back to Transactions
        </button>

        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 28,
            cursor: "pointer",
            lineHeight: 1,
            color: "#374151",
          }}
        >
          ×
        </button>
      </div>

      {pdfUrl ? (
  <iframe
  title="Invoice"
  src={`${pdfUrl}#toolbar=0`}
  loading="lazy"
  style={{
    width: "100%",
    flex: 1,
    border: "none",
  }}
/>
) : (
  <div
    style={{
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 20,
      color: "#6b7280",
    }}
  >
    Invoice PDF not available.
  </div>
)}
    </div>
  </div>
);
}