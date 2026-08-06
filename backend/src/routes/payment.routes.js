  import "dotenv/config";
  import { Router } from 'express';
  import Razorpay from 'razorpay';
  import crypto from 'crypto';
  import prisma from '../config/prisma.js';
  import { protect } from '../middleware/auth.middleware.js';
  import { sendInvoiceEmail } from "../services/email.service.js";
  import { generateInvoicePdf } from "../utils/invoicePdfUrl.js";


  const router = Router();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  // Create Razorpay Order
  router.post('/create-order', protect, async (req, res) => {
    try {
      const { bookingId } = req.body;

      const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
    include: {
      room: true,
      user: true,
      transaction:true,
    },
  });

      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found',
        });
      }

      const order = await razorpay.orders.create({
        amount: Math.round(booking.finalAmount * 100),
        currency: 'INR',
        receipt: booking.bookingNumber,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentIntentId: order.id,
        },
      });
      res.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
        order,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: err.message,
      });
    }
  });

  // Verify Payment
  router.post('/verify', protect, async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: "Invalid Signature",
        });
      }

      const payment = await razorpay.payments.fetch(
    razorpay_payment_id
  );

  if (payment.status !== "captured") {
    return res.status(400).json({
      success: false,
      message: "Payment not captured",
    });
  }

      // Booking શોધો
      const booking = await prisma.booking.findFirst({
        where: {
          paymentIntentId: razorpay_order_id,
        },
        include: {
          room: {
            include: {
              category: true,
            },
          },
          user: true,
        },
      });

      if (!booking) {
        return res.status(404).json({
          error: "Booking not found",
        });
      }

      if (booking.status === "CANCELLED") {
    return res.status(400).json({
      success: false,
      message: "Booking already cancelled",
    });
  }

  if (booking.paymentStatus === "PAID") {
    return res.json({
      success:true,
      bookingId:booking.id,
      bookingNumber:booking.bookingNumber,
      paymentId:razorpay_payment_id,
      invoicePdfUrl:booking.invoicePdfUrl,
      message:"Payment Successful"
  });
  }
      // ===============================
  // Generate Invoice PDF
  // ===============================
  // PDF બનાવો
await prisma.booking.update({
  where: { id: booking.id },
  data: {
    paymentStatus: "PAID",
    status: "CONFIRMED",
  },
});

const latestBooking = await prisma.booking.findUnique({
  where: {
    id: booking.id,
  },
  include: {
    room: {
      include: {
        category: true,
      },
    },
    user: true,
  },
});

  const invoiceNumber =
  `INV-${Date.now()}`;

const bookingData = await prisma.booking.findUnique({
  where: { id: booking.id },
  include: {
    room: {
      include: {
        category: true,
      },
    },
    user: true,
  },
});
const pdf = await generateInvoicePdf(bookingData);

await prisma.booking.update({
  where: { id: booking.id },
  data: {
    invoiceNumber,
    invoicePdfUrl: pdf.pdfUrl,
    invoiceSent: true,
  },
});


  // Email મોકલો
try {
  await sendInvoiceEmail({
    email: booking.guestEmail,
    guestName: booking.guestName,
    bookingNumber: booking.bookingNumber,
    pdfPath: pdf.pdfPath,
  });
} catch (err) {
  console.error("Email Error:", err.message);
}

      // Duplicate transaction ના બને
  const alreadyExists =
  await prisma.transaction.count({

      where:{
          bookingId:booking.id
      }

  });
      if (!alreadyExists) { 
await prisma.transaction.create({
  data: {
    booking: {
      connect: {
        id: booking.id,
      },
    },

    creator: {
      connect: {
        id: booking.userId,
      },
    },

    invoiceNumber,

    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,

    roomNumber: booking.room.roomNumber,
    roomType: booking.room.category?.name || booking.room.name,

    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.totalNights,

    paymentMode: "ONLINE",
    invoiceType: "GST",

    subtotal: booking.totalAmount,
    gstAmount: booking.taxAmount,
    serviceCharge: 0,
    discount: 0,
    totalAmount: booking.finalAmount,

    notes: "",

    status: "ACTIVE",

    invoicePdfUrl: pdf.pdfUrl,

    items: {
      create: [
        {
          category: "ROOM",

          description: `${booking.room.name} Stay`,

          quantity: booking.totalNights,

          unitPrice: booking.pricePerNight,

          gstPercent:
            booking.totalAmount > 0
              ? Number(
                  (
                    (Number(booking.taxAmount) * 100) /
                    Number(booking.totalAmount)
                  ).toFixed(2)
                )
              : 0,

          total: booking.finalAmount,
        },
      ],
    },
  },
});
      }
      // Generate Invoice PDF
  return res.json({
  success: true,

  bookingId: latestBooking.id,

  bookingNumber: latestBooking.bookingNumber,

  invoiceNumber,

  paymentId: razorpay_payment_id,

  invoicePdfUrl: pdf.pdfUrl,

  message: "Payment Successful",
});
    } catch (err) {
      console.error(err);

      res.status(500).json({
            success:false,

      message:err.message
      });
    }
  });

  export default router;