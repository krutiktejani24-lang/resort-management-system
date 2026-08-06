const buildInvoiceData = (data) => {
  return {
    invoiceNumber: data.invoiceNumber,

    guest: {
      name: data.guestName || "",
      phone: data.guestPhone || "",
      email: data.guestEmail || "",
    },

    booking: {
      bookingNumber: data.bookingNumber || "",
      roomName: data.roomName || "",
      roomNumber: data.roomNumber || "",
      checkIn: data.checkIn || null,
      checkOut: data.checkOut || null,
      nights: data.totalNights || 0,
    },

    payment: {
      mode: data.paymentMode || "CASH",
      subtotal: Number(data.totalAmount || 0),
      gst: Number(data.taxAmount || 0),
      discount: Number(data.discountAmount || 0),
      total: Number(data.finalAmount || 0),
    },

    items: data.items || [],
  };
};

module.exports = {
  buildInvoiceData,
};