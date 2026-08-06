import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryService } from '../services/api';

const CATEGORIES = ['All', 'pool', 'resort', 'spa', 'dining', 'beach', 'rooms', 'activities'];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => galleryService.getAll({}),
  });

  const allItems = data?.data?.data || [];
  const filtered = allItems.filter(item => {
    const catMatch = activeCategory === 'All' || item.category === activeCategory;
    const typeMatch = activeType === 'All' || item.type === activeType.toLowerCase();
    return catMatch && typeMatch;
  });

  const openLightbox = (item, index) => setLightbox({ item, index, items: filtered });
  const closeLightbox = () => setLightbox(null);
  const prevItem = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.items.length) % l.items.length, item: l.items[(l.index - 1 + l.items.length) % l.items.length] }));
  const nextItem = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.items.length, item: l.items[(l.index + 1) % l.items.length] }));

  // Fallback gallery items if no data
  const fallbackItems = [
    { id: 1, title: 'Infinity Pool', category: 'pool', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
    { id: 2, title: 'Resort Exterior', category: 'resort', type: 'image', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    { id: 3, title: 'Spa Treatment', category: 'spa', type: 'image', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800' },
    { id: 4, title: 'Fine Dining', category: 'dining', type: 'image', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
    { id: 5, title: 'Beach Sunset', category: 'beach', type: 'image', url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800' },
    { id: 6, title: 'Luxury Suite', category: 'rooms', type: 'image', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800' },
    { id: 7, title: 'Water Sports', category: 'activities', type: 'image', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' },
    { id: 8, title: 'Garden Walk', category: 'resort', type: 'image', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800' },
    { id: 9, title: 'Pool Bar', category: 'pool', type: 'image', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800' },
    { id: 10, title: 'Ocean View Room', category: 'rooms', type: 'image', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' },
    { id: 11, title: 'Beach Cabana', category: 'beach', type: 'image', url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800' },
    { id: 12, title: 'Resort Garden', category: 'resort', type: 'image', url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800' },
  ];

  const displayItems = filtered.length > 0 ? filtered : fallbackItems.filter(item => {
    const catMatch = activeCategory === 'All' || item.category === activeCategory;
    const typeMatch = activeType === 'All' || item.type === activeType.toLowerCase();
    return catMatch && typeMatch;
  });

  return (
    <div className="pt-20 bg-white">
      {/* Header */}
      <div className="bg-forest-dark py-20 text-center text-white">
        <p className="text-resort-400 text-xs tracking-widest uppercase mb-3">Visual Journey</p>
        <h1 className="font-display text-5xl font-bold mb-4">Gallery</h1>
        <p className="text-gray-300 max-w-xl mx-auto">Explore the beauty of Mango Tree through our curated visual collection</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
          {/* Type tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1">
            {['All', 'Image', 'Video'].map(type => (
              <button key={type} onClick={() => setActiveType(type)}
                className={`px-5 py-2 text-sm font-medium transition-all ${activeType === type ? 'bg-resort-gradient text-white' : 'text-gray-600 hover:text-resort-600'}`}>
                {type}
              </button>
            ))}
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-medium tracking-widest uppercase transition-all ${activeCategory === cat ? 'bg-resort-600 text-white' : 'border border-gray-200 text-gray-500 hover:border-resort-400 hover:text-resort-600'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {displayItems.map((item, index) => (
              <div
                key={item.id}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden mb-3"
                onClick={() => openLightbox(item, index)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  {item.type === 'video' && (
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Play size={20} className="text-white ml-1" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <span className="text-xs text-white/70 capitalize">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayItems.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-400">No items found in this category.</div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white hover:text-resort-300 transition-colors z-10">
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevItem(); }}
            className="absolute left-4 md:left-8 text-white hover:text-resort-300 transition-colors z-10 w-10 h-10 flex items-center justify-center border border-white/20 hover:bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="max-w-4xl max-h-[80vh] px-16" onClick={e => e.stopPropagation()}>
            {lightbox.item.type === 'video' ? (
              <video src={lightbox.item.url} controls autoPlay className="max-h-[80vh] max-w-full mx-auto" />
            ) : (
              <img src={lightbox.item.url} alt={lightbox.item.title} className="max-h-[80vh] max-w-full mx-auto object-contain" />
            )}
            <div className="text-center mt-4">
              <p className="text-white font-medium">{lightbox.item.title}</p>
              <p className="text-gray-400 text-sm capitalize">{lightbox.item.category}</p>
              <p className="text-gray-500 text-xs mt-1">{lightbox.index + 1} / {lightbox.items.length}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); nextItem(); }}
            className="absolute right-4 md:right-8 text-white hover:text-resort-300 transition-colors z-10 w-10 h-10 flex items-center justify-center border border-white/20 hover:bg-white/10">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
