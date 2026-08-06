import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

function money(value) {

  return (
    "₹" +
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )
  );

}

export default function generateInvoicePDF(
  invoice
) {

  const doc = new jsPDF();

  // -----------------------------
  // Colors
  // -----------------------------

  const GREEN = [21, 128, 61];

  const DARK = [31, 41, 55];

  const LIGHT = [107, 114, 128];

  // -----------------------------
  // Header
  // -----------------------------

  doc.setFillColor(...GREEN);

  doc.rect(
    0,
    0,
    210,
    32,
    "F"
  );

  doc.setTextColor(255);

  doc.setFontSize(22);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "MANGO TREE RESORT",
    14,
    15
  );

  doc.setFontSize(11);

  doc.text(
    "GST TAX INVOICE",
    14,
    23
  );

  doc.setTextColor(...DARK);

  doc.setFontSize(10);

  doc.text(
    `Invoice No : ${
      invoice.invoiceNumber || "-"
    }`,
    145,
    15
  );

  doc.text(
    `Date : ${
      invoice.date || "-"
    }`,
    145,
    22
  );

  doc.line(
    14,
    36,
    196,
    36
  );
    // -----------------------------
  // Guest Information
  // -----------------------------

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(13);

  doc.text(
    "Guest Information",
    14,
    45
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.setTextColor(...LIGHT);

  doc.text(
    `Guest Name : ${
      invoice.guest || "-"
    }`,
    14,
    53
  );

  doc.text(
    `Phone : ${
      invoice.phone || "-"
    }`,
    14,
    60
  );

  doc.text(
    `Email : ${
      invoice.email || "-"
    }`,
    14,
    67
  );

  // -----------------------------
  // Invoice Details
  // -----------------------------

  doc.setTextColor(...DARK);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "Invoice Details",
    120,
    45
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setTextColor(...LIGHT);

  doc.text(
    `Bill Type : ${
      invoice.billType || "-"
    }`,
    120,
    53
  );

  doc.text(
    `Payment : ${
      invoice.payment || "-"
    }`,
    120,
    60
  );

  doc.text(
    `Status : PAID`,
    120,
    67
  );

  // -----------------------------
  // Notes
  // -----------------------------

  if (
    invoice.notes &&
    invoice.notes.trim() !== ""
  ) {

    doc.setTextColor(...DARK);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Notes",
      14,
      80
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setTextColor(...LIGHT);

    doc.text(
      invoice.notes,
      14,
      87
    );

  }
    // -----------------------------
  // Invoice Items Table
  // -----------------------------

  autoTable(doc, {

    startY:
      invoice.notes &&
      invoice.notes.trim() !== ""
        ? 98
        : 78,

    head: [[

      "Description",

      "Qty",

      "Price",

      "GST",

      "Amount",

    ]],

    body:
      invoice.items.map(
        (item) => [

          item.description,

          item.qty,

          money(item.price),

          item.gst + "%",

          money(
            Number(item.qty) *
            Number(item.price)
          ),

        ]
      ),

    theme: "grid",

    headStyles: {

      fillColor: GREEN,

      textColor: [255, 255, 255],

      halign: "center",

      fontStyle: "bold",

      fontSize: 10,

    },

    bodyStyles: {

      fontSize: 10,

      textColor: DARK,

      valign: "middle",

    },

    alternateRowStyles: {

      fillColor: [245, 245, 245],

    },

    columnStyles: {

      0: {
        cellWidth: 80,
      },

      1: {
        halign: "center",
        cellWidth: 20,
      },

      2: {
        halign: "right",
        cellWidth: 30,
      },

      3: {
        halign: "center",
        cellWidth: 20,
      },

      4: {
        halign: "right",
        cellWidth: 35,
      },

    },

  });

  // -----------------------------
  // Current Y Position
  // -----------------------------

  let currentY =
    doc.lastAutoTable.finalY + 12;
      // -----------------------------
  // Invoice Total Box
  // -----------------------------

  doc.setDrawColor(...GREEN);

  doc.setFillColor(
    240,
    253,
    244
  );

  doc.roundedRect(

    120,

    currentY,

    76,

    36,

    2,

    2,

    "FD"

  );

  // -----------------------------
  // Subtotal
  // -----------------------------

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setTextColor(...DARK);

  doc.setFontSize(11);

  doc.text(

    "Subtotal",

    126,

    currentY + 10

  );

  doc.text(

    money(invoice.subtotal),

    190,

    currentY + 10,

    {
      align: "right",
    }

  );

  // -----------------------------
  // GST
  // -----------------------------

  doc.text(

    "GST",

    126,

    currentY + 18

  );

  doc.text(

    money(invoice.gstAmount),

    190,

    currentY + 18,

    {
      align: "right",
    }

  );

  // -----------------------------
  // Divider
  // -----------------------------

  doc.setDrawColor(
    180,
    180,
    180
  );

  doc.line(

    124,

    currentY + 22,

    192,

    currentY + 22

  );

  // -----------------------------
  // Grand Total
  // -----------------------------

  doc.setFont(

    "helvetica",

    "bold"

  );

  doc.setTextColor(...GREEN);

  doc.setFontSize(14);

  doc.text(

    "Grand Total",

    126,

    currentY + 31

  );

  doc.text(

    money(invoice.grandTotal),

    190,

    currentY + 31,

    {
      align: "right",
    }

  );

  // -----------------------------
  // Next Y Position
  // -----------------------------

  currentY += 52;
    // -----------------------------
  // Thank You Message
  // -----------------------------

  doc.setTextColor(...GREEN);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(13);

  doc.text(

    "Thank You For Visiting Mango Tree Resort",

    14,

    currentY

  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.setTextColor(...LIGHT);

  doc.text(

    "We appreciate your stay and look forward to welcoming you again.",

    14,

    currentY + 8

  );

  // -----------------------------
  // Signature
  // -----------------------------

  doc.setDrawColor(...DARK);

  doc.line(

    145,

    currentY + 18,

    195,

    currentY + 18

  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(10);

  doc.setTextColor(...DARK);

  doc.text(

    "Authorized Signature",

    150,

    currentY + 25

  );

  // -----------------------------
  // Footer
  // -----------------------------

  doc.setDrawColor(210);

  doc.line(

    14,

    285,

    196,

    285

  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.setTextColor(...LIGHT);

  doc.text(

    "MANGO TREE RESORT | GST TAX INVOICE",

    14,

    291

  );

  doc.text(

    `Generated : ${new Date().toLocaleString("en-IN")}`,

    196,

    291,

    {
      align: "right",
    }

  );

  // -----------------------------
  // Save PDF
  // -----------------------------

  const fileName = `Invoice-${
    invoice.invoiceNumber || "Invoice"
  }.pdf`;

  doc.save(fileName);

}