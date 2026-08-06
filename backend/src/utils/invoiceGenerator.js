import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";

export async function generateInvoice(transaction) {
  // Setup
  const invoiceDir = path.join(process.cwd(), "uploads", "invoices");
  await fs.ensureDir(invoiceDir);
  const filename = `${transaction.invoiceNumber}.pdf`;
  const filepath = path.join(invoiceDir, filename);
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    autoFirstPage: false,
  });
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Add a new page
  doc.addPage();

  // HEADER SECTION
  // Resort logo
  const logoPath = path.join(process.cwd(), "public", "logo", "logo.png");
  const logoExists = await fs.pathExists(logoPath);
  if (logoExists) {
    doc.image(logoPath, 50, 40, { width: 70 });
  }
  // Resort name, address, GSTIN, Invoice Title
  const headerTop = 40;
  const headerHeight = 90;
  doc
    .fontSize(24)
    .fillColor("#0b6b3a")
    .text("MANGO TREE", logoExists ? 140 : 50, headerTop, { align: "left" });
  doc
    .fontSize(10)
    .fillColor("#222")
    .text("Plot 123, Resort Lane, City, State, 123456", logoExists ? 140 : 50, headerTop + 28, { align: "left" })
    .text("GSTIN: 22AAAAA0000A1Z5", logoExists ? 140 : 50, headerTop + 42, { align: "left" });
  doc
    .fontSize(18)
    .fillColor("black")
    .text("GST TAX INVOICE", 0, headerTop, { align: "right" });

  // Draw a line below header
  doc.moveTo(50, headerTop + headerHeight).lineTo(545, headerTop + headerHeight).strokeColor("#cccccc").lineWidth(1).stroke();

  // INVOICE METADATA (two columns)
  doc.fontSize(11).fillColor("#222");
  const metaTop = headerTop + headerHeight + 15;
  const leftX = 50, rightX = 320;
  doc.text(`Invoice No: ${transaction.invoiceNumber || "-"}`, leftX, metaTop);
  doc.text(`Date: ${transaction.date ? new Date(transaction.date).toLocaleDateString() : new Date().toLocaleDateString()}`, leftX, metaTop + 18);
  doc.text(`Payment Mode: ${transaction.paymentMode || "-"}`, rightX, metaTop);
  doc.text(`Invoice Type: ${transaction.invoiceType || "-"}`, rightX, metaTop + 18);

  // GUEST DETAILS BOX
  const guestBoxTop = metaTop + 40;
  doc.roundedRect(50, guestBoxTop, 220, 70, 7).strokeColor("#0b6b3a").lineWidth(1).stroke();
  doc.fontSize(11).fillColor("#0b6b3a").text("Guest Details", 60, guestBoxTop + 5, { bold: true });
  doc.fontSize(10).fillColor("#222");
  doc.text(`Name: ${transaction.guestName || "-"}`, 60, guestBoxTop + 22);
  doc.text(`Phone: ${transaction.guestPhone || "-"}`, 60, guestBoxTop + 36);
  doc.text(`Email: ${transaction.guestEmail || "-"}`, 60, guestBoxTop + 50);

  // ROOM DETAILS BOX
  doc.roundedRect(320, guestBoxTop, 225, 70, 7).strokeColor("#0b6b3a").lineWidth(1).stroke();
  doc.fontSize(11).fillColor("#0b6b3a").text("Room Details", 330, guestBoxTop + 5, { bold: true });
  doc.fontSize(10).fillColor("#222");
  doc.text(`Room No: ${transaction.roomNumber || "-"}`, 330, guestBoxTop + 22);
  doc.text(`Room Type: ${transaction.roomType || "-"}`, 330, guestBoxTop + 36);
  doc.text(`Check-in: ${transaction.checkIn ? new Date(transaction.checkIn).toLocaleDateString() : "-"}`, 330, guestBoxTop + 50);
  // Optionally: doc.text(`Check-out: ...`)

  // ITEMS TABLE
  const tableTop = guestBoxTop + 90;
  // Table headers
  const colX = [50, 80, 285, 340, 400, 460, 525];
  doc.fontSize(11).fillColor("black").font("Helvetica-Bold");
  doc.rect(colX[0], tableTop, colX[6] - colX[0], 22).fillAndStroke("#eafaf3", "#0b6b3a");
  doc
    .fillColor("#0b6b3a")
    .text("Sr", colX[0] + 2, tableTop + 6, { width: colX[1] - colX[0] - 4, align: "center" })
    .text("Description", colX[1] + 2, tableTop + 6, { width: colX[2] - colX[1] - 4, align: "left" })
    .text("Qty", colX[2] + 2, tableTop + 6, { width: colX[3] - colX[2] - 4, align: "center" })
    .text("Rate", colX[3] + 2, tableTop + 6, { width: colX[4] - colX[3] - 4, align: "right" })
    .text("GST %", colX[4] + 2, tableTop + 6, { width: colX[5] - colX[4] - 4, align: "center" })
    .text("Amount", colX[5] + 2, tableTop + 6, { width: colX[6] - colX[5] - 4, align: "right" });
  doc.font("Helvetica").fillColor("#222");

  // Table rows
  let rowY = tableTop + 22;
  (transaction.items || []).forEach((item, idx) => {
    doc.rect(colX[0], rowY, colX[6] - colX[0], 20).strokeColor("#e2e2e2").lineWidth(0.4).stroke();
    doc
      .text(String(idx + 1), colX[0] + 2, rowY + 5, { width: colX[1] - colX[0] - 4, align: "center" })
      .text(item.description || "-", colX[1] + 2, rowY + 5, { width: colX[2] - colX[1] - 4, align: "left" })
      .text(item.quantity !== undefined ? item.quantity : "-", colX[2] + 2, rowY + 5, { width: colX[3] - colX[2] - 4, align: "center" })
      .text(item.unitPrice !== undefined ? Number(item.unitPrice).toFixed(2) : "-", colX[3] + 2, rowY + 5, { width: colX[4] - colX[3] - 4, align: "right" })
      .text(item.gstPercent !== undefined ? Number(item.gstPercent).toFixed(2) : "-", colX[4] + 2, rowY + 5, { width: colX[5] - colX[4] - 4, align: "center" })
      .text(item.total !== undefined ? Number(item.total).toFixed(2) : "-", colX[5] + 2, rowY + 5, { width: colX[6] - colX[5] - 4, align: "right" });
    rowY += 20;
  });
  // If no items, show a blank row
  if (!transaction.items || transaction.items.length === 0) {
    doc.rect(colX[0], rowY, colX[6] - colX[0], 20).strokeColor("#e2e2e2").lineWidth(0.4).stroke();
    doc.text("No items", colX[1] + 2, rowY + 5, { width: colX[2] - colX[1] - 4, align: "left" });
    rowY += 20;
  }

  // TOTALS SECTION (right-aligned)
  let totalsY = rowY + 15;
  const totalsX = 340;
  doc.fontSize(11).fillColor("black").font("Helvetica");
  function printTotal(label, value, bold, offset = 0) {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica");
    doc.text(label, totalsX, totalsY + offset, { width: 100, align: "left" });
    doc.text(`₹${Number(value).toFixed(2)}`, totalsX + 100, totalsY + offset, { width: 90, align: "right" });
  }
  printTotal("Subtotal", transaction.subtotal || 0, false, 0);
  printTotal("GST", transaction.gstAmount || 0, false, 18);
  let offset = 36;
  if (transaction.discount) {
    printTotal("Discount", -Math.abs(transaction.discount), false, offset);
    offset += 18;
  }
  if (transaction.serviceCharge) {
    printTotal("Service Charge", transaction.serviceCharge, false, offset);
    offset += 18;
  }
  doc.font("Helvetica-Bold");
  doc.text("Grand Total", totalsX, totalsY + offset, { width: 100, align: "left" });
  doc.text(`₹${Number(transaction.totalAmount).toFixed(2)}`, totalsX + 100, totalsY + offset, { width: 90, align: "right" });

  // FOOTER
  let footerY = Math.max(totalsY + offset + 35, rowY + 80);
  doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#cccccc").lineWidth(1).stroke();
  doc.fontSize(12).fillColor("#0b6b3a").font("Helvetica-Bold")
    .text("Thank You For Visiting Mango Tree Resort", 0, footerY + 10, { align: "center" });
  doc.fontSize(8).fillColor("#888").font("Helvetica")
    .text("This is a computer generated invoice and does not require a physical signature.", 50, footerY + 32, { align: "left" });
  // Signature placeholder
  doc.fontSize(10).fillColor("#222").font("Helvetica")
    .text("Authorized Signature", 440, footerY + 32, { align: "right" });
  doc.moveTo(500, footerY + 50).lineTo(545, footerY + 50).strokeColor("#888").lineWidth(0.7).stroke();

  doc.end();
  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      resolve({ filepath, filename });
    });
    stream.on("error", (err) => {
      reject(err);
    });
  });
}