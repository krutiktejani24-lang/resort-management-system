import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendInvoiceEmail as sendInvoiceEmailService } from "../services/email.service.js";

import fs from "fs";
import path from "path";

import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

/* ============================================================
   CONSTANTS
============================================================ */

export const PAYMENT_MODES = Object.freeze({
  CASH: "CASH",
  CARD: "CARD",
  ONLINE: "ONLINE",
  UPI: "UPI",
});

export const INVOICE_TYPE = Object.freeze({
  GST: "GST",
});

export const TRANSACTION_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
  PARTIAL_REFUND: "PARTIAL_REFUND",
});

/* ============================================================
   EMAIL
============================================================ */

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ============================================================
   HELPERS
============================================================ */

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
};

const decimal = (value) =>
  new Prisma.Decimal(safeNumber(value));

const sanitize = (value = "") =>
  String(value).trim();

/* ============================================================
   GENERATE INVOICE NUMBER
============================================================ */

const generateInvoiceNumber = async (tx) => {
  while (true) {
    const latest = await tx.transaction.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        invoiceNumber: true,
      },
    });

    let next = 1;

    if (latest?.invoiceNumber) {
      next =
        Number(
          latest.invoiceNumber.replace(/\D/g, "")
        ) + 1;
    }

    const invoiceNumber =
      `INV-${String(next).padStart(6, "0")}`;

    const exists =
      await tx.transaction.findUnique({
        where: {
          invoiceNumber,
        },
      });

    if (!exists) {
      return invoiceNumber;
    }
  }
};

/* ============================================================
   GST CALCULATOR
============================================================ */

const calculateItems = (items = []) => {

  let subtotal = 0;

  let gstAmount = 0;

  const billItems = [];

  for (const item of items) {

    const quantity = safeNumber(
      item.quantity ?? item.qty,
      1
    );

    const unitPrice = safeNumber(
      item.unitPrice ?? item.price
    );

    const gstPercent = safeNumber(
      item.gstPercent ?? item.gst ?? 18
    );

    const lineSubtotal =
      quantity * unitPrice;

    const lineGST =
      (lineSubtotal * gstPercent) / 100;

    const total =
      lineSubtotal + lineGST;

    subtotal += lineSubtotal;

    gstAmount += lineGST;

    billItems.push({

      category:
        sanitize(item.category) || "OTHER",

      description:
        sanitize(item.description),

      quantity,

      unitPrice: decimal(unitPrice),

      gstPercent,

      total: decimal(total),

    });

  }

  return {

    subtotal: decimal(subtotal),

    gstAmount: decimal(gstAmount),

    grandTotal: decimal(
      subtotal + gstAmount
    ),

    billItems,

  };

};

/* ============================================================
   VALIDATIONS
============================================================ */

const validateTransaction = (body) => {

  if (!sanitize(body.guestName)) {

    return "Guest name is required.";

  }

  if (
    !Object.values(PAYMENT_MODES).includes(
      body.paymentMode
    )
  ) {

    return "Invalid payment mode.";

  }

  if (
    body.billType !== "GST"
  ) {

    return "Only GST invoices are supported.";

  }

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {

    return "At least one bill item is required.";

  }

  return null;

};

/* ============================================================
   COMMON FILTER BUILDER
============================================================ */

const buildDateFilter = (
  fromDate,
  toDate,
  field = "date"
) => {

  if (!fromDate && !toDate)
    return {};

  const where = {};

  where[field] = {};

  if (fromDate) {

    where[field].gte =
      new Date(fromDate);

  }

  if (toDate) {

    const end =
      new Date(toDate);

    end.setHours(
      23,
      59,
      59,
      999
    );

    where[field].lte = end;

  }

  return where;

};

/* ============================================================
   FILE HELPERS
============================================================ */

const getInvoiceAbsolutePath = (
  invoicePdfUrl
) => {

  return path.join(

    process.cwd(),

    invoicePdfUrl.replace(/^\/+/, "")

  );

};

const invoiceExists = (
  invoicePdfUrl
) => {

  if (!invoicePdfUrl)
    return false;

  return fs.existsSync(

    getInvoiceAbsolutePath(
      invoicePdfUrl
    )

  );

};

/* ============================================================
   AUTO-SEND INVOICE (email)
   Sends to the guest email if present on the record.
   Never throws — failures are logged so they don't block the
   caller's response.
============================================================ */

const dispatchInvoice = async ({
  guestEmail,
  guestName,
  invoiceNumber,
  invoicePdfUrl,
}) => {
  if (!invoicePdfUrl || !guestEmail) return;

  try {
    await sendInvoiceEmailService({
      email: guestEmail,
      guestName,
      bookingNumber: invoiceNumber,
      pdfPath: getInvoiceAbsolutePath(invoicePdfUrl),
    });
  } catch (err) {
    console.error("Invoice email send failed:", err.message);
  }
};
// ======================================================
// GET ALL TRANSACTIONS (Part 2A-1)
// ======================================================

export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      paymentMode = "ALL",
      invoiceType = "ALL",
      source = "ALL",
      fromDate,
      toDate,
      sortBy = "date",
      order = "desc",
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);

    const sortableFields = [
      "date",
      "createdAt",
      "invoiceNumber",
      "guestName",
      "totalAmount",
    ];

    const orderField = sortableFields.includes(sortBy)
      ? sortBy
      : "date";

    // ==================================================
    // Manual Transaction Filters
    // ==================================================

    const transactionWhere = {
      isDeleted: false,
    };

    if (
      paymentMode &&
      paymentMode !== "ALL"
    ) {
      transactionWhere.paymentMode = paymentMode;
    }

    // Only GST invoices supported

    if (
      invoiceType &&
      invoiceType !== "ALL"
    ) {
      transactionWhere.invoiceType = "GST";
    }

    if (fromDate || toDate) {
      transactionWhere.date = {};

      if (fromDate) {
        transactionWhere.date.gte = new Date(fromDate);
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);

        transactionWhere.date.lte = end;
      }
    }

    if (search.trim()) {
      transactionWhere.OR = [
        {
          invoiceNumber: {
            contains: search,
          },
        },
        {
          guestName: {
            contains: search,
          },
        },
        {
          guestPhone: {
            contains: search,
          },
        },
        {
          guestEmail: {
            contains: search,
          },
        },
        {
          notes: {
            contains: search,
          },
        },
      ];
    }

    // ==================================================
    // Manual Transactions
    // ==================================================

    const manualTransactions =
      await prisma.transaction.findMany({
        where: transactionWhere,

        include: {
          items: true,
        },

        orderBy: {
          [orderField]:
            order === "asc"
              ? "asc"
              : "desc",
        },
      });

    // ==================================================
    // Booking Transactions
    // ==================================================


    // Remaining Part 2A-2...
        // ==================================================
    // Convert Bookings -> Transactions
    // ==================================================



    // ==================================================
    // Manual Transactions
    // ==================================================

    const manualData =
      manualTransactions.map(
        (transaction) => ({
          ...transaction,

          description:
            transaction.items
              ?.map(
                (item) =>
                  item.description
              )
              .join(", ") || "",

          source: "MANUAL",
        })
      );

    // ==================================================
    // Merge Both
    // ==================================================

     let transactions = [...manualData];

    // ==================================================
    // Source Filter
    // ==================================================

    if (
      source &&
      source !== "ALL"
    ) {
      transactions =
        transactions.filter(
          (transaction) =>
            transaction.source === source
        );
    }

    // ==================================================
    // Global Search
    // ==================================================

    if (search.trim()) {

      const keyword =
        search.toLowerCase();

      transactions =
        transactions.filter((t) => {

          return (
            t.invoiceNumber
              ?.toLowerCase()
              .includes(keyword) ||

            t.guestName
              ?.toLowerCase()
              .includes(keyword) ||

            t.guestPhone
              ?.toLowerCase()
              .includes(keyword) ||

            t.guestEmail
              ?.toLowerCase()
              .includes(keyword) ||

            t.description
              ?.toLowerCase()
              .includes(keyword)
          );

        });

    }

    // ==================================================
    // Latest First
    // ==================================================

    transactions.sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

    // ==================================================
    // Analytics
    // ==================================================

    const analytics =
      transactions.reduce(
        (summary, transaction) => {

          const amount = Number(
            transaction.totalAmount || 0
          );

          summary.totalCollection +=
            amount;

          summary.totalTransactions++;

          switch (
            transaction.paymentMode
          ) {
            case "CASH":
              summary.cashCollection +=
                amount;
              break;

            case "CARD":
              summary.cardCollection +=
                amount;
              break;

            case "ONLINE":
            case "UPI":
              summary.onlineCollection +=
                amount;
              break;
          }

          summary.totalGST += Number(
            transaction.gstAmount || 0
          );

          return summary;

        },
        {
          totalCollection: 0,

          totalGST: 0,

          totalTransactions: 0,

          cashCollection: 0,

          cardCollection: 0,

          onlineCollection: 0,
        }
      );

    // ==================================================
    // Today's Collection
    // ==================================================

    const today =
      new Date().toDateString();

    const todayCollection =
      transactions
        .filter(
          (transaction) =>
            new Date(
              transaction.date
            ).toDateString() === today
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(
              transaction.totalAmount || 0
            ),
          0
        );

    // ==================================================
    // Pagination
    // ==================================================

    const totalRecords =
      transactions.length;

    const totalPages = Math.max(
      1,
      Math.ceil(
        totalRecords / pageSize
      )
    );

    const startIndex =
      (currentPage - 1) * pageSize;

    const paginatedTransactions =
      transactions.slice(
        startIndex,
        startIndex + pageSize
      );

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Transactions fetched successfully.",

      data:
        paginatedTransactions,

      analytics: {
        ...analytics,
        todayCollection,
      },

      pagination: {
        currentPage,

        pageSize,

        totalPages,

        totalRecords,

        hasNextPage:
          currentPage <
          totalPages,

        hasPreviousPage:
          currentPage > 1,
      },
    });

  } catch (error) {

    console.error(
      "Transaction Fetch Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to fetch transactions.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });

  }

};
// ======================================================
// CREATE TRANSACTION (Part 2B-1)
// ======================================================

export const createTransaction = async (req, res) => {
  try {
    const {
      guestName,
      guestPhone,
      guestEmail,
      roomNumber,
      roomType,
      checkIn,
      checkOut,
      nights,
      paymentMode,
      billType,
      notes,
      items = [],
    } = req.body;

    // ==========================================
    // Authentication
    // ==========================================

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    // ==========================================
    // Guest Validation
    // ==========================================

    if (!guestName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guest name is required.",
      });
    }

    // ==========================================
    // GST Only
    // ==========================================

    if (billType !== "GST") {
      return res.status(400).json({
        success: false,
        message: "Only GST invoices are supported.",
      });
    }

    const invoiceType = "GST";

    // ==========================================
    // Payment Validation
    // ==========================================

    if (
      !Object.values(PAYMENT_MODES).includes(
        paymentMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode.",
      });
    }

    const payment =
      PAYMENT_MODES[paymentMode];

    // ==========================================
    // Items Validation
    // ==========================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one bill item is required.",
      });
    }

    // ==========================================
    // Sanitize Inputs
    // ==========================================

    const sanitizedGuestName =
      guestName.trim();

    const sanitizedGuestPhone =
      guestPhone?.trim() || "";

    const sanitizedGuestEmail =
      guestEmail?.trim() || "";

    const sanitizedRoomNumber =
      roomNumber?.trim() || "";

    const sanitizedRoomType =
      roomType?.trim() || "";

    const sanitizedNotes =
      notes?.trim() || "";

    // ==========================================
    // Calculate Bill
    // ==========================================

    const {
      subtotal,
      gstAmount,
      grandTotal,
      billItems,
    } = calculateItems(
      items,
      invoiceType
    );

    if (grandTotal <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Invoice amount must be greater than zero.",
      });
    }

    // Continue in Part 2B-2...
        // ==========================================
    // Database Transaction
    // ==========================================

    const transaction =
      await prisma.$transaction(
        async (tx) => {

          // --------------------------------------
          // Generate Invoice Number
          // --------------------------------------

          const invoiceNumber =
            await generateInvoiceNumber(tx);

          // --------------------------------------
          // Create Transaction
          // --------------------------------------

          const createdTransaction =
            await tx.transaction.create({

              data: {

                invoiceNumber,

                guestName:
                  sanitizedGuestName,

                guestPhone:
                  sanitizedGuestPhone,

                guestEmail:
                  sanitizedGuestEmail,

                roomNumber:
                  sanitizedRoomNumber,

                roomType:
                  sanitizedRoomType,

                checkIn: checkIn
                  ? new Date(checkIn)
                  : null,

                checkOut: checkOut
                  ? new Date(checkOut)
                  : null,

                nights:
                  safeNumber(nights),

                paymentMode:
                  payment,

                invoiceType:
                  invoiceType,

                subtotal,

                gstAmount,

                serviceCharge: 0,

                discount: 0,

                totalAmount:
                  grandTotal,

                notes:
                  sanitizedNotes,

                createdBy:
                  req.user.id,

                status: "ACTIVE",

                items: {
                  create: billItems.map(
                    (item) => ({
                      category:
                        item.category,

                      description:
                        item.description,

                      quantity:
                        item.quantity,

                      unitPrice:
                        item.unitPrice,

                      gstPercent:
                        item.gstPercent,

                      total:
                        item.total,
                    })
                  ),
                },

              },

              include: {

                items: true,

                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },

              },

            });

          // Continue in Part 2B-3
          // ==========================================
// Generate PDF Invoice
// ==========================================
try {

  const pdf = await generateInvoice({
    ...createdTransaction,
    items: createdTransaction.items,
  });

  const invoicePdfUrl =
    `/uploads/invoices/${pdf.filename}`;

  await tx.transaction.update({

    where: {
      id: createdTransaction.id,
    },

    data: {
      invoicePdfUrl,
    },

  });

  createdTransaction.invoicePdfUrl =
    invoicePdfUrl;

} catch (pdfError) {

  console.error(
    "Invoice PDF Error:",
    pdfError
  );

  createdTransaction.invoicePdfUrl = null;

}

const finalTransaction =
  await tx.transaction.findUnique({

    where: {
      id: createdTransaction.id,
    },

    include: {

      items: true,

      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },

    },

  });

return finalTransaction;
}   // async(tx) close
);  
    // ==========================================
    // Auto-send invoice to the guest's email
    // ==========================================

    await dispatchInvoice({
      guestEmail: transaction.guestEmail,
      guestName: transaction.guestName,
      invoiceNumber: transaction.invoiceNumber,
      invoicePdfUrl: transaction.invoicePdfUrl,
    });

    // ==========================================
    // Success Response
    // ==========================================

    return res.status(201).json({

      success: true,

      message:
        "Transaction created successfully.",

      data: transaction,

    });

  } catch (error) {

    console.error(
      "Create Transaction Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to create transaction.",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,

    });

  }
};

// ======================================================
// UPDATE TRANSACTION
// ======================================================

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTransaction =
      await prisma.transaction.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    const {
      guestName,
      guestPhone,
      guestEmail,
      roomNumber,
      roomType,
      checkIn,
      checkOut,
      nights,
      paymentMode,
      billType,
      notes,
      items = [],
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!guestName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guest name is required.",
      });
    }

    if (
      !Object.values(PAYMENT_MODES).includes(
        paymentMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode.",
      });
    }

    if (billType !== "GST") {
      return res.status(400).json({
        success: false,
        message:
          "Only GST invoices are supported.",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one bill item is required.",
      });
    }

    const {
      subtotal,
      gstAmount,
      grandTotal,
      billItems,
    } = calculateItems(items);

    // ==========================================
    // Database Transaction
    // ==========================================

    const updatedTransaction =
      await prisma.$transaction(async (tx) => {

        // Delete old items

        await tx.transactionItem.deleteMany({
          where: {
            transactionId: id,
          },
        });

        // Update transaction

        const updated =
          await tx.transaction.update({
            where: {
              id,
            },

            data: {
              guestName: sanitize(guestName),

              guestPhone:
                sanitize(guestPhone),

              guestEmail:
                sanitize(guestEmail),

              roomNumber:
                sanitize(roomNumber),

              roomType:
                sanitize(roomType),

              checkIn: checkIn
                ? new Date(checkIn)
                : null,

              checkOut: checkOut
                ? new Date(checkOut)
                : null,

              nights:
                safeNumber(nights),

              paymentMode,

              invoiceType: "GST",

              subtotal,

              gstAmount,

              serviceCharge: decimal(0),

              discount: decimal(0),

              totalAmount:
                grandTotal,

              notes:
                sanitize(notes),

              items: {
                create: billItems,
              },
            },

            include: {
              items: true,

              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          });

        // ======================================
        // Regenerate Invoice PDF
        // ======================================

        try {

          const pdf =
            await generateInvoice({
              ...updated,
              items: updated.items,
            });

          const invoicePdfUrl =
            `/uploads/invoices/${pdf.filename}`;

          await tx.transaction.update({
            where: {
              id,
            },

            data: {
              invoicePdfUrl,
            },
          });

          updated.invoicePdfUrl =
            invoicePdfUrl;

        } catch (pdfError) {

          console.error(
            "Invoice Regeneration Error:",
            pdfError
          );

          updated.invoicePdfUrl = null;

        }

        return updated;

      });

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Transaction updated successfully.",
      data: updatedTransaction,
    });

  } catch (error) {

    console.error(
      "Update Transaction Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update transaction.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });

  }
};

// ======================================================
// DOWNLOAD INVOICE
// ======================================================

export const downloadInvoice = async (req, res) => {
  try {

    const { id } = req.params;

    const transaction =
      await prisma.transaction.findUnique({
        where: { id },
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    if (!transaction.invoicePdfUrl) {
      return res.status(404).json({
        success: false,
        message: "Invoice PDF not available.",
      });
    }

    const pdfPath =
      getInvoiceAbsolutePath(
        transaction.invoicePdfUrl
      );

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice file missing.",
      });
    }

    return res.download(
      pdfPath,
      `${transaction.invoiceNumber}.pdf`
    );

  } catch (error) {

    console.error(
      "Download Invoice Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to download invoice.",
    });

  }
};

// ======================================================
// REGENERATE INVOICE
// ======================================================

export const regenerateInvoice = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const transaction =
      await prisma.transaction.findUnique({

        where: { id },

        include: {
          items: true,
          creator: true,
        },

      });

    if (!transaction) {

      return res.status(404).json({
        success: false,
        message:
          "Transaction not found.",
      });

    }

    const pdf =
      await generateInvoice({

        ...transaction,

        items:
          transaction.items,

      });

    const invoicePdfUrl =
      `/uploads/invoices/${pdf.filename}`;

    await prisma.transaction.update({

      where: { id },

      data: {
        invoicePdfUrl,
      },

    });

    return res.status(200).json({

      success: true,

      message:
        "Invoice regenerated successfully.",

      invoicePdfUrl,

    });

  } catch (error) {

    console.error(
      "Regenerate Invoice Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Invoice regeneration failed.",

    });

  }

};

// ======================================================
// PRINT INVOICE
// ======================================================

export const printInvoice = async (
  req,
  res
) => {

  try {

    const transaction =
      await prisma.transaction.findUnique({

        where: {
          id: req.params.id,
        },

      });

    if (!transaction) {

      return res.status(404).json({

        success: false,

        message:
          "Transaction not found.",

      });

    }

    if (!transaction.invoicePdfUrl) {

      return res.status(404).json({

        success: false,

        message:
          "Invoice PDF not found.",

      });

    }

    return res.json({

      success: true,

      printUrl:
        transaction.invoicePdfUrl,

    });

  } catch (error) {

    console.error(
      "Print Invoice Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to print invoice.",

    });

  }

};

// ======================================================
// SEND EMAIL
// ======================================================

export const sendInvoiceEmail = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const transaction =
      await prisma.transaction.findUnique({

        where: { id },

      });

    if (!transaction) {

      return res.status(404).json({

        success: false,

        message:
          "Transaction not found.",

      });

    }

    if (!transaction.guestEmail) {

      return res.status(400).json({

        success: false,

        message:
          "Guest email not available.",

      });

    }

    if (
      !invoiceExists(
        transaction.invoicePdfUrl
      )
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Invoice PDF not found.",

      });

    }

    await transporter.sendMail({

      from:
        process.env.SMTP_USER,

      to:
        transaction.guestEmail,

      subject:
        `GST Invoice ${transaction.invoiceNumber}`,

      html: `
        <h2>Thank You</h2>

        <p>Please find your GST invoice attached.</p>

        <p>
          Invoice No :
          <strong>
            ${transaction.invoiceNumber}
          </strong>
        </p>
      `,

      attachments: [

        {

          filename:
            `${transaction.invoiceNumber}.pdf`,

          path:
            getInvoiceAbsolutePath(
              transaction.invoicePdfUrl
            ),

        },

      ],

    });

    return res.json({

      success: true,

      message:
        "Invoice email sent successfully.",

    });

  } catch (error) {

    console.error(
      "Email Invoice Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to send invoice email.",

    });

  }

};
// ======================================================
// TRANSACTION SUMMARY
// ======================================================

export const getTransactionSummary = async (req, res) => {
  try {

    const currentYear = new Date().getFullYear();

    const year =
      Number(req.query.year) ||
      currentYear;

    if (
      year < 2020 ||
      year > currentYear + 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year.",
      });
    }

    const startDate =
      new Date(year, 0, 1);

    const endDate =
      new Date(
        year,
        11,
        31,
        23,
        59,
        59,
        999
      );

    const transactions =
      await prisma.transaction.findMany({

        where: {

          isDeleted: false,

          date: {

            gte: startDate,

            lte: endDate,

          },

        },

        select: {

          date: true,

          paymentMode: true,

          gstAmount: true,

          totalAmount: true,

        },

      });

    const summary = {

      totalRevenue: 0,

      totalGST: 0,

      totalTransactions:
        transactions.length,

      cashRevenue: 0,

      cardRevenue: 0,

      onlineRevenue: 0,

    };

    transactions.forEach((t) => {

      const amount =
        Number(t.totalAmount);

      const gst =
        Number(t.gstAmount);

      summary.totalRevenue += amount;

      summary.totalGST += gst;

      switch (t.paymentMode) {

        case "CASH":
          summary.cashRevenue += amount;
          break;

        case "CARD":
          summary.cardRevenue += amount;
          break;

        case "ONLINE":
        case "UPI":
          summary.onlineRevenue += amount;
          break;

      }

    });

    const monthlyChart =
      Array.from(
        { length: 12 },
        (_, i) => ({

          month:
            new Date(
              year,
              i
            ).toLocaleString(
              "default",
              {
                month: "short",
              }
            ),

          revenue: 0,

          gst: 0,

          transactions: 0,

        })
      );

    transactions.forEach((t) => {

      const month =
        new Date(t.date).getMonth();

      monthlyChart[month].revenue +=
        Number(t.totalAmount);

      monthlyChart[month].gst +=
        Number(t.gstAmount);

      monthlyChart[month].transactions++;

    });

    return res.json({

      success: true,

      data: {

        year,

        summary,

        monthlyChart,

      },

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        "Unable to generate summary.",

    });

  }

};
// ======================================================
// EXPORT EXCEL
// ======================================================

export const exportTransactionsExcel = async (
  req,
  res
) => {

  try {

    const transactions =
      await prisma.transaction.findMany({

        where: {
          isDeleted: false,
        },

        orderBy: {
          date: "desc",
        },

      });

    const workbook =
      new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet(
        "GST Transactions"
      );

    sheet.columns = [

      {
        header: "Invoice",
        key: "invoiceNumber",
        width: 18,
      },

      {
        header: "Guest",
        key: "guestName",
        width: 30,
      },

      {
        header: "Payment",
        key: "paymentMode",
        width: 15,
      },

      {
        header: "GST",
        key: "gstAmount",
        width: 15,
      },

      {
        header: "Total",
        key: "totalAmount",
        width: 18,
      },

      {
        header: "Date",
        key: "date",
        width: 22,
      },

    ];

    transactions.forEach((t) => {

      sheet.addRow({

        invoiceNumber:
          t.invoiceNumber,

        guestName:
          t.guestName,

        paymentMode:
          t.paymentMode,

        gstAmount:
          Number(t.gstAmount),

        totalAmount:
          Number(t.totalAmount),

        date:
          t.date.toLocaleString(),

      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=gst-transactions.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Excel export failed.",

    });

  }

};
// ======================================================
// REVENUE REPORT
// ======================================================

export const revenueReport = async (req, res) => {

  try {

    const transactions =
      await prisma.transaction.findMany({

        where: {

          isDeleted: false,

          status: "ACTIVE",

        },

      });

    let totalRevenue = 0;

    let totalGST = 0;

    let cash = 0;

    let card = 0;

    let online = 0;

    let upi = 0;

    transactions.forEach((t) => {

      const amount =
        Number(t.totalAmount);

      const gst =
        Number(t.gstAmount);

      totalRevenue += amount;

      totalGST += gst;

      switch (t.paymentMode) {

        case "CASH":
          cash += amount;
          break;

        case "CARD":
          card += amount;
          break;

        case "ONLINE":
          online += amount;
          break;

        case "UPI":
          upi += amount;
          break;

      }

    });

    return res.json({

      success: true,

      data: {

        totalTransactions:
          transactions.length,

        totalRevenue,

        totalGST,

        paymentSummary: {

          cash,

          card,

          online,

          upi,

        },

      },

    });

  } catch (error) {

    console.error(
      "Revenue Report Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to generate revenue report.",

    });

  }

};



// ======================================================
// DAILY CLOSING REPORT
// ======================================================

export const dailyClosingReport = async (req, res) => {

  try {

    const today = new Date();

    const start =
      new Date(today);

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end =
      new Date(today);

    end.setHours(
      23,
      59,
      59,
      999
    );

    const transactions =
      await prisma.transaction.findMany({

        where: {

          isDeleted: false,

          status: "ACTIVE",

          date: {

            gte: start,

            lte: end,

          },

        },

      });

    let totalCollection = 0;

    let totalGST = 0;

    let cash = 0;

    let card = 0;

    let online = 0;

    let upi = 0;

    transactions.forEach((t) => {

      const amount =
        Number(t.totalAmount);

      totalCollection += amount;

      totalGST +=
        Number(t.gstAmount);

      switch (t.paymentMode) {

        case "CASH":
          cash += amount;
          break;

        case "CARD":
          card += amount;
          break;

        case "ONLINE":
          online += amount;
          break;

        case "UPI":
          upi += amount;
          break;

      }

    });

    return res.json({

      success: true,

      data: {

        date:
          start.toLocaleDateString(),

        totalTransactions:
          transactions.length,

        totalCollection,

        totalGST,

        paymentSummary: {

          cash,

          card,

          online,

          upi,

        },

      },

    });

  } catch (error) {

    console.error(
      "Daily Closing Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to generate daily closing report.",

    });

  }

};
// ======================================================
// DOWNLOAD REVENUE REPORT PDF
// ======================================================

export const downloadRevenueReport = async (req, res) => {

  try {

    const transactions =
      await prisma.transaction.findMany({

        where: {
          isDeleted: false,
          status: "ACTIVE",
        },

        orderBy: {
          date: "desc",
        },

      });

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=revenue-report.pdf"
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("GST Revenue Report", {
        align: "center",
      });

    doc.moveDown();

    let totalRevenue = 0;
    let totalGST = 0;

    transactions.forEach((transaction, index) => {

      const amount =
        Number(transaction.totalAmount);

      const gst =
        Number(transaction.gstAmount);

      totalRevenue += amount;
      totalGST += gst;

      doc
        .fontSize(11)
        .text(
          `${index + 1}. ${transaction.invoiceNumber}`
        );

      doc.text(
        `Guest : ${transaction.guestName}`
      );

      doc.text(
        `Payment : ${transaction.paymentMode}`
      );

      doc.text(
        `GST : ₹${gst.toFixed(2)}`
      );

      doc.text(
        `Amount : ₹${amount.toFixed(2)}`
      );

      doc.text(
        `Date : ${transaction.date.toLocaleDateString()}`
      );

      doc.moveDown();

    });

    doc.moveDown();

    doc
      .fontSize(15)
      .text(
        `Total Revenue : ₹${totalRevenue.toFixed(2)}`
      );

    doc.text(
      `Total GST : ₹${totalGST.toFixed(2)}`
    );

    doc.text(
      `Transactions : ${transactions.length}`
    );

    doc.end();

  } catch (error) {

    console.error(
      "Revenue PDF Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to generate revenue report PDF.",

    });

  }

};

// ======================================================
// MONTHLY REVENUE ANALYTICS
// ======================================================

export const monthlyRevenueAnalytics = async (
  req,
  res
) => {

  try {

    const year =
      Number(req.query.year) ||
      new Date().getFullYear();

    const data = [];

    for (let month = 0; month < 12; month++) {

      const start =
        new Date(year, month, 1);

      const end =
        new Date(year, month + 1, 0, 23, 59, 59);

      const transactions =
        await prisma.transaction.findMany({

          where: {

            isDeleted: false,

            status: "ACTIVE",

            date: {

              gte: start,

              lte: end,

            },

          },

        });

      let revenue = 0;
      let gst = 0;

      transactions.forEach((t) => {

        revenue += Number(t.totalAmount);

        gst += Number(t.gstAmount);

      });

      data.push({

        month:
          start.toLocaleString(
            "default",
            {
              month: "short",
            }
          ),

        revenue,

        gst,

        transactions:
          transactions.length,

      });

    }

    return res.json({

      success: true,

      year,

      data,

    });

  } catch (error) {

    console.error(
      "Monthly Analytics Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to generate monthly analytics.",

    });

  }

};

// ======================================================
// SOFT DELETE TRANSACTION
// ======================================================

export const deleteTransaction = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const transaction =
      await prisma.transaction.findUnique({

        where: { id },

      });

    if (!transaction) {

      return res.status(404).json({

        success: false,

        message:
          "Transaction not found.",

      });

    }

    await prisma.transaction.update({

      where: { id },

      data: {

        isDeleted: true,

        deletedAt: new Date(),

      },

    });

    return res.json({

      success: true,

      message:
        "Transaction deleted successfully.",

    });

  } catch (error) {

    console.error(
      "Delete Transaction Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to delete transaction.",

    });

  }

};

// ======================================================
// REFUND TRANSACTION
// ======================================================

export const refundTransaction = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const {
      refundAmount,
      refundReason,
    } = req.body;

    const transaction =
      await prisma.transaction.findUnique({

        where: { id },

      });

    if (!transaction) {

      return res.status(404).json({

        success: false,

        message:
          "Transaction not found.",

      });

    }

    if (
      transaction.status ===
      TRANSACTION_STATUS.REFUNDED
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Transaction already refunded.",

      });

    }

    const amount =
      refundAmount
        ? decimal(refundAmount)
        : transaction.totalAmount;

    const updated =
      await prisma.transaction.update({

        where: {
          id,
        },

        data: {

          status:
            TRANSACTION_STATUS.REFUNDED,

          refundAmount: amount,

          refundReason:
            sanitize(refundReason),

          refundDate:
            new Date(),

        },

      });

    return res.json({

      success: true,

      message:
        "Refund processed successfully.",

      data: updated,

    });

  } catch (error) {

    console.error(
      "Refund Transaction Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to refund transaction.",

    });

  }

};