import QRCode from "qrcode";

export async function generateInvoiceQR(invoiceNo){

    return await QRCode.toDataURL(
        `https://mangotreeresort.com/invoice/${invoiceNo}`
    );

}