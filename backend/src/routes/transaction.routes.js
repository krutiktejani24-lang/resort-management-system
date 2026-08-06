import express from "express";
import asyncHandler from "express-async-handler";

import {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  refundTransaction,
  downloadInvoice,
  regenerateInvoice,
  printInvoice,
  sendInvoiceEmail,
  exportTransactionsExcel,
  revenueReport,
  dailyClosingReport,
  downloadRevenueReport,
  monthlyRevenueAnalytics,
} from "../controllers/transaction.controller.js";

import {
  protect,
  allow,
} from "../middleware/auth.middleware.js";

const router = express.Router();

/* ============================================================
   TRANSACTIONS
============================================================ */

router
  .route("/")
  .get(protect, asyncHandler(getTransactions))
  .post(protect, asyncHandler(createTransaction));

router.get("/summary", protect, asyncHandler(getTransactionSummary));

router.get("/export/excel", protect, asyncHandler(exportTransactionsExcel));

router.get("/reports/revenue", protect, asyncHandler(revenueReport));

router.get("/reports/revenue/pdf", protect, asyncHandler(downloadRevenueReport));

router.get("/reports/daily", protect, asyncHandler(dailyClosingReport));

router.get("/reports/monthly", protect, asyncHandler(monthlyRevenueAnalytics));

router
  .route("/:id")
  .put(protect, asyncHandler(updateTransaction))
  .delete(protect, asyncHandler(deleteTransaction));

router.get("/:id/invoice", protect, asyncHandler(downloadInvoice));

router.post("/:id/regenerate", protect, asyncHandler(regenerateInvoice));

router.get("/:id/print", protect, asyncHandler(printInvoice));

router.post("/:id/send-email", protect, asyncHandler(sendInvoiceEmail));

router.post(
  "/:id/refund",
  protect,
  allow("ADMIN"),
  asyncHandler(refundTransaction)
);

export default router;