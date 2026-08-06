import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { leadService } from '../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in required fields'); return; }
    setSending(true);
    try {
      await leadService.create({ ...form, source: 'contact_form' });
      setSent(true);
      toast.success('Message sent! We\'ll respond within 24 hours.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const info = [
    { icon: MapPin, label: 'Address', value: 'next to VIMS hospital, Parnera Pardi, Valsad, Gujarat 396007' },
    { icon: Phone, label: 'Phone', value: '+91 9949948904', href: 'tel:+1800MANGOTREE' },
    { icon: Mail, label: 'Email', value: 'mangotree9949@gmail.com', href: 'mailto:mangotree9949@gmail.com' },
    { icon: Clock, label: 'Concierge', value: '24 hours, 7 days a week' },
  ];

  return (
    <div className="pt-20 bg-white">
      {/* Header */}
      <div className="bg-forest-dark py-20 text-center text-white">
        <p className="text-resort-400 text-xs tracking-widest uppercase mb-3">Get in Touch</p>
        <h1 className="font-display text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-300 max-w-xl mx-auto">Our concierge team is available around the clock to assist with every aspect of your stay.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Info */}
          <div className="lg:col-span-2">
            <p className="section-subtitle">Reach Us</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-6">We're Here for You</h2>
            <p className="text-gray-500 mb-10 leading-relaxed">Whether you're planning your first visit or you're a returning guest, our dedicated team is ready to make your experience extraordinary.</p>

            <div className="space-y-6">
              {info.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-resort-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-resort-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    {href
                      ? <a href={href} className="text-gray-700 font-medium hover:text-resort-600 transition-colors">{value}</a>
                      : <p className="text-gray-700 font-medium">{value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-resort-50 border-l-4 border-resort-500">
              <p className="font-display text-lg font-semibold text-gray-900 mb-2">Special Requests?</p>
              <p className="text-sm text-gray-600 leading-relaxed">For bespoke experiences — private dining, proposal arrangements, spa packages, or special occasions — contact our dedicated Experiences team.</p>
              <a href="mailto:experiences@mangotreeresort.com" className="text-resort-600 text-sm font-medium mt-3 inline-block hover:underline">experiences@mangotreeresort.com</a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-resort-50 p-16 text-center">
                <div className="w-20 h-20 bg-resort-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={32} className="text-resort-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Message Received!</h3>
                <p className="text-gray-500 mb-6">Thank you for reaching out. Our concierge team will respond within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn-primary">Send Another Message</button>
              </div>
            ) : (
              <div className="bg-white shadow-resort p-8">
                <h3 className="font-display text-2xl font-semibold text-gray-900 mb-6">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="label-field">Full Name *</label>
                      <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Your full name" required />
                    </div>
                    <div>
                      <label className="label-field">Email Address *</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="label-field">Phone Number</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+1 (000) 000-0000" />
                    </div>
                    <div>
                      <label className="label-field">Subject</label>
                      <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field">
                        <option value="">Select a topic</option>
                        <option value="Reservation Inquiry">Reservation Inquiry</option>
                        <option value="Special Occasion">Special Occasion Planning</option>
                        <option value="Spa & Wellness">Spa & Wellness</option>
                        <option value="Dining Reservation">Dining Reservation</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Feedback">Feedback</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label-field">Message *</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={6} className="input-field resize-none" placeholder="How can we assist you?" required />
                  </div>
                  <button type="submit" disabled={sending} className="btn-primary w-full py-4 flex items-center justify-center space-x-2 disabled:opacity-50">
                    <Send size={14} />
                    <span>{sending ? 'Sending…' : 'Send Message'}</span>
                  </button>
                  <p className="text-xs text-gray-400 text-center">Your information is kept confidential and never shared with third parties.</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
