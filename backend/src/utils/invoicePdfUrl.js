import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";

import { generateQRCode } from "./qrCode.js";
import { invoiceTemplate } from "../../templates/invoiceTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, "../../public/logo/logo.png");

const logoBase64 = fs.readFileSync(logoPath, "base64");

export const generateInvoicePdf = async (booking) => {

  const invoicesFolder = path.join(
    __dirname,
    "../../public/invoices"
  );

  if (!fs.existsSync(invoicesFolder)) {
    fs.mkdirSync(invoicesFolder, {
      recursive: true,
    });
  }

  const fileName = `${booking.bookingNumber}.pdf`;

  const filePath = path.join(
    invoicesFolder,
    fileName
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  // QR Code
  const qrCode = await generateQRCode(booking.bookingNumber);

  // HTML Load
  await page.setContent(
    invoiceTemplate(
      booking,
      qrCode,
      logoBase64
    ),
    {
      waitUntil: "networkidle0",
    }
  );

  // Generate PDF
  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "15mm",
      bottom: "15mm",
      left: "10mm",
      right: "10mm",
    },
  });

  await browser.close();

return {
  pdfPath: filePath,
  pdfUrl: `/invoices/${fileName}`,
};
};