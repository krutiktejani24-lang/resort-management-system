import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Users, Maximize, Bed, ChevronLeft, ChevronRight, Check, Layers } from 'lucide-react';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import { roomService, bookingService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function RoomDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [currentImg, setCurrentImg] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['room', slug],
    queryFn: () => roomService.getBySlug(slug),
  });
  const room = data?.data?.data;

  const { data: categoriesData } = useQuery({
    queryKey: ['roomCategories'],
    queryFn: roomService.getCategories,
  });
  const categories = categoriesData?.data?.data || [];
  const totalRoomsOfType = categories.find(c => c.id === room?.categoryId)?._count?.rooms;

  if (isLoading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-resort-200 border-t-resort-600 rounded-full animate-spin" />
    </div>
  );
  if (!room) return <div className="pt-20 text-center py-20 text-gray-500">Room not found.</div>;

  const nights = checkIn && checkOut
    ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    : 0;
  const subtotal = nights * room.pricePerNight;
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  const avgRating = room.reviews?.length
    ? room.reviews.reduce((s, r) => s + r.rating, 0) / room.reviews.length : 0;

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!checkIn || !checkOut) { toast.error('Please select check-in and check-out dates'); return; }
    setBooking(true);
    try {
      const { data: res } = await bookingService.create({
        categoryId: room.categoryId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults: guests,
        children: 0,
        guestName: `${user.firstName} ${user.lastName}`,
        guestEmail: user.email,
        guestPhone: user.phone || '',
      });
      toast.success('Booking created! Redirecting to payment…');
      navigate(`/booking/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const images = room.images?.length ? room.images : ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900'];

  return (
    <div className="pt-20 bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-400 flex items-center space-x-2">
        <Link to="/" className="hover:text-resort-600">Home</Link>
        <span>/</span>
        <Link to="/rooms" className="hover:text-resort-600">Rooms</Link>
        <span>/</span>
        <span className="text-gray-700">{room.name}</span>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="lg:col-span-2 aspect-[16/10] overflow-hidden relative group">
            <img src={images[currentImg]} alt={room.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setCurrentImg(i => (i + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-2">
            {images.slice(1, 3).map((img, i) => (
              <div key={i} onClick={() => setCurrentImg(i + 1)} className="aspect-video lg:aspect-auto lg:flex-1 overflow-hidden cursor-pointer">
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <div className="flex space-x-2 mt-2 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button key={i} onClick={() => setCurrentImg(i)}
                className={`flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-all ${i === currentImg ? 'border-resort-500' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="badge-green mb-2 inline-block">{room.category?.name}</span>
                <h1 className="font-display text-4xl font-bold text-gray-900">{room.name}</h1>
              </div>
              {avgRating > 0 && (
                <div className="text-center flex-shrink-0">
                  <div className="flex items-center space-x-1 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= Math.round(avgRating) ? 'text-gold-500 fill-gold-500' : 'text-gray-300 fill-gray-300'} />)}
                  </div>
                  <p className="text-xs text-gray-400">{room.reviews?.length} reviews</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
              <span className="flex items-center space-x-2"><Users size={15} className="text-resort-500" /><span>Up to {room.capacity} guests</span></span>
              {room.size && <span className="flex items-center space-x-2"><Maximize size={15} className="text-resort-500" /><span>{room.size} m²</span></span>}
              <span className="flex items-center space-x-2"><Bed size={15} className="text-resort-500" /><span>{room.bedType}</span></span>
              {totalRoomsOfType && <span className="flex items-center space-x-2 text-resort-600 font-medium"><Layers size={15} /><span>{totalRoomsOfType} Rooms Available</span></span>}
            </div>

            <div className="mb-10">
              <h2 className="font-display text-2xl font-semibold mb-4">About This Room</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{room.description}</p>
            </div>

            {/* Amenities */}
            {room.amenities?.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold mb-6">Room Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map(a => (
                    <div key={a} className="flex items-center space-x-3 p-3 bg-resort-50">
                      <Check size={14} className="text-resort-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {room.reviews?.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Guest Reviews</h2>
                <div className="space-y-6">
                  {room.reviews.slice(0, 4).map(review => (
                    <div key={review.id} className="border-b border-gray-50 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-resort-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-resort-700 font-medium text-sm">
                            {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{review.user?.firstName} {review.user?.lastName}</span>
                            <div className="flex items-center space-x-0.5">
                              {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />)}
                            </div>
                          </div>
                          {review.title && <p className="font-medium text-sm text-gray-800 mb-1">{review.title}</p>}
                          <p className="text-gray-500 text-sm">{review.comment}</p>
                          {review.response && (
                            <div className="mt-3 p-3 bg-resort-50 border-l-2 border-resort-400">
                              <p className="text-xs font-medium text-resort-700 mb-1">Resort Response</p>
                              <p className="text-sm text-gray-600">{review.response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-resort-lg border border-gray-100 p-6 sticky top-24">
              <div className="mb-6">
                <span className="text-3xl font-display font-bold text-resort-700">₹{room.pricePerNight}</span>
                <span className="text-sm text-gray-400 ml-1">per night</span>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="label-field">Check In</label>
                  <DatePicker selected={checkIn} onChange={setCheckIn} minDate={new Date()} placeholderText="Select date" className="input-field w-full" />
                </div>
                <div>
                  <label className="label-field">Check Out</label>
                  <DatePicker selected={checkOut} onChange={setCheckOut} minDate={checkIn || new Date()} placeholderText="Select date" className="input-field w-full" />
                </div>
                <div>
                  <label className="label-field">Guests</label>
                  <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="input-field">
                    {[...Array(room.capacity)].map((_, i) => <option key={i} value={i+1}>{i+1} Guest{i > 0 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="border-t border-gray-100 pt-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>₹{room.pricePerNight} × {nights} nights</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & fees (12%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-resort-700">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={booking || room.status !== 'AVAILABLE'}
                className="btn-primary w-full text-center py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? 'Processing…' : room.status !== 'AVAILABLE' ? 'Not Available' : 'Reserve Now'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">No charge until confirmation</p>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <p className="flex items-center space-x-2"><Check size={12} className="text-resort-500" /><span>Free cancellation up to 48 hours before</span></p>
                <p className="flex items-center space-x-2"><Check size={12} className="text-resort-500" /><span>Complimentary airport transfers</span></p>
                <p className="flex items-center space-x-2"><Check size={12} className="text-resort-500" /><span>Daily breakfast included</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
