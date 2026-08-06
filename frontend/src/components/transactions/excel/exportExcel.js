import * as XLSX from "xlsx";

function money(value) {

  return Number(value || 0);

}

export default function exportExcel(

  transactions,

  reportTitle

) {

  const workbook =
    XLSX.utils.book_new();

  // ---------------------------------------
  // Summary Calculation
  // ---------------------------------------

  let cash = 0;

  let card = 0;

  let online = 0;

  let total = 0;

  transactions.forEach((item) => {

    const amount = Number(
      item.totalAmount || 0
    );

    if (
      item.paymentMode === "CASH"
    ) {

      cash += amount;

    }

    if (
      item.paymentMode === "CARD"
    ) {

      card += amount;

    }

    if (
      item.paymentMode === "ONLINE"
    ) {

      online += amount;

    }

    total += amount;

  });

  // ---------------------------------------
  // Summary Sheet
  // ---------------------------------------

  const summaryData = [

    ["MANGO TREE RESORT"],

    ["TRANSACTION REPORT"],

    [],

    ["Report", reportTitle],

    [

      "Generated",

      new Date().toLocaleString(
        "en-IN"
      ),

    ],

    [],

    [
      "Total Transactions",

      transactions.length,

    ],

    ["Cash Collection", cash],

    ["Card Collection", card],

    ["Online Collection", online],

    ["Grand Total", total],

  ];

  const summarySheet =
    XLSX.utils.aoa_to_sheet(
      summaryData
    );

  summarySheet["!cols"] = [

    {

      wch: 25,

    },

    {

      wch: 30,

    },

  ];

  XLSX.utils.book_append_sheet(

    workbook,

    summarySheet,

    "Summary"

  );
    // ---------------------------------------
  // Transaction Sheet
  // ---------------------------------------

  const transactionData = [

    [

      "Invoice No",

      "Guest Name",

      "Phone",

      "Email",

      "Bill Type",

      "Payment",

      "Date",

      "Subtotal",

      "GST",

      "Grand Total",

      "Notes",

    ],

    ...transactions.map(

      (item) => [

        item.invoiceNumber || "",

        item.guestName || "",

        item.guestPhone || "",

        item.guestEmail || "",

        item.billType || "",

        item.paymentMode || "",

        item.date || "",

        money(item.subtotal),

        money(item.gstAmount),

        money(item.totalAmount),

        item.notes || "",

      ]

    ),

  ];

  const transactionSheet =

    XLSX.utils.aoa_to_sheet(

      transactionData

    );

  // ---------------------------------------
  // Column Width
  // ---------------------------------------

  transactionSheet["!cols"] = [

    { wch: 18 }, // Invoice

    { wch: 25 }, // Guest

    { wch: 18 }, // Phone

    { wch: 28 }, // Email

    { wch: 15 }, // Bill Type

    { wch: 15 }, // Payment

    { wch: 15 }, // Date

    { wch: 14 }, // Subtotal

    { wch: 12 }, // GST

    { wch: 16 }, // Grand Total

    { wch: 40 }, // Notes

  ];

  XLSX.utils.book_append_sheet(

    workbook,

    transactionSheet,

    "Transactions"

  );
    // ---------------------------------------
  // Payment Wise Sheets
  // ---------------------------------------

  const paymentTypes = [

    "CASH",

    "CARD",

    "ONLINE",

  ];

  paymentTypes.forEach((payment) => {

    const rows = transactions.filter(

      (item) =>

        item.paymentMode === payment

    );

    if (rows.length === 0) {

      return;

    }

    const paymentData = [

      [

        `${payment} TRANSACTIONS`

      ],

      [],

      [

        "Invoice No",

        "Guest",

        "Phone",

        "Email",

        "Bill Type",

        "Date",

        "Subtotal",

        "GST",

        "Grand Total",

      ],

      ...rows.map((item) => [

        item.invoiceNumber || "",

        item.guestName || "",

        item.guestPhone || "",

        item.guestEmail || "",

        item.billType || "",

        item.date || "",

        money(item.subtotal),

        money(item.gstAmount),

        money(item.totalAmount),

      ]),

      [],

      [

        "",

        "",

        "",

        "",

        "",

        "TOTAL",

        money(

          rows.reduce(

            (sum, row) =>

              sum +

              Number(

                row.subtotal || 0

              ),

            0

          )

        ),

        money(

          rows.reduce(

            (sum, row) =>

              sum +

              Number(

                row.gstAmount || 0

              ),

            0

          )

        ),

        money(

          rows.reduce(

            (sum, row) =>

              sum +

              Number(

                row.totalAmount || 0

              ),

            0

          )

        ),

      ],

    ];

    const paymentSheet =

      XLSX.utils.aoa_to_sheet(

        paymentData

      );

    paymentSheet["!cols"] = [

      { wch: 18 },

      { wch: 25 },

      { wch: 18 },

      { wch: 28 },

      { wch: 15 },

      { wch: 15 },

      { wch: 14 },

      { wch: 12 },

      { wch: 16 },

    ];

    XLSX.utils.book_append_sheet(

      workbook,

      paymentSheet,

      payment

    );

  });
    // ---------------------------------------
  // Workbook Properties
  // ---------------------------------------

  workbook.Props = {

    Title:
      "Mango Tree Resort Transactions",

    Subject:
      "Transaction Report",

    Author:
      "Mango Tree Resort",

    Company:
      "Mango Tree Resort",

    CreatedDate:
      new Date(),

  };

  // ---------------------------------------
  // File Name
  // ---------------------------------------

  const fileName =

    `MangoTree_Transactions_${
      reportTitle
        .replace(/\s+/g, "_")
        .replace(/[^\w]/g, "")
    }.xlsx`;

  // ---------------------------------------
  // Download Excel
  // ---------------------------------------

  XLSX.writeFile(

    workbook,

    fileName

  );

}