  import React from "react";

  // =============================================
  // Currency Formatter
  // =============================================

  function money(value) {
    return (
      "₹" +
      Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  // =============================================
  // Date Formatter
  // =============================================

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // =============================================
  // Payment Badge
  // =============================================

  function PaymentBadge({ payment }) {
    const styles = {
      CASH: {
        background: "#dcfce7",
        color: "#166534",
      },
      CARD: {
        background: "#dbeafe",
        color: "#1d4ed8",
      },
      ONLINE: {
        background: "#ede9fe",
        color: "#6d28d9",
      },
    };

    const style =
      styles[payment] || {
        background: "#f3f4f6",
        color: "#374151",
      };

    return (
      <span
        style={{
          ...style,
          padding: "6px 12px",
          borderRadius: 30,
          fontWeight: 700,
          fontSize: 13,
          display: "inline-block",
        }}
      >
        {payment}
      </span>
    );
  }

  // =============================================
  // Invoice Type Badge
  // =============================================

  function InvoiceBadge({ type }) {
    return (
      <span
        style={{
          background:
            type === "GST"
              ? "#dcfce7"
              : "#fef3c7",
          color:
            type === "GST"
              ? "#166534"
              : "#92400e",
          padding: "6px 12px",
          borderRadius: 30,
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {type || "GST"}
      </span>
    );
  }

  // =============================================
  // Status Badge
  // =============================================

  function StatusBadge({ status }) {
    const map = {
      PAID: {
        bg: "#dcfce7",
        color: "#166534",
      },
      PENDING: {
        bg: "#fef3c7",
        color: "#92400e",
      },
      REFUNDED: {
        bg: "#fee2e2",
        color: "#b91c1c",
      },
    };

    const s =
      map[status] || {
        bg: "#f3f4f6",
        color: "#374151",
      };

    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "6px 12px",
          borderRadius: 30,
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {status}
      </span>
    );
  }

  // =============================================
  // Component
  // =============================================

  export default function TransactionTable({
    transactions = [],
    loading,
    onDownload,
    onPrint,
  }) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflowX: "auto",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 10px rgba(0,0,0,.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 1300,
          }}
        >
          <thead>
            <tr
              style={{
                background: "#15803d",
                color: "#fff",
              }}
            >
              <th style={th}>Invoice</th>
              <th style={th}>Guest</th>
              <th style={th}>Phone</th>
              <th style={th}>Room</th>
              <th style={th}>Payment</th>
              <th style={th}>Invoice Type</th>
              <th style={th}>Status</th>

              <th
                style={{
                  ...th,
                  textAlign: "right",
                }}
              >
                Amount
              </th>

              <th style={th}>Date</th>

              <th
                style={{
                  ...th,
                  textAlign: "center",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
                      {/* ===================================== */}
            {/* Loading */}
            {/* ===================================== */}

            {loading && (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#6b7280",
                    fontWeight: 600,
                  }}
                >
                  Loading Transactions...
                </td>
              </tr>
            )}

            {/* ===================================== */}
            {/* Empty */}
            {/* ===================================== */}

            {!loading && transactions.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#9ca3af",
                    fontWeight: 600,
                  }}
                >
                  No Transactions Found
                </td>
              </tr>
            )}

            {/* ===================================== */}
            {/* Rows */}
            {/* ===================================== */}

            {!loading &&
              transactions.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    background:
                      index % 2 === 0
                        ? "#ffffff"
                        : "#f9fafb",
                    transition: "0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "#ecfdf5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      index % 2 === 0
                        ? "#ffffff"
                        : "#f9fafb";
                  }}
                >
                  {/* Invoice */}

                  <td style={td}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#15803d",
                      }}
                    >
                      {item.invoiceNumber}
                    </div>
                  </td>

                  {/* Guest */}

                  <td style={td}>
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {item.guestName || "-"}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 4,
                      }}
                    >
                      {item.guestEmail || "-"}
                    </div>
                  </td>

                  {/* Phone */}

                  <td style={td}>
                    {item.guestPhone || "-"}
                  </td>

                  {/* Room */}

                  <td style={td}>
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {item.roomNumber || "-"}
                    </div>

                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {item.roomType || ""}
                    </div>
                  </td>

                  {/* Payment */}

                  <td style={td}>
                    <PaymentBadge
                      payment={item.paymentMode}
                    />
                  </td>

                  {/* Invoice Type */}

                  <td style={td}>
                    <InvoiceBadge
                      type={item.invoiceType}
                    />
                  </td>

                  {/* Status */}

                  <td style={td}>
                    <StatusBadge
                      status={item.status}
                    />
                  </td>

                  {/* Amount */}

                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontWeight: 700,
                      color: "#15803d",
                      fontSize: 15,
                    }}
                  >
                    {money(item.totalAmount)}
                  </td>

                  {/* Date */}

                  <td style={td}>
                    {formatDate(item.date)}
                  </td>

                  {/* Actions શરૂ થશે Part 3 માં */}

                  <td
                    style={{
                      ...td,
                      textAlign: "center",
                    }}
                  >
                    {/* Download PDF */}

                    <button
                      type="button"
                      onClick={() =>
                        onDownload &&
                        onDownload(item)
                      }
                      style={{
                        background: "#059669",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 12px",
                        cursor: "pointer",
                        marginRight: 6,
                        fontWeight: 600,
                      }}
                    >
                      📄
                    </button>

                    {/* Print */}

                    <button
                      type="button"
                      onClick={() =>
                        onPrint &&
                        onPrint(item)
                      }
                      style={{
                        background: "#7c3aed",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🖨
                    </button>

                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

      );
    } 

  // =============================================
  // Common Styles
  // =============================================

  const th = {
    padding: "14px",
    textAlign: "left",
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: "nowrap",
  };

  const td = {
    padding: "14px",
    verticalAlign: "middle",
    fontSize: 14,
    color: "#374151",
  };