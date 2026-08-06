import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePDF = async (invoiceData) => {

  const invoiceDir = path.join(process.cwd(), "public", "invoices");

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }

  const pdfUrl = path.join(
    invoiceDir,
    `${invoiceData.bookingNumber}.pdf`
  );

  const doc = new PDFDocument();

  const stream = fs.createWriteStream(pdfUrl);

  doc.pipe(stream);

  doc.fontSize(24).text("Mango Tree Resort", {
    align: "center",
  });

  doc.moveDown();

  doc.fontSize(16).text(`Invoice : ${invoiceData.bookingNumber}`);

  doc.text(`Guest : ${invoiceData.guestName}`);

  doc.text(`Email : ${invoiceData.guestEmail}`);

  doc.text(`Phone : ${invoiceData.guestPhone}`);

  doc.moveDown();

  doc.text(`Room : ${invoiceData.roomNumber}`);

  doc.text(`Check In : ${invoiceData.checkIn}`);

  doc.text(`Check Out : ${invoiceData.checkOut}`);

  doc.text(`Nights : ${invoiceData.totalNights}`);

  doc.moveDown();

  doc.text(`Subtotal : ₹${invoiceData.totalAmount}`);

  doc.text(`GST : ₹${invoiceData.taxAmount}`);

  doc.text(`Grand Total : ₹${invoiceData.finalAmount}`);

  doc.moveDown();

  doc.text("Thank You For Visiting Mango Tree Resort", {
    align: "center",
  });

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => {
      resolve({
        success: true,
        pdfUrl,
      });
    });
  });

};