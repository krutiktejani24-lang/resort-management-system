import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  CreditCard,
  Calendar,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { bookingService, paymentService } from "../services/api";

export default function BookingPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["booking", roomId],
    queryFn: () => bookingService.getById(roomId),
  });

  const booking = data?.data?.data;

  const handlePayment = async () => {
    try {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded");
        return;
      }

      const { data } = await paymentService.createOrder(booking.id);

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Mango Tree",
        description: "Room Booking Payment",
        order_id: data.order.id,

        handler: async function (response) {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment Successful");

            navigate("/my-bookings");
          } catch (err) {
            console.error(err);

            toast.error("Payment Verification Failed");
          }
        },

        prefill: {
          name: booking.guestName,
          email: booking.guestEmail,
          contact: booking.guestPhone,
        },

        notes: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
        },

        theme: {
          color: "#2E8B57",
        },

        modal: {
          ondismiss: function () {
            toast("Payment Cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (err) {
      console.error(err);

      toast.error("Payment Failed");
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <h2 className="text-gray-500 text-xl">
          Booking Not Found
        </h2>
      </div>
    );
  }
    return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="text-center mb-10">
          <p className="text-green-600 uppercase tracking-widest text-sm font-semibold">
            Secure Checkout
          </p>

          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            Complete Your Booking
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* LEFT SIDE */}

          <div className="lg:col-span-2">

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

              <img
                src={
                  booking.room?.images?.length
                    ? booking.room.images[0]
                    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900"
                }
                alt={booking.room?.name}
                className="w-full h-64 object-cover"
              />

              <div className="p-6">

                <h2 className="text-2xl font-bold">
                  {booking.room?.name}
                </h2>

                <p className="text-gray-500 mt-1">
                  {booking.room?.category?.name}
                </p>

                <div className="border-t mt-6 pt-6 space-y-4">

                  <div className="flex items-center">

                    <Calendar
                      size={18}
                      className="text-green-600 mr-3"
                    />

                    <div>

                      <p className="text-sm text-gray-500">
                        Check In
                      </p>

                      <p className="font-semibold">
                        {format(
                          new Date(booking.checkIn),
                          "dd MMM yyyy"
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center">

                    <Calendar
                      size={18}
                      className="text-red-500 mr-3"
                    />

                    <div>

                      <p className="text-sm text-gray-500">
                        Check Out
                      </p>

                      <p className="font-semibold">
                        {format(
                          new Date(booking.checkOut),
                          "dd MMM yyyy"
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center">

                    <Users
                      size={18}
                      className="text-blue-500 mr-3"
                    />

                    <div>

                      <p className="text-sm text-gray-500">
                        Guests
                      </p>

                      <p className="font-semibold">
                        {booking.adults} Adults
                        {booking.children > 0 &&
                          ` , ${booking.children} Children`}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="lg:col-span-3">

            <div className="bg-white rounded-xl shadow-lg p-8">

              <div className="flex items-center mb-6">

                <CreditCard
                  className="text-green-700 mr-3"
                  size={22}
                />

                <h2 className="text-2xl font-bold">
                  Booking Details
                </h2>

              </div>

              <div className="bg-green-50 rounded-lg p-5">

                <div className="grid grid-cols-2 gap-5">

                  <div>

                    <p className="text-sm text-gray-500">
                      Guest Name
                    </p>

                    <h3 className="font-semibold">
                      {booking.guestName}
                    </h3>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <h3 className="font-semibold">
                      {booking.guestEmail}
                    </h3>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Phone
                    </p>

                    <h3 className="font-semibold">
                      {booking.guestPhone || "-"}
                    </h3>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Booking Number
                    </p>

                    <h3 className="font-semibold text-green-700">
                      {booking.bookingNumber}
                    </h3>

                  </div>

                </div>

              </div>

              <div className="border-t mt-8 pt-6 space-y-4">

                <div className="flex justify-between">

                  <span>
                    Room Price
                  </span>

                  <span>
                    ₹{booking.pricePerNight}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Nights
                  </span>

                  <span>
                    {booking.totalNights}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Sub Total
                  </span>

                  <span>
                    ₹{booking.totalAmount}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Tax
                  </span>

                  <span>
                    ₹{booking.taxAmount}
                  </span>

                </div>

                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">

                    <span>
                      Discount
                    </span>

                    <span>
                      -₹{booking.discountAmount}
                    </span>

                  </div>
                )}

                <div className="border-t pt-5 flex justify-between text-2xl font-bold">

                  <span>
                    Total
                  </span>

                  <span className="text-green-700">

                    ₹{booking.finalAmount}

                  </span>

                </div>
                              </div>

              {/* Payment Section */}

              {booking.paymentStatus === "PAID" ? (

                <div className="mt-10 text-center">

                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">

                    <Check
                      size={36}
                      className="text-green-700"
                    />

                  </div>

                  <h2 className="text-3xl font-bold text-green-700">

                    Payment Successful

                  </h2>

                  <p className="text-gray-500 mt-2">

                    Your booking has been confirmed successfully.

                  </p>

                  <button
                    onClick={() => navigate("/my-bookings")}
                    className="mt-8 px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    View My Bookings
                  </button>

                </div>

              ) : (

                <>

                  <div className="mt-8 rounded-lg border bg-gray-50 p-5">

                    <div className="flex items-center mb-4">

                      <CreditCard
                        className="text-green-700 mr-2"
                        size={20}
                      />

                      <h3 className="font-semibold">

                        Secure Payment

                      </h3>

                    </div>

                    <p className="text-sm text-gray-500">

                      Your payment is securely processed using Razorpay.

                    </p>

                  </div>

                  <button
                    onClick={handlePayment}
                    className="w-full mt-8 bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-lg transition"
                  >
                    Pay ₹{booking.finalAmount}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-4">

                    100% Secure Payment Powered by Razorpay

                  </p>

                </>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}