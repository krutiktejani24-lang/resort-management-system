import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, X, Check, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { roomService } from '../../services/api';

const defaultRoom = { name: '', description: '', shortDescription: '', categoryId: '', pricePerNight: '', capacity: 2, bedType: 'King', size: '', floor: '', roomNumber: '', amenities: [], images: [], featured: false, status: 'AVAILABLE' };

function RoomModal({ room, categories, onClose }) {
  const [form, setForm] = useState(room || defaultRoom);
  const [amenityInput, setAmenityInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => room?.id ? roomService.update(room.id, data) : roomService.create(data),
    onSuccess: () => { toast.success(room?.id ? 'Room updated!' : 'Room created!'); qc.invalidateQueries(['adminRooms']); onClose(); },
    onError: err => toast.error(err.response?.data?.error || 'Failed'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data) => roomService.createCategory(data),
    onSuccess: (res) => {
      const newCategory = res.data?.data;
      toast.success('Category added!');
      qc.invalidateQueries(['roomCategories']);
      if (newCategory?.id) setForm(f => ({ ...f, categoryId: newCategory.id }));
      setNewCategoryName('');
      setShowNewCategory(false);
    },
    onError: err => toast.error(err.response?.data?.error || 'Failed to add category'),
  });

  const addAmenity = () => { if (amenityInput.trim()) { setForm(f => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] })); setAmenityInput(''); } };
  const removeAmenity = (i) => setForm(f => ({ ...f, amenities: f.amenities.filter((_, idx) => idx !== i) }));
  const addImage = () => { if (imageInput.trim()) { setForm(f => ({ ...f, images: [...f.images, imageInput.trim()] })); setImageInput(''); } };
  const removeImage = (i) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-3xl w-full my-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-display text-xl font-semibold">{room?.id ? 'Edit Room' : 'Add New Room'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label-field">Room Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required /></div>
            <div><label className="label-field">Room Number *</label><input value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} className="input-field" /></div>
            <div><label className="label-field">Category *</label>
              <div className="flex gap-2">
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input-field flex-1">
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowNewCategory(s => !s)} className="btn-outline px-3 text-xs whitespace-nowrap">
                  {showNewCategory ? 'Cancel' : '+ New'}
                </button>
              </div>
              {showNewCategory && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newCategoryName.trim() && createCategoryMutation.mutate({ name: newCategoryName.trim() }))}
                    placeholder="New category name…"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => newCategoryName.trim() && createCategoryMutation.mutate({ name: newCategoryName.trim() })}
                    disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                    className="btn-primary py-2 px-4 text-xs disabled:opacity-50"
                  >
                    {createCategoryMutation.isPending ? 'Adding…' : 'Add'}
                  </button>
                </div>
              )}
            </div>
            <div><label className="label-field">Price / Night (₹)</label><input type="number" value={form.pricePerNight} onChange={e => setForm(f => ({ ...f, pricePerNight: e.target.value }))} className="input-field" /></div>
            <div><label className="label-field">Capacity (guests)</label><input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="input-field" /></div>
            <div><label className="label-field">Bed Type</label>
              <select value={form.bedType} onChange={e => setForm(f => ({ ...f, bedType: e.target.value }))} className="input-field">
                {['King', 'Queen', '2 Queens', 'Twin', 'Master King + 2 Queens'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div><label className="label-field">Size (m²)</label><input type="number" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className="input-field" /></div>
            <div><label className="label-field">Floor</label><input type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} className="input-field" /></div>
            <div><label className="label-field">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field">
                {['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label-field">Short Description</label><input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} className="input-field" /></div>
          <div><label className="label-field">Full Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" /></div>

          {/* Amenities */}
          <div>
            <label className="label-field">Amenities</label>
            <div className="flex gap-2 mb-2">
              <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())} placeholder="Add amenity…" className="input-field flex-1" />
              <button onClick={addAmenity} className="btn-primary py-2 px-4 text-xs">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.amenities.map((a, i) => (
                <span key={i} className="badge-green flex items-center space-x-1">
                  <span>{a}</span>
                  <button onClick={() => removeAmenity(i)}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="label-field">Image URLs</label>
            <div className="flex gap-2 mb-2">
              <input value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="https://..." className="input-field flex-1" />
              <button onClick={addImage} className="btn-primary py-2 px-4 text-xs">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative w-16 h-12 overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-resort-600" />
            <label htmlFor="featured" className="text-sm text-gray-700">Feature on homepage</label>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="btn-outline py-3 flex-1">Cancel</button>
          <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary py-3 flex-1 disabled:opacity-50">
            {mutation.isPending ? 'Saving…' : 'Save Room'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRooms() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const qc = useQueryClient();

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['adminRooms', search],
    queryFn: () => roomService.getAll({ search, limit: 50 }),
  });
  const { data: catData } = useQuery({ queryKey: ['roomCategories'], queryFn: roomService.getCategories });

  const rooms = roomsData?.data?.data || [];
  const categories = catData?.data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: roomService.delete,
    onSuccess: () => { toast.success('Room deleted'); qc.invalidateQueries(['adminRooms']); },
    onError: () => toast.error('Failed to delete'),
  });

  const statusColor = { AVAILABLE: 'badge-green', OCCUPIED: 'badge bg-blue-50 text-blue-700', MAINTENANCE: 'badge-red', RESERVED: 'badge-gold' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-sm text-gray-400 mt-1">{rooms.length} rooms total</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center space-x-2">
          <Plus size={14} /> <span>Add Room</span>
        </button>
      </div>

      <div className="bg-white shadow-resort p-4 mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rooms…" className="input-field pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white shadow-resort overflow-hidden">
          <table className="w-full table-resort">
            <thead><tr><th>Room</th><th>Category</th><th>Price</th><th>Capacity</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-9 overflow-hidden flex-shrink-0 bg-gray-100">
                        {room.images?.[0] ? <img src={room.images[0]} alt="" className="w-full h-full object-cover" /> : <Image size={16} className="text-gray-300 m-auto mt-1.5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{room.name}</p>
                        <p className="text-xs text-gray-400">#{room.roomNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-500">{room.category?.name}</td>
                  <td className="font-medium text-resort-700">₹{room.pricePerNight}</td>
                  <td className="text-gray-500">{room.capacity} guests</td>
                  <td><span className={statusColor[room.status] || 'badge-gray'}>{room.status}</span></td>
                  <td>{room.featured && <Check size={14} className="text-resort-600" />}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setModal(room)} className="text-gray-400 hover:text-resort-600 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => { if (window.confirm('Delete room?')) deleteMutation.mutate(room.id); }} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && <RoomModal room={modal?.id ? modal : null} categories={categories} onClose={() => setModal(null)} />}
    </div>
  );
}
