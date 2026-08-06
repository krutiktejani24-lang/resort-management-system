import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Generates a bank-statement style PDF register of all transactions —
 * a running table of every transaction plus a summary block, suitable
 * for accounting / tax records.
 *
 * @param {Array} transactions - filtered transaction list
 * @param {string} reportTitle - e.g. "July 2026" / "All Time"
 * @param {object} summary - { CASH, CARD, ONLINE, TOTAL, COUNT }
 * @param {object} [options]
 * @param {boolean} [options.forPrint] - if true, opens the PDF in a new
 *   tab and triggers the browser print dialog instead of downloading it.
 */
export default function generateTransactionsPDF(
  transactions,
  reportTitle,
  summary,
  { forPrint = false } = {}
) {
  const doc = new jsPDF({ orientation: "landscape" });

  const GREEN = [21, 128, 61];
  const DARK = [31, 41, 55];
  const LIGHT = [107, 114, 128];
  const pageWidth = doc.internal.pageSize.getWidth();

  // -----------------------------
  // Header banner
  // -----------------------------
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MANGO TREE RESORT", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TRANSACTION STATEMENT", 14, 19);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Period: ${reportTitle}`, pageWidth - 14, 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageWidth - 14, 19, {
    align: "right",
  });

  // -----------------------------
  // Summary strip (account-summary style)
  // -----------------------------
  const summaryY = 34;
  const cards = [
    ["Total Transactions", summary.COUNT ?? transactions.length],
    ["Cash Collection", `Rs ${money(summary.CASH)}`],
    ["Card Collection", `Rs ${money(summary.CARD)}`],
    ["Online Collection", `Rs ${money(summary.ONLINE)}`],
    ["Grand Total", `Rs ${money(summary.TOTAL)}`],
  ];
  const cardWidth = (pageWidth - 28) / cards.length;

  cards.forEach(([label, value], i) => {
    const x = 14 + i * cardWidth;
    doc.setDrawColor(...GREEN);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(x, summaryY, cardWidth - 4, 18, 2, 2, "FD");

    doc.setTextColor(...LIGHT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label, x + 4, summaryY + 7);

    doc.setTextColor(...GREEN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(String(value), x + 4, summaryY + 15);
  });

  // -----------------------------
  // Transaction ledger table
  // -----------------------------
  autoTable(doc, {
    startY: summaryY + 26,
    head: [[
      "Date",
      "Invoice No",
      "Guest",
      "Phone",
      "Payment Mode",
      "Subtotal",
      "GST",
      "Total",
    ]],
    body: transactions.map((t) => [
      formatDate(t.date),
      t.invoiceNumber || "-",
      t.guestName || "-",
      t.guestPhone || "-",
      t.paymentMode || "-",
      money(t.subtotal),
      money(t.gstAmount),
      money(t.totalAmount),
    ]),
    foot: [[
      "", "", "", "", "TOTAL",
      money(transactions.reduce((s, t) => s + Number(t.subtotal || 0), 0)),
      money(transactions.reduce((s, t) => s + Number(t.gstAmount || 0), 0)),
      money(transactions.reduce((s, t) => s + Number(t.totalAmount || 0), 0)),
    ]],
    theme: "grid",
    headStyles: {
      fillColor: GREEN,
      textColor: [255, 255, 255],
      halign: "center",
      fontStyle: "bold",
      fontSize: 9,
    },
    footStyles: {
      fillColor: [240, 253, 244],
      textColor: DARK,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: DARK,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 249],
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 32 },
      2: { cellWidth: 45 },
      3: { cellWidth: 28 },
      4: { cellWidth: 28, halign: "center" },
      5: { cellWidth: 26, halign: "right" },
      6: { cellWidth: 22, halign: "right" },
      7: { cellWidth: 28, halign: "right" },
    },
    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(...LIGHT);
      doc.text(
        `Mango Tree Resort | Transaction Statement`,
        14,
        doc.internal.pageSize.getHeight() - 8
      );
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    },
  });

  const safeTitle = reportTitle.replace(/\s+/g, "_").replace(/[^\w]/g, "");

  if (forPrint) {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`MangoTree_Statement_${safeTitle}.pdf`);
  }
}
