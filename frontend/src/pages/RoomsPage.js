import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Users, Maximize, BedDouble, Layers } from 'lucide-react';
import { roomService } from '../services/api';

function RoomTypeCard({ type }) {
  return (
    <Link to={`/rooms/${type.slug}`} className="card-luxury overflow-hidden group block">
      <div className="aspect-[16/10] overflow-hidden relative">
        <img
          src={type.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600'}
          alt={type.categoryName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="badge-green">{type.categoryName}</span>
        </div>
        {type.avgRating > 0 && (
          <div className="absolute top-4 right-4 bg-white flex items-center space-x-1 px-2 py-1 shadow">
            <Star size={12} className="text-gold-500 fill-gold-500" />
            <span className="text-xs font-semibold">{type.avgRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({type.reviewCount})</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-gray-900 mb-2 group-hover:text-resort-700 transition-colors">{type.categoryName}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{type.shortDescription || type.description}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
          <span className="flex items-center space-x-1"><Users size={12} /><span>Up to {type.capacity} Guests</span></span>
          <span className="flex items-center space-x-1"><BedDouble size={12} /><span>{type.bedType}</span></span>
          {type.size && <span className="flex items-center space-x-1"><Maximize size={12} /><span>{type.size}m²</span></span>}
          <span className="flex items-center space-x-1 text-resort-600 font-medium"><Layers size={12} /><span>{type.totalRooms} Rooms Available</span></span>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {type.amenities?.slice(0, 4).map(a => (
            <span key={a} className="text-xs bg-gray-50 text-gray-500 px-2 py-1">{a}</span>
          ))}
          {type.amenities?.length > 4 && <span className="text-xs text-resort-600">+{type.amenities.length - 4}</span>}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <span className="text-2xl font-display font-bold text-resort-700">₹{type.pricePerNight}</span>
            <span className="text-xs text-gray-400 ml-1">per night</span>
          </div>
          <span className="btn-primary text-xs py-2 px-4">Book Now</span>
        </div>
      </div>
    </Link>
  );
}

export default function RoomsPage() {
  const [searchParams] = useSearchParams();
  const [capacityFilter, setCapacityFilter] = useState(searchParams.get('capacity') || '');

  const { data, isLoading } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: roomService.getTypes,
  });

  const roomTypes = data?.data?.data || [];
  const filtered = capacityFilter
    ? roomTypes.filter(t => String(t.capacity) === String(capacityFilter))
    : roomTypes;

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="bg-forest-dark py-20 text-center text-white">
        <p className="text-resort-400 text-xs tracking-widest uppercase mb-3">Accommodations</p>
        <h1 className="font-display text-5xl font-bold mb-4">Rooms & Suites</h1>
        <p className="text-gray-300 max-w-xl mx-auto">Each room is a private sanctuary thoughtfully designed for the discerning traveller.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter bar */}
        <div className="bg-white shadow-resort p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <span className="text-sm text-gray-500 font-medium">Guests:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCapacityFilter('')}
              className={`input-field md:w-auto px-4 ${capacityFilter === '' ? 'border-resort-500 text-resort-700 font-semibold' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setCapacityFilter('2')}
              className={`input-field md:w-auto px-4 ${capacityFilter === '2' ? 'border-resort-500 text-resort-700 font-semibold' : ''}`}
            >
              2 Guests
            </button>
            <button
              onClick={() => setCapacityFilter('3')}
              className={`input-field md:w-auto px-4 ${capacityFilter === '3' ? 'border-resort-500 text-resort-700 font-semibold' : ''}`}
            >
              3 Guests
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 w-3/4" />
                  <div className="h-4 bg-gray-200 w-full" />
                  <div className="h-4 bg-gray-200 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No room types found matching your criteria</p>
            <button onClick={() => setCapacityFilter('')} className="btn-outline">Clear Filter</button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">{filtered.length} room type{filtered.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filtered.map(type => <RoomTypeCard key={type.categoryId} type={type} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
