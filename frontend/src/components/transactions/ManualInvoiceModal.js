import React, {
  useState,
  useMemo,
} from "react";

import axios from "axios";

import { QRCodeCanvas } from "qrcode.react";
import { money } from "./ utils/money";
import { today } from "./ utils/today";

const API =
  "http://localhost:8000/api/transactions";

const PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "ONLINE",
];

const GST_OPTIONS = [
  0,
  5,
  12,
  18,
  28,
];

export default function ManualInvoiceModal({

  open,

  onClose,

  onGenerate,

}) {

  if (!open) return null;

  const token =
    localStorage.getItem("token");

  // ---------------------------------------
  // Loading
  // ---------------------------------------

  const [
    saving,
    setSaving,
  ] = useState(false);

  // ---------------------------------------
  // Validation Errors
  // ---------------------------------------

  const [
    errors,
    setErrors,
  ] = useState({});

  // ---------------------------------------
  // Invoice Form
  // ---------------------------------------

  const [
    form,
    setForm,
  ] = useState({

    guest: "",

    phone: "",

    email: "",

    date: today(),

      checkIn: "",        // ADD

  checkOut: "",

    payment: "CASH",

    billType: "GST",

    notes: "",

    items: [

      {

        description: "",

        qty: 1,

        price: 0,

        gst: 18,

      },

    ],

  });

  // ---------------------------------------
  // Invoice Number
  // ---------------------------------------

  const invoiceNumber =
    useMemo(() => {

      return (

        "INV-" +

        new Date().getFullYear() +

        "-" +

        Math.floor(
          Math.random() * 90000 + 10000
        )

      );

    }, []);
      // ---------------------------------------
  // Update Invoice Item
  // ---------------------------------------

  const updateItem = (
    index,
    field,
    value
  ) => {

    const updatedItems = [
      ...form.items,
    ];

    updatedItems[index][field] =
      value;

    setForm({

      ...form,

      items: updatedItems,

    });

  };

  // ---------------------------------------
  // Add New Item
  // ---------------------------------------

  const addItem = () => {

    setForm({

      ...form,

      items: [

        ...form.items,

        {

          description: "",

          qty: 1,

          price: 0,

          gst: 18,

        },

      ],

    });

  };

  // ---------------------------------------
  // Remove Item
  // ---------------------------------------

  const removeItem = (
    index
  ) => {

    if (
      form.items.length === 1
    ) {

      return;

    }

    setForm({

      ...form,

      items:
        form.items.filter(

          (_, i) =>

            i !== index

        ),

    });

  };

  // ---------------------------------------
  // Reset Form
  // ---------------------------------------

  const resetForm = () => {

    setErrors({});

    setForm({

      guest: "",

      phone: "",

      email: "",

      date: today(),

        checkIn: "",
        checkOut: "",

      payment: "CASH",

      billType: "GST",

      notes: "",

      items: [

        {

          description: "",

          qty: 1,

          price: 0,

          gst: 18,

        },

      ],

    });

  };
    // ---------------------------------------
  // Subtotal
  // ---------------------------------------

  const subtotal = useMemo(() => {

    return form.items.reduce(

      (total, item) => {

        return (

          total +

          Number(item.qty) *

          Number(item.price)

        );

      },

      0

    );

  }, [form.items]);

  // ---------------------------------------
  // GST Amount
  // ---------------------------------------

  const gstAmount = useMemo(() => {

    return form.items.reduce(

      (total, item) => {

        const amount =

          Number(item.qty) *

          Number(item.price);

        return (

          total +

          (amount *

            Number(item.gst)) /

            100

        );

      },

      0

    );

  }, [form.items]);

  // ---------------------------------------
  // Grand Total
  // ---------------------------------------

  const grandTotal =
    subtotal + gstAmount;

  // ---------------------------------------
  // Invoice Preview
  // ---------------------------------------

  const invoicePreview = {

    invoiceNumber,

    guest:
      form.guest ||

      "Guest Name",

    phone:
      form.phone ||

      "-",

    email:
      form.email ||

      "-",

    payment:
      form.payment,

    billType:
      form.billType,

    date:
      form.date,

    items:
      form.items,

    subtotal,

    gstAmount,

    grandTotal,

    notes:
      form.notes,

  };

  // ---------------------------------------
  // Validate Form
  // ---------------------------------------

  const validateForm = () => {

    const error = {};

    if (

      !form.guest.trim()

    ) {

      error.guest =
        "Guest Name is required";

    }

    if (

      !form.phone.trim()

    ) {

      error.phone =
        "Phone Number is required";

    }

    if (

      form.items.length === 0

    ) {

      error.items =
        "Minimum one item required";

    }

    form.items.forEach(

      (item, index) => {

        if (

          !item.description.trim()

        ) {

          error[
            `description${index}`
          ] =
            "Description required";

        }

        if (

          Number(item.qty) <= 0

        ) {

          error[
            `qty${index}`
          ] =
            "Invalid Qty";

        }

        if (

          Number(item.price) <= 0

        ) {

          error[
            `price${index}`
          ] =
            "Invalid Price";

        }

      }

    );

    setErrors(error);

    return (

      Object.keys(error).length === 0

    );

  };
  // ---------------------------------------
  // Send Invoice Email
  // ---------------------------------------

  const sendEmail = async () => {

    if (!form.email) {

      alert("Guest email is required.");

      return;

    }

    try {

      await axios.post(

        `${API}/email`,

        {

          guestEmail: form.email,

          invoiceNumber,

        },

        {

          headers: {

            Authorization:

              `Bearer ${token}`,

          },

        }

      );

      alert(

        "Invoice emailed successfully."

      );

    } catch (err) {

      console.error(err);

      alert(

        "Unable to send invoice."

      );

    }

  };

  // ---------------------------------------
  // Save Invoice
  // ---------------------------------------

  const saveInvoice = async () => {

    if (!validateForm()) {

      return;

    }

    try {

      setSaving(true);

      const payload = {

        guestName: form.guest,

        guestPhone: form.phone,

        guestEmail: form.email,
        checkIn: form.checkIn,

  checkOut: form.checkOut,

        paymentMode: form.payment,

        billType: form.billType,

        notes: form.notes,

        items: form.items.map(

          (item) => ({

            category: "Manual",

            description:

              item.description,

            qty:

              Number(item.qty),

            price:

              Number(item.price),

            gst:

              Number(item.gst),

          })

        ),

      };

      const res = await axios.post(

        API,

        payload,

        {

          headers: {

            Authorization:

              `Bearer ${token}`,

          },

        }

      );
       const invoice = res.data.data;

if (onGenerate) {
  onGenerate(invoice);
}

resetForm();
onClose();

    } catch (err) {

      console.error(err);

      alert(

        "Unable to save invoice."

      );

    } finally {

      setSaving(false);

    }

  };

  const inputStyle = {
  width: "100%",
  height: "46px",
  padding: "0 14px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  outline: "none",
  fontSize: "15px",
  color: "#111827",
  background: "#fff",
  transition: "all .25s ease",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
  color: "#374151",
  fontSize: "14px",
};
    // ---------------------------------------
  // UI
  // ---------------------------------------

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >

      <div
        style={{
          width: "1100px",
          background: "#fff",
          borderRadius: 12,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 30,
        }}
      >

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
                color: "#15803d",
              }}
            >
              Create Manual Invoice
            </h2>

            <div
              style={{
                color: "#6b7280",
                marginTop: 5,
              }}
            >
              GST Professional Invoice
            </div>

          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 30,
              cursor: "pointer",
            }}
          >
            ×
          </button>

        </div>

        {/* -------------------------------- */}
        {/* Guest Information */}
        {/* -------------------------------- */}

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 20,
            marginBottom: 25,
          }}
        >

          <h3
            style={{
              marginTop: 0,
              color: "#15803d",
            }}
          >
            Guest Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 20,
            }}
          >

            {/* Guest Name */}

            <div>

              <label style={labelStyle}>
  Guest Name *
</label>

<input
  value={form.guest}
  onChange={(e)=>
    setForm({
      ...form,
      guest:e.target.value
    })
  }
  placeholder="Enter Guest Name"
  style={inputStyle}
/>
              {errors.guest && (

                <div
                  style={{
                    color: "red",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  {errors.guest}
                </div>

              )}

            </div>

            {/* Phone */}

            <div>

              <label style={labelStyle}>
 Phone Number *
</label>

<input
  value={form.phone}
  onChange={(e)=>
    setForm({
      ...form,
      phone:e.target.value
    })
  }
  placeholder="9876543210"
  style={inputStyle}
/>

              {errors.phone && (

                <div
                  style={{
                    color: "red",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  {errors.phone}
                </div>

              )}

            </div>

            {/* Email */}

            <div>

              <label style={labelStyle}>
 Email Address
</label>

<input
 type="email"
 value={form.email}
 placeholder="guest@gmail.com"
 onChange={(e)=>
   setForm({
     ...form,
     email:e.target.value
   })
 }
 style={inputStyle}
/>

            </div>

            {/* Date */}

            <div>


              <label style={labelStyle}>
Invoice Date
</label>

<input
 type="date"
 value={form.date}
 onChange={(e)=>
   setForm({
     ...form,
     date:e.target.value
   })
 }
 style={inputStyle}
/>

            </div>
            <div>

  <label style={labelStyle}>
    Check In
  </label>

  <input
    type="date"
    value={form.checkIn}
    onChange={(e)=>
      setForm({
        ...form,
        checkIn: e.target.value,
      })
    }
    style={inputStyle}
  />

</div>

<div>

  <label style={labelStyle}>
    Check Out
  </label>

  <input
    type="date"
    value={form.checkOut}
    onChange={(e)=>
      setForm({
        ...form,
        checkOut: e.target.value,
      })
    }
    style={inputStyle}
  />

</div>

          </div>

        </div>
                {/* -------------------------------- */}
        {/* Payment & Bill Type */}
        {/* -------------------------------- */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 20,
            marginBottom: 25,
          }}
        >

          {/* Payment */}

          <div>

            <label>
              Payment Method
            </label>

            <select
              
              value={form.payment}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment: e.target.value,
                })
              }
               style={inputStyle}
            >

              {PAYMENT_METHODS.map(
                (method) => (

                  <option
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>

                )
              )}

            </select>

          </div>

          {/* Bill Type */}

          <div>

            <label>
              Bill Type
            </label>

            <select
              value={form.billType}
              onChange={(e) =>
                setForm({
                  ...form,
                  billType:
                    e.target.value,
                })
              }
               style={inputStyle}
            >

              <option value="GST">
                GST Invoice
              </option>

            </select>

          </div>

        </div>

        {/* -------------------------------- */}
        {/* Invoice Items */}
        {/* -------------------------------- */}

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: 20,
            marginBottom: 25,
          }}
        >

          <h3
            style={{
              marginTop: 0,
              color: "#15803d",
            }}
          >
            Invoice Items
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >

            <thead>

              <tr
                style={{
                  background: "#f3f4f6",
                }}
              >

                <th
                  style={{
                    padding: 10,
                  }}
                >
                  Description
                </th>

                <th width="80">
                  Qty
                </th>

                <th width="120">
                  Price
                </th>

                <th width="100">
                  GST %
                </th>

                <th width="140">
                  Amount
                </th>

                <th width="70">
                </th>

              </tr>

            </thead>

            <tbody>

              {form.items.map(
                (item, index) => (

                  <tr key={index}>

                    {/* Description */}

                    <td
                      style={{
                        padding: 8,
                      }}
                    >
<input
  value={item.description}
  placeholder="Room Rent / Food / Spa"
  onChange={(e)=>
    updateItem(
      index,
      "description",
      e.target.value
    )
  }
  style={{
    ...inputStyle,
    height:"42px"
  }}
/>

                      {errors[
                        `description${index}`
                      ] && (

                        <div
                          style={{
                            color: "red",
                            fontSize: 11,
                            marginTop: 3,
                          }}
                        >
                          {
                            errors[
                              `description${index}`
                            ]
                          }
                        </div>

                      )}

                    </td>

                    {/* Qty */}

                    <td>

                      <input type="number"
  min={1}
  value={item.qty}
  onChange={(e)=>
    updateItem(
      index,
      "qty",
      Number(e.target.value)
    )
  }
  style={{
    ...inputStyle,
    width:"70px",
    textAlign:"center",
    padding:"0"
  }}
/>

                    </td>

                    {/* Price */}

                    <td>

                      <input
  type="number"
  value={item.price}
  onChange={(e)=>
    updateItem(
      index,
      "price",
      Number(e.target.value)
    )
  }
  style={{
    ...inputStyle,
    width:"110px",
    textAlign:"right"
  }}
/>

                    </td>

                    {/* GST */}

                    <td>

                      <select
                        value={item.gst}

                        onChange={(e) =>
                          updateItem(
                            index,
                            "gst",
                            Number(
                              e.target.value
                            )
                          )
                        }

                        style={{
                          width: 80,
                          padding: 8,
                        }}
                      >

                        {GST_OPTIONS.map(
                          (gst) => (

                            <option
                              key={gst}
                              value={gst}
                            >
                              {gst}%
                            </option>

                          )
                        )}

                      </select>

                    </td>

                    {/* Amount */}

                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {money(
                        item.qty *
                        item.price
                      )}
                    </td>

                    {/* Delete */}

                    <td>

                      {form.items.length >
                        1 && (

                        <button
                          type="button"

                          onClick={() =>
                            removeItem(
                              index
                            )
                          }

                          style={{
                            background:
                              "#dc2626",
                            color:
                              "#fff",
                            border:
                              "none",
                            borderRadius: 6,
                            padding:
                              "7px 10px",
                            cursor:
                              "pointer",
                          }}
                        >
                          ✕

                        </button>

                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          <button
            type="button"

            onClick={addItem}

            style={{
              marginTop: 20,
              background: "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Item
          </button>

        </div>
                {/* -------------------------------- */}
        {/* Notes */}
        {/* -------------------------------- */}

        <div
          style={{
            marginBottom: 25,
          }}
        >

          <textarea
  rows={5}
  value={form.notes}
  onChange={(e)=>
    setForm({
      ...form,
      notes:e.target.value
    })
  }
  placeholder="Additional Notes..."
  style={{
    width:"100%",
    padding:"14px",
    border:"1px solid #d1d5db",
    borderRadius:"10px",
    fontSize:"15px",
    resize:"vertical",
    outline:"none"
  }}
/>

        </div>

        {/* -------------------------------- */}
        {/* Invoice Summary */}
        {/* -------------------------------- */}

        <div
          style={{
            background: "#f8fafc",
            borderRadius: 10,
            padding: 20,
            marginBottom: 35,
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span>Subtotal</span>

            <strong>
              {money(subtotal)}
            </strong>

          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span>GST</span>

            <strong>
              {money(gstAmount)}
            </strong>

          </div>

          <hr />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
              fontWeight: "bold",
              color: "#15803d",
            }}
          >

            <span>
              Grand Total
            </span>

            <span>
              {money(grandTotal)}
            </span>

          </div>

        </div>

        {/* -------------------------------- */}
        {/* Live Invoice Preview */}
        {/* -------------------------------- */}

        <div
          style={{
            border: "2px solid #15803d",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 30,
          }}
        >

          {/* Header */}

          <div
            style={{
              background: "#14532d",
              color: "#fff",
              padding: 20,
            }}
          >

            <img
              src="/logo.png"
              alt="logo"
              style={{
                width: 70,
                marginBottom: 10,
              }}
            />

            <h2
              style={{
                margin: 0,
              }}
            >
              MANGO TREE
            </h2>

            <div
              style={{
                marginTop: 5,
                opacity: .9,
              }}
            >
              Professional Tax Invoice
            </div>

          </div>

          {/* Body */}

          <div
            style={{
              padding: 25,
            }}
          >

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,1fr)",
                gap: 25,
                marginBottom: 25,
              }}
            >

              <div>

                <b>Guest Name</b>

                <div>
                  {form.guest || "-"}
                </div>

                <br />

                <b>Phone</b>

                <div>
                  {form.phone || "-"}
                </div>

                <br />

                <b>Email</b>

                <div>
                  {form.email || "-"}
                </div>

              </div>

              <div>

                <b>Invoice No.</b>

                <div>
                  {invoiceNumber}
                </div>

                <br />

                <b>Date</b>

                <div>
                  {form.date}
                </div>
                <b>Check In</b>

<div>
  {form.checkIn || "-"}
</div>

<br />

<b>Check Out</b>

<div>
  {form.checkOut || "-"}
</div>

<br />

                <br />

                <b>Bill Type</b>

                <div>
                  {form.billType}
                </div>

                <br />

                <b>Payment</b>

                <div>
                  {form.payment}
                </div>

              </div>

            </div>

            {/* Items */}

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                marginBottom: 30,
              }}
            >

              <thead>

                <tr
                  style={{
                    background:
                      "#f3f4f6",
                  }}
                >

                  <th
                    style={{
                      padding: 10,
                    }}
                  >
                    Description
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    GST
                  </th>

                  <th>
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {form.items.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={index}
                    >

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        {item.description ||
                          "-"}
                      </td>

                      <td
                        style={{
                          textAlign:
                            "center",
                        }}
                      >
                        {item.qty}
                      </td>

                      <td
                        style={{
                          textAlign:
                            "right",
                        }}
                      >
                        {money(
                          item.price
                        )}
                      </td>

                      <td
                        style={{
                          textAlign:
                            "center",
                        }}
                      >
                        {item.gst}%
                      </td>

                      <td
                        style={{
                          textAlign:
                            "right",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {money(
                          item.qty *
                            item.price
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

            {/* Total */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >

              <div
                style={{
                  width: 320,
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: 8,
                  }}
                >

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {money(
                      subtotal
                    )}
                  </strong>

                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: 8,
                  }}
                >

                  <span>
                    GST
                  </span>

                  <strong>
                    {money(
                      gstAmount
                    )}
                  </strong>

                </div>

                <hr />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: 22,
                    fontWeight:
                      "bold",
                    color:
                      "#15803d",
                  }}
                >

                  <span>
                    Grand Total
                  </span>

                  <span>
                    {money(
                      grandTotal
                    )}
                  </span>

                </div>

              </div>

            </div>
                        {/* -------------------------------- */}
            {/* QR Code & Signature */}
            {/* -------------------------------- */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 40,
              }}
            >

              <div>

                <b>
                  Scan Invoice
                </b>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >

                  <QRCodeCanvas
                    value={JSON.stringify({
                      invoice: invoiceNumber,
                      guest: form.guest,
                      amount: grandTotal,
                    })}
                    size={120}
                  />

                </div>

              </div>

              <div
                style={{
                  textAlign: "center",
                }}
              >

                <b>
                  Authorized Signature
                </b>

                <div
                  style={{
                    width: 180,
                    borderTop:
                      "1px solid #000",
                    marginTop: 60,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        {/* -------------------------------- */}
        {/* Footer Buttons */}
        {/* -------------------------------- */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 30,
            flexWrap: "wrap",
          }}
        >

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "12px 22px",
              border:
                "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              borderRadius: 8,
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={saveInvoice}
            disabled={saving}
            style={{
              padding: "12px 28px",
              background: "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontWeight: "bold",
              opacity:
                saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Generating..."
              : "Generate Invoice"}
          </button>

        </div>

      </div>

    </div>

  );

}