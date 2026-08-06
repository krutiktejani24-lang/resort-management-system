import React from "react";

function money(value) {
  return (
    "₹" +
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const CARD_COLORS = {
  CASH: {
    bg: "#dcfce7",
    border: "#22c55e",
    text: "#15803d",
    icon: "💵",
  },

  CARD: {
    bg: "#f3e8ff",
    border: "#a855f7",
    text: "#7e22ce",
    icon: "💳",
  },

  ONLINE: {
    bg: "#dbeafe",
    border: "#3b82f6",
    text: "#2563eb",
    icon: "📱",
  },

  TOTAL: {
    bg: "#ecfdf5",
    border: "#16a34a",
    text: "#14532d",
    icon: "💰",
  },
};

function Card({
  title,
  amount,
  count,
  type,
}) {
  const color = CARD_COLORS[type];

  return (
    <div
      style={{
        background: color.bg,
        borderLeft: `5px solid ${color.border}`,
        borderRadius: 10,
        padding: 18,
        boxShadow: "0 2px 6px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: 28 }}>
          {color.icon}
        </div>
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: color.text,
        }}
      >
        {money(amount)}
      </div>

      <div
        style={{
          marginTop: 8,
          color: "#6b7280",
          fontSize: 13,
        }}
      >
        {count} Transactions
      </div>
    </div>
  );
}

export default function SummaryCards({
  summary,
}) {
  const totals = summary || {
    CASH: 0,
    CARD: 0,
    ONLINE: 0,
    TOTAL: 0,
    COUNT: 0,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: 18,
        marginBottom: 25,
      }}
    >
      <Card
        title="Cash Collection"
        amount={totals.CASH}
        count={0}
        type="CASH"
      />

      <Card
        title="Card Collection"
        amount={totals.CARD}
        count={0}
        type="CARD"
      />

      <Card
        title="Online Collection"
        amount={totals.ONLINE}
        count={0}
        type="ONLINE"
      />

      <Card
        title="Grand Total"
        amount={totals.TOTAL}
        count={totals.COUNT}
        type="TOTAL"
      />
    </div>
  );
}