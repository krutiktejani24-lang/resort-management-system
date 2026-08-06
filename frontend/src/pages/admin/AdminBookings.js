import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronDown, Check, X, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bookingService, userService, leadService, galleryService, blogService } from '../../services/api';

// ---- BOOKINGS ----
export function AdminBookings() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminBookings', search, status, page],
    queryFn: () => bookingService.getAll({ search, status, page, limit: 20 }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => bookingService.updateStatus(id, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['adminBookings']); },
  });

  const bookings = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  const statusColors = { PENDING: 'badge-gray', CONFIRMED: 'badge-green', CHECKED_IN: 'badge bg-blue-50 text-blue-700', CHECKED_OUT: 'badge bg-purple-50 text-purple-700', CANCELLED: 'badge-red' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Bookings</h1><p className="text-sm text-gray-400 mt-1">{pagination.total || 0} total bookings</p></div>
      </div>
      <div className="bg-white shadow-resort p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, booking #…" className="input-field pl-9" /></div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field md:w-44">
          <option value="">All Statuses</option>
          {['PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="bg-white shadow-resort overflow-x-auto">
        {isLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-resort-200 border-t-resort-600 rounded-full animate-spin" /></div> : (
          <table className="w-full table-resort">
            <thead><tr><th>Booking #</th><th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="font-mono text-xs text-resort-600">{b.bookingNumber}</td>
                  <td><div><p className="font-medium text-sm">{b.guestName}</p><p className="text-xs text-gray-400">{b.guestEmail}</p></div></td>
                  <td className="text-gray-600 text-sm">{b.room?.name}</td>
                  <td className="text-gray-600 text-sm">{format(new Date(b.checkIn), 'MMM d, yyyy')}</td>
                  <td className="text-gray-600 text-sm">{format(new Date(b.checkOut), 'MMM d, yyyy')}</td>
                  <td className="font-semibold text-resort-700">₹{Number(b.finalAmount ?? 0).toFixed(2)}</td>
                  <td><span className={statusColors[b.status] || 'badge-gray'}>{b.status}</span></td>
                  <td><span className={b.paymentStatus === 'PAID' ? 'badge-green' : 'badge-gray'}>{b.paymentStatus}</span></td>
                  <td>
                    <select value={b.status} onChange={e => updateStatus.mutate({ id: b.id, status: e.target.value })} className="text-xs border border-gray-200 p-1 focus:outline-none focus:border-resort-400">
                      {['PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={`w-9 h-9 text-sm ${page===i+1 ? 'bg-resort-600 text-white' : 'border border-gray-200 text-gray-600'}`}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- CUSTOMERS ----
export function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['adminCustomers', search, page],
    queryFn: () => userService.getAll({ search, role: 'CUSTOMER', page, limit: 20 }),
  });
  const users = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div>
      <div className="mb-8"><h1 className="font-display text-2xl font-bold text-gray-900">Customers</h1><p className="text-sm text-gray-400 mt-1">{pagination.total || 0} registered guests</p></div>
      <div className="bg-white shadow-resort p-4 mb-6">
        <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…" className="input-field pl-9" /></div>
      </div>
      <div className="bg-white shadow-resort overflow-x-auto">
        {isLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-resort-200 border-t-resort-600 rounded-full animate-spin" /></div> : (
          <table className="w-full table-resort">
            <thead><tr><th>Guest</th><th>Email</th><th>Phone</th><th>Bookings</th><th>Since</th><th>Status</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-resort-100 flex items-center justify-center text-resort-700 text-xs font-medium">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                      <span className="font-medium">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="text-gray-500 text-sm">{u.email}</td>
                  <td className="text-gray-500 text-sm">{u.phone || '—'}</td>
                  <td className="font-medium text-resort-700">{u._count?.bookings || 0}</td>
                  <td className="text-gray-500 text-sm">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                  <td><span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(pagination.pages)].map((_, i) => <button key={i} onClick={() => setPage(i+1)} className={`w-9 h-9 text-sm ${page===i+1?'bg-resort-600 text-white':'border border-gray-200 text-gray-600'}`}>{i+1}</button>)}
        </div>
      )}
    </div>
  );
}

// ---- LEADS ----
export function AdminLeads() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminLeads', search, statusFilter],
    queryFn: () => leadService.getAll({ search, status: statusFilter, limit: 50 }),
  });

  const updateLead = useMutation({
    mutationFn: ({ id, data }) => leadService.update(id, data),
    onSuccess: () => { toast.success('Lead updated'); qc.invalidateQueries(['adminLeads']); },
  });

  const leads = data?.data?.data || [];
  const statusColors = {
  NEW: 'badge-green',
  CONTACTED: 'badge-gold',
  FOLLOW_UP: 'badge bg-blue-50 text-blue-700',
  CONVERTED: 'badge-purple',
  CLOSED: 'badge-gray',
};
  const statusOptions = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'];

  return (
    <div>
      <div className="mb-8"><h1 className="font-display text-2xl font-bold text-gray-900">CRM Leads</h1><p className="text-sm text-gray-400 mt-1">{leads.length} leads</p></div>
      <div className="bg-white shadow-resort p-4 mb-6 flex gap-4">
        <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…" className="input-field pl-9" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field md:w-40">
          <option value="">All</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div className="bg-white shadow-resort overflow-x-auto">
        {isLoading ? <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-resort-200 border-t-resort-600 rounded-full animate-spin" /></div> : (
          <table className="w-full table-resort">
            <thead><tr><th>Contact</th><th>Subject</th><th>Source</th><th>Message</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td><div><p className="font-medium text-sm">{lead.name}</p><p className="text-xs text-gray-400">{lead.email}</p>{lead.phone && <p className="text-xs text-gray-400">{lead.phone}</p>}</div></td>
                  <td className="text-gray-600 text-sm">{lead.subject || '—'}</td>
                  <td><span className="badge-gray text-xs">{lead.source}</span></td>
                  <td className="max-w-xs"><p className="text-sm text-gray-500 truncate">{lead.message}</p></td>
                  <td className="text-gray-500 text-sm">{format(new Date(lead.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={e => updateLead.mutate({ id: lead.id, data: { status: e.target.value } })}
                      className={`text-xs border-0 p-1 focus:outline-none ${statusColors[lead.status] || 'badge-gray'}`}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ---- GALLERY ----
export function AdminGallery() {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', url: '', category: 'resort', type: 'image', featured: false });
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ['adminGallery'], queryFn: () => galleryService.getAll({}) });
  const items = data?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (d) => modal?.id ? galleryService.update(modal.id, d) : galleryService.create(d),
    onSuccess: () => { toast.success('Saved!'); qc.invalidateQueries(['adminGallery']); setModal(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: galleryService.delete,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['adminGallery']); },
  });

  const openModal = (item = null) => { setModal(item || {}); setForm(item || { title: '', url: '', category: 'resort', type: 'image', featured: false }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Gallery Management</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center space-x-2"><Plus size={14} /><span>Add Item</span></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="relative group overflow-hidden bg-gray-100">
            <img src={item.url} alt={item.title} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
              <p className="text-white text-sm font-medium text-center px-2">{item.title}</p>
              <div className="flex space-x-2">
                <button onClick={() => openModal(item)} className="w-8 h-8 bg-white flex items-center justify-center"><Edit size={13} className="text-gray-700" /></button>
                <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(item.id); }} className="w-8 h-8 bg-white flex items-center justify-center"><Trash2 size={13} className="text-red-500" /></button>
              </div>
            </div>
            {item.featured && <div className="absolute top-2 left-2 badge-gold text-xs">Featured</div>}
          </div>
        ))}
      </div>
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6"><h3 className="font-display text-xl font-semibold">{modal?.id ? 'Edit' : 'Add'} Gallery Item</h3><button onClick={() => setModal(null)}><X size={18} /></button></div>
            <div className="space-y-4">
              <div><label className="label-field">Title</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input-field" /></div>
              <div><label className="label-field">URL</label><input value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} className="input-field" placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-field">Category</label><select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-field">
                  {['pool','resort','spa','dining','beach','rooms','activities'].map(c => <option key={c}>{c}</option>)}
                </select></div>
                <div><label className="label-field">Type</label><select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="input-field">
                  <option>image</option><option>video</option>
                </select></div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} className="w-4 h-4 accent-resort-600" />
                <label className="text-sm text-gray-700">Featured</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="btn-outline py-3 flex-1">Cancel</button>
              <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary py-3 flex-1">{mutation.isPending ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- BLOG ----
export function AdminBlog() {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', author: '', tags: [], coverImage: '', isPublished: false });
  const [tagInput, setTagInput] = useState('');
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ['adminBlog'], queryFn: () => blogService.getAll({ published: 'all', limit: 50 }) });
  const posts = data?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (d) => modal?.id ? blogService.update(modal.id, d) : blogService.create(d),
    onSuccess: () => { toast.success('Saved!'); qc.invalidateQueries(['adminBlog']); setModal(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: blogService.delete,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['adminBlog']); },
  });

  const openModal = (post = null) => {
    setModal(post || {});
    setForm(post ? { ...post } : { title: '', excerpt: '', content: '', author: '', tags: [], coverImage: '', isPublished: false });
  };
  const addTag = () => { if (tagInput.trim()) { setForm(f => ({...f, tags: [...f.tags, tagInput.trim()]})); setTagInput(''); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Blog Management</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center space-x-2"><Plus size={14} /><span>New Post</span></button>
      </div>
      <div className="bg-white shadow-resort overflow-hidden">
        <table className="w-full table-resort">
          <thead><tr><th>Title</th><th>Author</th><th>Tags</th><th>Views</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td><p className="font-medium text-sm text-gray-900 max-w-xs truncate">{post.title}</p></td>
                <td className="text-gray-500 text-sm">{post.author}</td>
                <td><div className="flex flex-wrap gap-1">{post.tags?.slice(0,2).map(t => <span key={t} className="badge-gray text-xs">{t}</span>)}</div></td>
                <td className="text-gray-500 text-sm">{post.views}</td>
                <td><span className={post.isPublished ? 'badge-green' : 'badge-gray'}>{post.isPublished ? 'Published' : 'Draft'}</span></td>
                <td className="text-gray-500 text-sm">{format(new Date(post.createdAt), 'MMM d, yyyy')}</td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => openModal(post)} className="text-gray-400 hover:text-resort-600"><Edit size={14} /></button>
                    <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(post.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-display text-xl font-semibold">{modal?.id ? 'Edit' : 'New'} Blog Post</h3>
              <button onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="label-field">Title</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-field">Author</label><input value={form.author} onChange={e => setForm(f => ({...f, author: e.target.value}))} className="input-field" /></div>
                <div><label className="label-field">Cover Image URL</label><input value={form.coverImage} onChange={e => setForm(f => ({...f, coverImage: e.target.value}))} className="input-field" /></div>
              </div>
              <div><label className="label-field">Excerpt</label><textarea value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt: e.target.value}))} rows={2} className="input-field resize-none" /></div>
              <div><label className="label-field">Content (HTML)</label><textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} rows={8} className="input-field resize-none font-mono text-xs" /></div>
              <div>
                <label className="label-field">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addTag())} placeholder="Add tag…" className="input-field flex-1" />
                  <button onClick={addTag} className="btn-primary py-2 px-4 text-xs">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags?.map((t, i) => <span key={i} className="badge-green flex items-center space-x-1"><span>{t}</span><button onClick={() => setForm(f => ({...f, tags: f.tags.filter((_,j) => j!==i)}))}><X size={10} /></button></span>)}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="published" checked={form.isPublished} onChange={e => setForm(f => ({...f, isPublished: e.target.checked}))} className="w-4 h-4 accent-resort-600" />
                <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="btn-outline py-3 flex-1">Cancel</button>
              <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary py-3 flex-1">{mutation.isPending ? 'Saving…' : 'Save Post'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
