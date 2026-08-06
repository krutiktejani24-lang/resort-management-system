      import React, { useState } from 'react';
      import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
      import { Calendar, Bed, DollarSign, Clock, X, Star } from 'lucide-react';
      import { format } from 'date-fns';
      import toast from 'react-hot-toast';
      import { bookingService, reviewService } from '../../services/api';
      import { useAuthStore } from '../../store/authStore';
      import api from '../../services/api';

      function StatusBadge({ status }) {
        const map = {
          PENDING: 'badge-gray', CONFIRMED: 'badge-green',
          CHECKED_IN: 'badge bg-blue-50 text-blue-700',
          CHECKED_OUT: 'badge bg-purple-50 text-purple-700',
          CANCELLED: 'badge-red',
        };
        return <span className={map[status] || 'badge-gray'}>{status?.replace('_', ' ')}</span>;
      }

      function ReviewModal({ booking, onClose }) {
        const [rating, setRating] = useState(5);
        const [comment, setComment] = useState('');
        const [hover, setHover] = useState(0);
        const queryClient = useQueryClient();

        const submitReview = useMutation({
          mutationFn: () => reviewService.create({ roomId: booking.room.id, rating, comment }),
          onSuccess: () => {
            toast.success('Review submitted for approval!');
            queryClient.invalidateQueries(['myBookings']);
            onClose();
          },
          onError: () => toast.error('Failed to submit review'),
        });

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-semibold">Rate Your Stay</h3>
                <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-6">{booking.room?.name}</p>
              <div className="mb-6">
                <label className="label-field mb-2">Your Rating</label>
                <div className="flex space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)}>
                      <Star size={28} className={i <= (hover || rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-300 fill-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="label-field">Your Review</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} className="input-field resize-none" placeholder="Share your experience…" />
              </div>
              <button onClick={() => submitReview.mutate()} disabled={!comment || submitReview.isPending} className="btn-primary w-full py-3 disabled:opacity-50">
                {submitReview.isPending ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        );
      }

      export function MyBookingsPage() {
        const [status, setStatus] = useState('');
        const [reviewBooking, setReviewBooking] = useState(null);
        const queryClient = useQueryClient();

        const { data, isLoading } = useQuery({
          queryKey: ['myBookings', status],
          queryFn: () => bookingService.getMy({ status, limit: 20 }),
        });

        const cancelMutation = useMutation({
          mutationFn: (id) => bookingService.cancel(id),
          onSuccess: () => { toast.success('Booking cancelled'); queryClient.invalidateQueries(['myBookings']); },
          onError: () => toast.error('Failed to cancel booking'),
        });

        const bookings = data?.data?.data || [];

        return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 pt-36 pb-16">
            <div className="mb-8">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
        My Bookings
      </h1>

      <p className="text-gray-400">
        Manage and track your reservations at Mango Tree
      </p>
    </div>

            {/* Status filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[['', 'All'], ['PENDING', 'Pending'], ['CONFIRMED', 'Confirmed'], ['CHECKED_IN', 'Active'], ['CHECKED_OUT', 'Completed'], ['CANCELLED', 'Cancelled']].map(([val, label]) => (
                <button key={val} onClick={() => setStatus(val)}
                  className={`px-4 py-2 text-xs font-medium tracking-widest uppercase transition-all ${status === val ? 'bg-resort-600 text-white' : 'border border-gray-200 text-gray-500 hover:border-resort-400'}`}>
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 animate-pulse" />)}</div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg py-20 text-center">
                <Calendar size={40} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-32 aspect-video md:aspect-square overflow-hidden flex-shrink-0">
                        <img src={booking.room?.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200'} alt="" className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display text-lg font-semibold text-gray-900">{booking.room?.name}</h3>
                            <p className="text-xs text-gray-400">Booking #{booking.bookingNumber}</p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Check In</p>
                            <p className="font-medium text-gray-700">{format(new Date(booking.checkIn), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Check Out</p>
                            <p className="font-medium text-gray-700">{format(new Date(booking.checkOut), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Nights</p>
                            <p className="font-medium text-gray-700">{booking.totalNights}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-xl font-bold text-green-700">₹{Number(booking.finalAmount || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                        {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                          <button onClick={() => { if (window.confirm('Cancel this booking?')) cancelMutation.mutate(booking.id); }}
                            className="text-xs border border-red-200 text-red-600 px-4 py-2 hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        )}
                        {booking.status === 'CHECKED_OUT' && (
                          <button onClick={() => setReviewBooking(booking)} className="text-xs btn-outline py-2 px-4">
                            Rate Stay
                          </button>
                        )}
                        {booking.invoicePdfUrl && (
  <button
    onClick={() => {
      const url = booking.invoicePdfUrl.startsWith("http")
        ? booking.invoicePdfUrl
        : `http://localhost:8000${booking.invoicePdfUrl}`;

      window.open(url, "_blank");
    }}
    className="text-xs bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
  >
    Download Invoice
  </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reviewBooking && <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} />}
          </div>
        </div>
        );
      }

      export function ProfilePage() {
        const { user, updateUser } = useAuthStore();
        const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
        const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
        const [saving, setSaving] = useState(false);

        const handleProfile = async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await api.put('/auth/profile', form);
            updateUser(form);
            toast.success('Profile updated!');
          } catch { toast.error('Update failed'); }
          finally { setSaving(false); }
        };

        const handlePassword = async (e) => {
          e.preventDefault();
          if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
          try {
            await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success('Password changed!');
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
          } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
        };

        return (
          <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
            <div className="bg-white shadow-resort p-8 mb-6">
              <h2 className="font-display text-xl font-semibold mb-6">Personal Information</h2>
              <form onSubmit={handleProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label-field">First Name</label><input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input-field" /></div>
                  <div><label className="label-field">Last Name</label><input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input-field" /></div>
                </div>
                <div><label className="label-field">Email</label><input value={user?.email} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" /></div>
                <div><label className="label-field">Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" /></div>
                <button type="submit" disabled={saving} className="btn-primary py-3 disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button>
              </form>
            </div>
            <div className="bg-white shadow-resort p-8">
              <h2 className="font-display text-xl font-semibold mb-6">Change Password</h2>
              <form onSubmit={handlePassword} className="space-y-4">
                <div><label className="label-field">Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} className="input-field" required /></div>
                <div><label className="label-field">New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} className="input-field" required minLength={8} /></div>
                <div><label className="label-field">Confirm Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className="input-field" required /></div>
                <button type="submit" className="btn-primary py-3">Update Password</button>
              </form>
            </div>
          </div>
        );
      }

      export default MyBookingsPage;
