import QRCode from "qrcode";

export const generateQRCode = async (booking) => {

    return await QRCode.toDataURL(
        JSON.stringify({
            booking: booking.bookingNumber,
            guest: booking.guestName,
            amount: booking.finalAmount,
            resort: "Mango Tree Resort"
        })
    );

};