const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
};

export const invoiceTemplate = (booking, qrCode, logoBase64) => `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{
font-family:Arial,Helvetica,sans-serif;
background:#ffffff;
color:#333;
padding:35px;
font-size:13px;
}

.invoice{
width:100%;
border:1px solid #dcdcdc;
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
background:#1B5E20;
color:#fff;
padding:25px;
}

.logo-section{
display:flex;
align-items:center;
gap:18px;
}

.logo{
width:90px;
height:90px;
object-fit:contain;
background:#fff;
padding:5px;
border-radius:8px;
}

.resort-name{
font-size:30px;
font-weight:bold;
}

.resort-address{
margin-top:8px;
font-size:13px;
line-height:22px;
}

.invoice-box{
text-align:right;
}

.invoice-title{
font-size:34px;
font-weight:bold;
letter-spacing:2px;
}

.invoice-sub{
margin-top:10px;
font-size:14px;
line-height:24px;
}

.section{
padding:25px;
}

.row{
display:flex;
justify-content:space-between;
gap:30px;
margin-bottom:25px;
}

.card{
flex:1;
border:1px solid #ddd;
border-radius:8px;
padding:18px;
background:#fafafa;
}

.card-title{
font-size:18px;
font-weight:bold;
margin-bottom:15px;
color:#1B5E20;
border-bottom:2px solid #1B5E20;
padding-bottom:8px;
}

.info{
margin-bottom:8px;
line-height:22px;
}

.info b{
display:inline-block;
width:130px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

thead{
background:#1B5E20;
color:#fff;
}

th{
padding:14px;
font-size:13px;
text-align:center;
}

td{
padding:14px;
border:1px solid #ddd;
text-align:center;
}

.summary{
width:350px;
margin-left:auto;
margin-top:30px;
border:1px solid #ddd;
}

.summary td{
padding:12px;
text-align:right;
}

.summary td:first-child{
text-align:left;
}

.grand{
background:#1B5E20;
color:#fff;
font-size:18px;
font-weight:bold;
}

.footer{
margin-top:60px;
display:flex;
justify-content:space-between;
align-items:flex-end;
}

.signature{
text-align:center;
}

.signature-line{
margin-top:60px;
border-top:1px solid #000;
width:220px;
padding-top:8px;
}

.qr{
text-align:center;
}

.qr img{
width:130px;
height:130px;
}

.bottom{
margin-top:50px;
border-top:2px solid #ddd;
padding-top:20px;
text-align:center;
font-size:12px;
color:#777;
line-height:24px;
}

</style>

</head>

<body>

<div class="invoice">

<div class="header">

<div class="logo-section">

<img
class="logo"
src="data:image/png;base64,${logoBase64}"
>

<div>

<div class="resort-name">
Mango Tree Resort
</div>

<div class="resort-address">

Ahmedabad Mumbai Highway<br>

Valsad, Gujarat - 396001<br>

GSTIN : 24<br>

Phone : +91 99499 48904<br>

Email : info@mangotreeresort.com

</div>

</div>

</div>

<div class="invoice-box">

<div class="invoice-title">
TAX INVOICE
</div>

<div class="invoice-sub">

<b>Invoice No :</b>
${booking.bookingNumber}
<br>

<b>Date :</b>
${formatDate(new Date())}
<br>

<b>Status :</b>
PAID

</div>

</div>

</div>
<div class="section">

<div class="row">

<div class="card">

<div class="card-title">
Guest Details
</div>

<div class="info">
<b>Guest Name :</b>
${booking.guestName}
</div>

<div class="info">
<b>Email :</b>
${booking.guestEmail || "-"}
</div>

<div class="info">
<b>Phone :</b>
${booking.guestPhone || "-"}
</div>

<div class="info">
<b>Adults :</b>
${booking.adults}
</div>

<div class="info">
<b>Children :</b>
${booking.children}
</div>

</div>

<div class="card">

<div class="card-title">
Booking Details
</div>

<div class="info">
<b>Booking ID :</b>
${booking.bookingNumber}
</div>

<div class="info">
<b>Room :</b>
${booking.room.name}
</div>

<div class="info">
<b>Room No :</b>
${booking.room.roomNumber}
</div>

<div class="info">
<b>Check In :</b>
${formatDate(booking.checkIn)}
</div>

<div class="info">
<b>Check Out :</b>
${formatDate(booking.checkOut)}
</div>

<div class="info">
<b>Total Nights :</b>
${booking.totalNights}
</div>

</div>

</div>

<div class="card">

<div class="card-title">
Room Charges
</div>

<table>

<thead>

<tr>

<th>Date</th>

<th>Description</th>

<th>Qty</th>

<th>Rate</th>

<th>Total</th>

</tr>

</thead>

<tbody>

<tr>

<td>
${formatDate(booking.checkIn)}
</td>

<td>
${booking.room.name}
</td>

<td>
${booking.totalNights}
</td>

<td>
${formatCurrency(booking.pricePerNight)}
</td>

<td>
${formatCurrency(booking.totalAmount)}
</td>

</tr>

<tr>
    <td colspan="4" style="text-align:right;font-weight:bold;">
        Sub Total
    </td>
    <td>${formatCurrency(booking.totalAmount)}</td>
</tr>

<tr>
    <td colspan="4" style="text-align:right;font-weight:bold;">
        CGST (9%)
    </td>
    <td>${formatCurrency((booking.taxAmount || 0) / 2)}</td>
</tr>

<tr>
    <td colspan="4" style="text-align:right;font-weight:bold;">
        SGST (9%)
    </td>
    <td>${formatCurrency((booking.taxAmount || 0) / 2)}</td>
</tr>

<tr>
    <td colspan="4" style="text-align:right;font-weight:bold;">
        Discount
    </td>
    <td>${formatCurrency(booking.discountAmount || 0)}</td>
</tr>

<tr style="background:#1B5E20;color:white;font-size:16px;font-weight:bold;">
    <td colspan="4" style="text-align:right;">
        Grand Total
    </td>
    <td>${formatCurrency(booking.finalAmount)}</td>
</tr>

</tbody>

</table>

</div>

</div>
<div class="footer">

<div class="qr">

<h3 style="color:#1B5E20;margin-bottom:10px;">
Scan QR
</h3>

<img src="${qrCode}" />

<p style="margin-top:10px;">
Booking Verification
</p>

</div>

<div class="summary">

<table>

<tr>
<td>Sub Total</td>
<td>${formatCurrency(booking.totalAmount)}</td>
</tr>

<tr>
<td>CGST (9%)</td>
<td>${formatCurrency((booking.taxAmount || 0) / 2)}</td>
</tr>

<tr>
<td>SGST (9%)</td>
<td>${formatCurrency((booking.taxAmount || 0) / 2)}</td>
</tr>

<tr>
<td>Discount</td>
<td>${formatCurrency(booking.discountAmount || 0)}</td>
</tr>

<tr class="grand">
<td>Grand Total</td>
<td>${formatCurrency(booking.finalAmount)}</td>
</tr>

</table>

</div>

<div class="signature">

<div class="signature-line">
Authorised Signature
</div>

<p style="margin-top:8px;font-weight:bold;">
Mango Tree Resort
</p>

</div>

</div>

<div class="bottom">

<h2 style="color:#1B5E20;margin-bottom:10px;">
Thank You For Choosing
Mango Tree Resort
</h2>

<p>
We sincerely appreciate your stay with us.
</p>

<br>

<p>
This is a computer generated Tax Invoice and does not require a physical signature.
</p>

<br>

<p>

<b>Address :</b>
Ahmedabad Mumbai Highway,
Valsad, Gujarat - 396001

</p>

<p>

<b>Phone :</b>
+91 XXXXX XXXXX

</p>

<p>

<b>Email :</b>
info@mangotreeresort.com

</p>

<p>

<b>Website :</b>
www.mangotreeresort.com

</p>

<br>

<hr>

<div
style="
margin-top:15px;
font-size:11px;
color:#888;
line-height:20px;
">

<b>Terms & Conditions</b>

<br><br>

• Check-in Time : 02:00 PM

<br>

• Check-out Time : 11:00 AM

<br>

• Invoice generated against confirmed booking.

<br>

• GST charged as per Government norms.

<br>

• Refund & cancellation policy applicable as per booking terms.

<br>

• Please keep this invoice for future reference.

</div>

</div>

</div>

</body>

</html>

`;