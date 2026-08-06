import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP configuration error:", err.message);
  }
});

export const sendInvoiceEmail = async ({
  email,
  guestName,
  pdfPath,
  bookingNumber,
}) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Booking Confirmation - ${bookingNumber}`,
    html: `
      <h2>Hello ${guestName},</h2>

      <p>Your booking has been confirmed.</p>

      <p>
      Thank you for choosing
      <b>Mango Tree Resort</b>.
      </p>

      <p>
      Please find your invoice attached.
      </p>

      <br>

      Regards,<br>
      Mango Tree Resort
    `,
    attachments: [
      {
        filename: `${bookingNumber}.pdf`,
        path: pdfPath,
      },
    ],
  });

  console.log("Email Sent Successfully");
};