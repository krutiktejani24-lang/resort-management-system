import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import axios from "axios";

import SummaryCards from "../../components/transactions/SummaryCards";
import FilterBar from "../../components/transactions/FilterBar";
import TransactionTable from "../../components/transactions/TransactionTable";
import DeleteModal from "../../components/transactions/DeleteModal";
import ManualInvoiceModal from "../../components/transactions/ManualInvoiceModal";
import InvoicePreviewModal from "../../components/transactions/InvoicePreviewModal";
import generateTransactionsPDF from "../../components/transactions/pdf/generateTransactionsPDF";

import exportExcel from "../../components/transactions/excel/exportExcel";

import { money } from "../../components/transactions/ utils/money";
import { today } from "../../components/transactions/ utils/today";

const API = "http://localhost:8000/api/transactions";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AdminTransactions() {

  const token =
    localStorage.getItem("token");

  // -----------------------------
  // Transactions
  // -----------------------------

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // -----------------------------
  // Manual Invoice
  // -----------------------------

  const [
    showInvoiceModal,
    setShowInvoiceModal,
  ] = useState(false);

  const [
    showPreviewModal,
    setShowPreviewModal,
  ] = useState(false);

  const [
    selectedInvoice,
    setSelectedInvoice,
  ] = useState(null);

  // -----------------------------
  // Delete
  // -----------------------------

  const [
    deleteId,
    setDeleteId,
  ] = useState(null);

  // -----------------------------
  // Search
  // -----------------------------

  const [
    search,
    setSearch,
  ] = useState("");

  // -----------------------------
  // Filters
  // -----------------------------

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState("ALL");

  const [
    filterMode,
    setFilterMode,
  ] = useState("MONTH");

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(
    new Date().getFullYear()
  );

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    new Date().getMonth()
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(today());


    // -------------------------------------------------
  // Load Transactions
  // -------------------------------------------------

  const loadTransactions = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     setTransactions(res.data.data || []);

    } catch (err) {

      

    } finally {

      setLoading(false);

    }

  };

    // -----------------------------
  // Initial Load
  // -----------------------------

useEffect(() => {
  if (token) {
    loadTransactions();
  }
}, [token]);

  // -------------------------------------------------
  // Refresh
  // -------------------------------------------------

  const refreshTransactions =
    async () => {

      await loadTransactions();

    };

  // -------------------------------------------------
  // Delete Transaction
  // -------------------------------------------------

  const deleteTransaction =
    async (id) => {

      try {

        await axios.delete(

          `${API}/${id}`,

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }

        );

        setDeleteId(null);

        await refreshTransactions();

      } catch (err) {

        

        alert(
          "Unable to delete transaction."
        );

      }

    };

  // -------------------------------------------------
  // Export Excel
  // -------------------------------------------------

  const handleExportExcel =
    () => {

      exportExcel(
        filteredTransactions,
        reportTitle
      );

    };

  // -------------------------------------------------
  // Export PDF
  // -------------------------------------------------

  const handleExportPDF =
    () => {

      generateTransactionsPDF(
        filteredTransactions,
        reportTitle,
        summary
      );

    };

  // -------------------------------------------------
  // Print Report
  // -------------------------------------------------

  const handlePrint =
    () => {

      generateTransactionsPDF(
        filteredTransactions,
        reportTitle,
        summary,
        { forPrint: true }
      );

    };
    // -------------------------------------------------
  // Filter Transactions
  // -------------------------------------------------

  const filteredTransactions =
    useMemo(() => {

      return transactions

        .filter((transaction) => {

          const transactionDate =
            new Date(transaction.date);

          let dateMatch = true;

          // -----------------------
          // Month Filter
          // -----------------------

          if (
            filterMode === "MONTH"
          ) {

            dateMatch =

              transactionDate.getFullYear() ===
                selectedYear &&

              transactionDate.getMonth() ===
                selectedMonth;

          }

          // -----------------------
          // Year Filter
          // -----------------------

          if (
            filterMode === "YEAR"
          ) {

            dateMatch =

              transactionDate.getFullYear() ===
              selectedYear;

          }

          // -----------------------
          // Day Filter
          // -----------------------

          if (
            filterMode === "DAY"
          ) {

            dateMatch =

              new Date(transaction.date)
  .toISOString()
  .slice(0,10) === selectedDate

          }

          // -----------------------
          // Payment Filter
          // -----------------------

          const paymentMatch =

            paymentFilter === "ALL"

            ||

            transaction.paymentMode ===
              paymentFilter;

          // -----------------------
          // Search Filter
          // -----------------------

          const keyword =
            search.toLowerCase();

          const searchMatch =

            keyword === ""

            ||

            (transaction.guestName || "")
              .toLowerCase()
              .includes(keyword)

            ||

            (transaction.invoiceNumber || "")
              .toLowerCase()
              .includes(keyword)

            ||

            (transaction.description || "")
              .toLowerCase()
              .includes(keyword)

            ||

            (transaction.notes || "")
              .toLowerCase()
              .includes(keyword);

          return (

            dateMatch &&

            paymentMatch &&

            searchMatch

          );

        })

        .sort(

          (a, b) =>

            new Date(b.date) -

            new Date(a.date)

        );

    }, [

      transactions,

      search,

      paymentFilter,

      filterMode,

      selectedYear,

      selectedMonth,

      selectedDate,

    ]);

  // -------------------------------------------------
  // Summary Calculation
  // -------------------------------------------------

  const summary = useMemo(() => {

    const data = {

      CASH: 0,

      CARD: 0,

      ONLINE: 0,

      TOTAL: 0,

      COUNT:
        filteredTransactions.length,

    };

    filteredTransactions.forEach(

      (transaction) => {

        const amount = Number(

          transaction.totalAmount || 0

        );

        if (
          transaction.paymentMode ===
          "CASH"
        ) {

          data.CASH += amount;

        }

        if (
          transaction.paymentMode ===
          "CARD"
        ) {

          data.CARD += amount;

        }

        if (
          transaction.paymentMode ===
          "ONLINE"
        ) {

          data.ONLINE += amount;

        }

        data.TOTAL += amount;

      }

    );

    return data;

  }, [filteredTransactions]);

  // -------------------------------------------------
  // Report Title
  // -------------------------------------------------

  const reportTitle =
    useMemo(() => {

      if (
        filterMode === "MONTH"
      ) {

        return `${MONTHS[selectedMonth]} ${selectedYear}`;

      }

      if (
        filterMode === "YEAR"
      ) {

        return `${selectedYear}`;

      }

      return selectedDate;

    }, [

      filterMode,

      selectedMonth,

      selectedYear,

      selectedDate,

    ]);

      // -------------------------------------------------
  // Generate Manual Invoice
  // -------------------------------------------------

const handleGenerateInvoice = async(invoice)=>{

   setShowInvoiceModal(false);

   setSelectedInvoice(invoice);

   setShowPreviewModal(true);

   await refreshTransactions();

}

  // -------------------------------------------------
  // Close Preview
  // -------------------------------------------------

  const closePreview =
    () => {

      setShowPreviewModal(
        false
      );

      setSelectedInvoice(
        null
      );

    };

  // -------------------------------------------------
  // Download Invoice PDF
  // -------------------------------------------------


  // -------------------------------------------------
  // Print Invoice
  // -------------------------------------------------


  // -------------------------------------------------
  // Email Invoice
  // -------------------------------------------------

const sendInvoiceEmail = async (invoice) => {

  if (!invoice?.id) {

    alert("Invoice not found.");

    return;

  }

  try {

    await axios.post(

      `${API}/email`,

      {

        invoiceId: invoice.id,

      },

      {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      }

    );

    alert("Invoice emailed successfully.");

  } catch (err) {

    console.error(err.response?.data || err.message);

    alert("Unable to send invoice.");

  }

};
      // =====================================================
  // UI
  // =====================================================

  return (

    <div
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >

      {/* --------------------------------------- */}
      {/* Header */}
      {/* --------------------------------------- */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
          flexWrap: "wrap",
          gap: 20,
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
              color: "#15803d",
              fontSize: 32,
            }}
          >
            Transaction Management
          </h1>

          <div
            style={{
              color: "#6b7280",
              marginTop: 5,
            }}
          >
            Manual & Booking Invoice Management
          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >

          <button
            onClick={() =>
              setShowInvoiceModal(true)
            }
            style={{
              padding: "12px 20px",
              background: "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Manual Invoice
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              padding: "12px 20px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Export Excel
          </button>

          <button
            onClick={handleExportPDF}
            style={{
              padding: "12px 20px",
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Export PDF
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: "12px 20px",
              background: "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Print
          </button>

        </div>

      </div>

            {/* ===================================== */}
      {/* Summary Cards */}
      {/* ===================================== */}

      <SummaryCards
        summary={summary}
      />

      {/* ===================================== */}
      {/* Filter Bar */}
      {/* ===================================== */}

      <FilterBar
        search={search}
        setSearch={setSearch}

        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}

        filterMode={filterMode}
        setFilterMode={setFilterMode}

        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}

        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}

        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}

      />

      {/* ===================================== */}
      {/* Report Header */}
      {/* ===================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 25,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              color: "#14532d",
            }}
          >
            {reportTitle}
          </h2>

          <div
            style={{
              marginTop: 5,
              color: "#6b7280",
            }}
          >
            Total Transactions :
            {" "}
            {summary.COUNT}
          </div>

        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >

          <div
            style={{
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            Grand Total
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: "#15803d",
            }}
          >
            {money(summary.TOTAL)}
          </div>

        </div>

      </div>
            {/* ===================================== */}
      {/* Transaction Table */}
      {/* ===================================== */}

      {loading ? (

        <div
          style={{
            background: "#fff",
            padding: 60,
            textAlign: "center",
            borderRadius: 12,
          }}
        >
          Loading Transactions...
        </div>

      ) : (

<TransactionTable
  loading={loading}
  transactions={filteredTransactions}

  onDownload={handleDownloadInvoice}

  onPrint={handlePrintInvoice}
/>

      )}

      {/* ===================================== */}
      {/* Empty Data */}
      {/* ===================================== */}

      {!loading &&
        filteredTransactions.length === 0 && (

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 60,
            marginTop: 20,
            textAlign: "center",
            color: "#9ca3af",
          }}
        >

          <div
            style={{
              fontSize: 70,
            }}
          >
            📄
          </div>

          <h2
            style={{
              marginTop: 15,
              marginBottom: 10,
              color: "#374151",
            }}
          >
            No Transactions Found
          </h2>

          <p>

            No transaction is available for the
            selected filter.

          </p>

          <button
            onClick={() =>
              setShowInvoiceModal(true)
            }
            style={{
              marginTop: 20,
              padding: "12px 24px",
              background: "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Create Manual Invoice
          </button>

        </div>

      )}
            {/* ===================================== */}
      {/* Manual Invoice Modal */}
      {/* ===================================== */}

      <ManualInvoiceModal
        open={showInvoiceModal}
        onClose={() =>
          setShowInvoiceModal(false)
        }
        onGenerate={
          handleGenerateInvoice
        }
      />

      {/* ===================================== */}
      {/* Invoice Preview Modal */}
      {/* ===================================== */}

      <InvoicePreviewModal
  open={showPreviewModal}
  invoice={selectedInvoice}
  onClose={closePreview}
/>

      {/* ===================================== */}
      {/* Delete Modal */}
      {/* ===================================== */}

      <DeleteModal
        open={deleteId !== null}
        onClose={() =>
          setDeleteId(null)
        }
        onDelete={() =>
          deleteTransaction(deleteId)
        }
      />

    </div>

  );

}
// -------------------------------------------------
// Download Invoice PDF
// -------------------------------------------------

const handleDownloadInvoice = (invoice) => {

  if (!invoice?.invoicePdfUrl) {

    alert("Invoice PDF not available.");

    return;

  }

  const pdfUrl =

    invoice.invoicePdfUrl.startsWith("http")

      ? invoice.invoicePdfUrl

      : `http://localhost:8000${invoice.invoicePdfUrl}`;

  window.open(pdfUrl, "_blank");

};

// -------------------------------------------------
// Print Invoice
// -------------------------------------------------

const handlePrintInvoice = (invoice) => {

  if (!invoice?.invoicePdfUrl) {

    alert("Invoice PDF not available.");

    return;

  }

  const pdfUrl =

    invoice.invoicePdfUrl.startsWith("http")

      ? invoice.invoicePdfUrl

      : `http://localhost:8000${invoice.invoicePdfUrl}`;

  const printWindow = window.open(pdfUrl);

  if (printWindow) {

    printWindow.onload = () => {

      printWindow.print();

    };

  }

};