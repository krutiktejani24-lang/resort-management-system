import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Star, Play, ArrowRight, Waves, Utensils, Dumbbell, Leaf } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { roomService } from '../services/api';

// Hero Video Section
function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn.toISOString().split('T')[0]);
    if (checkOut) params.set('checkOut', checkOut.toISOString().split('T')[0]);
    params.set('capacity', guests);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background: Video or fallback image */}
      <div className="absolute inset-0">
        <video
          autoPlay muted loop playsInline
          onCanPlay={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          poster="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
        >
          <source src="https://www.w3schools.com/howto/rain.mp4" type="video/mp4" />
        </video>
        {/* Fallback image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')", opacity: videoLoaded ? 0 : 1 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-hero-gradient" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4 hero-text-shadow">
        <div className="animate-fade-up">
          <p className="text-resort-300 text-sm font-medium tracking-widest uppercase mb-4">
            ✦ Welcome to Paradise ✦
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-6">
            Where Luxury
            <span className="block text-resort-gradient" style={{ WebkitTextStroke: '0px', WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg, #4ade80, #86efac)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
              Meets Nature
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-accent italic leading-relaxed mb-10">
            Immerse yourself in an unparalleled sanctuary where every moment is crafted for transcendence.
            Experience the pinnacle of tropical elegance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/rooms" className="btn-primary text-sm px-10 py-4">
              Explore Rooms
            </Link>
            <button className="flex items-center space-x-3 text-white hover:text-resort-300 transition-colors group">
              <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-forest-dark transition-all">
                <Play size={16} className="ml-0.5" />
              </div>
              <span className="text-sm font-medium">Watch Resort Film</span>
            </button>
          </div>
        </div>
      </div>

      {/* Booking Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <div className="bg-white shadow-resort-lg grid grid-cols-1 md:grid-cols-4 gap-0">
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
              <label className="label-field">Check In</label>
              <DatePicker
                selected={checkIn}
                onChange={setCheckIn}
                minDate={new Date()}
                placeholderText="Select date"
                className="text-gray-800 text-sm font-medium w-full outline-none"
              />
            </div>
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
              <label className="label-field">Check Out</label>
              <DatePicker
                selected={checkOut}
                onChange={setCheckOut}
                minDate={checkIn || new Date()}
                placeholderText="Select date"
                className="text-gray-800 text-sm font-medium w-full outline-none"
              />
            </div>
            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">
              <label className="label-field">Guests</label>
              <select
                value={guests}
                onChange={e => setGuests(e.target.value)}
                className="text-gray-800 text-sm font-medium w-full outline-none bg-transparent"
              >
                {[2,3].map(n => <option key={n} value={n}>{n} Guests</option>)}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-resort-gradient text-white font-medium tracking-widest text-sm uppercase p-5 hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
            >
              <span>Check Availability</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-36 right-8 hidden lg:flex flex-col items-center space-y-2 text-white">
        <div className="w-px h-16 bg-white opacity-40 animate-pulse" />
        <span className="text-xs tracking-widest uppercase opacity-60" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
      </div>
    </section>
  );
}

// Stats Bar
function StatsBar() {
  const stats = [
    { value: '200+', label: 'Luxury Rooms' },
    { value: '5★', label: 'Forbes Rating' },
    { value: '15', label: 'Restaurants' },
    { value: '98%', label: 'Guest Satisfaction' },
  ];
  return (
    <div className="bg-forest-dark py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-resort-400 tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Featured Rooms Slider
function FeaturedRooms() {
  const { data } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: roomService.getTypes
  });
  const rooms = data?.data?.data || [];

  if (!rooms.length) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="section-subtitle">Accommodations</p>
          <h2 className="section-title mb-4">Rooms & Suites</h2>
          <div className="divider-gold mx-auto" />
          <p className="section-desc mx-auto mt-6">
            Each space is a private sanctuary, thoughtfully designed to harmonize natural beauty with modern comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {rooms.map((room) => (
            <Link key={room.categoryId} to={`/rooms/${room.slug}`} className="card-luxury overflow-hidden block">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={room.images?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600'}
                  alt={room.categoryName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="badge-green text-xs">{room.categoryName}</span>
                </div>
                {room.avgRating > 0 && (
                  <div className="absolute top-4 right-4 bg-white flex items-center space-x-1 px-2 py-1">
                    <Star size={12} className="text-gold-500 fill-gold-500" />
                    <span className="text-xs font-medium">{room.avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">{room.categoryName}</h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{room.shortDescription || room.description}</p>
                <p className="text-xs text-resort-600 font-medium mb-4">{room.totalRooms} Rooms Available</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div>
                    <span className="text-2xl font-display font-bold text-resort-700">₹{room.pricePerNight}</span>
                    <span className="text-xs text-gray-400 ml-1">/ night</span>
                  </div>
                  <span className="text-xs text-resort-600 font-medium uppercase tracking-wider group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/rooms" className="btn-outline">View All Rooms & Suites</Link>
        </div>
      </div>
    </section>
  );
}

// Amenities
function Amenities() {
  const amenities = [
    { icon: Waves, title: 'Infinity Pool', desc: 'Three heated pools overlooking the ocean horizon.' },
    { icon: Leaf, title: 'Spa & Wellness', desc: 'An 8,000 sq ft sanctuary of restorative treatments.' },
    { icon: Utensils, title: 'Fine Dining', desc: 'Five award-winning restaurants and bars.' },
    { icon: Dumbbell, title: 'Activities', desc: 'Water sports, yoga, diving, and curated experiences.' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-subtitle">Resort Life</p>
            <h2 className="section-title mb-6">A World of Experiences</h2>
            <div className="divider-green" />
            <p className="text-gray-600 leading-relaxed mb-10 text-lg">
              Beyond your private sanctuary awaits a resort where every facility is a destination in itself. From the misty morning yoga deck to the underwater dining experience — each moment at Mango Tree is a memory in the making.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {amenities.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-resort-50 flex items-center justify-center flex-shrink-0 group-hover:bg-resort-100 transition-colors">
                    <Icon size={20} className="text-resort-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/gallery" className="btn-primary inline-flex items-center space-x-2">
                <span>Explore Resort</span> <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700"
                alt="Mango Tree"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-6 shadow-resort-lg max-w-xs hidden md:block">
              <div className="flex items-center space-x-3 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-gold-500 fill-gold-500" />)}
              </div>
              <p className="text-sm text-gray-600 italic font-accent">"The most extraordinary place I've ever stayed. Absolute perfection."</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">— Victoria A., London</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials
function Testimonials() {
  const testimonials = [
    { name: 'Charlotte & James W.', origin: 'New York, USA', text: 'Our honeymoon at Mango Tree was absolute magic. The staff anticipated our every wish before we even knew to ask. We will return every anniversary.', rating: 5 },
    { name: 'Hiroshi T.', origin: 'Tokyo, Japan', text: 'Our Family Room exceeded my very high expectations. The culinary experience alone justifies the journey — Chef Marco is a genius.', rating: 5 },
    { name: 'Sophia & Marco R.', origin: 'Milan, Italy', text: 'True luxury is attention to detail, and Mango Tree has mastered it. From the pillow menu to the private beach butler, everything is extraordinary.', rating: 5 },
  ];
  const [current, setCurrent] = useState(0);

  return (
    <section className="py-24 bg-resort-gradient text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-resort-300 text-xs tracking-widest uppercase mb-4">Guest Stories</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">What Guests Say</h2>
        <div className="divider-gold mx-auto mb-16" />

        <div className="relative min-h-[200px]">
          {testimonials.map((t, i) => (
            <div key={i} className={`transition-all duration-500 ${i === current ? 'opacity-100' : 'absolute inset-0 opacity-0 pointer-events-none'}`}>
              <div className="flex justify-center mb-6">
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={20} className="text-gold-400 fill-gold-400" />)}
              </div>
              <p className="font-accent italic text-xl md:text-2xl text-gray-100 leading-relaxed mb-8">
                "{t.text}"
              </p>
              <div>
                <p className="font-semibold text-white">{t.name}</p>
                <p className="text-resort-300 text-sm">{t.origin}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center space-x-4 mt-8">
          <button onClick={() => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length)}
            className="w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ChevronLeft size={16} />
          </button>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/30'}`} />
          ))}
          <button onClick={() => setCurrent(c => (c + 1) % testimonials.length)}
            className="w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

// Image gallery strip
function GalleryStrip() {
  const images = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400',
  ];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="section-subtitle">Gallery</p>
          <h2 className="section-title text-3xl">A Glimpse of Paradise</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {images.map((img, i) => (
            <Link key={i} to="/gallery" className="aspect-square overflow-hidden group block">
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/gallery" className="btn-outline">View Full Gallery</Link>
        </div>
      </div>
    </section>
  );
}

// Blog preview
function BlogPreview() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="section-subtitle">Journal</p>
          <h2 className="section-title">Stories from Paradise</h2>
          <div className="divider-gold mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500', tag: 'Resort Life', title: 'The Art of Tropical Luxury', date: 'Jan 15, 2024', slug: 'art-of-tropical-luxury' },
            { img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500', tag: 'Activities', title: 'Top 10 Things To Do This Season', date: 'Jan 10, 2024', slug: 'top-10-things-to-do' },
            { img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500', tag: 'Dining', title: 'A Culinary Journey Through Our Restaurants', date: 'Jan 5, 2024', slug: 'culinary-journey-restaurants' },
          ].map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="card-luxury overflow-hidden group block">
              <div className="aspect-video overflow-hidden">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <span className="badge-green text-xs mb-3 inline-block">{post.tag}</span>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-2 group-hover:text-resort-700 transition-colors">{post.title}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/blog" className="btn-outline">Read All Stories</Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsBar />
      <FeaturedRooms />
      <Amenities />
      <Testimonials />
      <GalleryStrip />
      <BlogPreview />
      {/* CTA Banner */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="section-subtitle">Limited Availability</p>
          <h2 className="section-title mb-6">Begin Your Journey to Paradise</h2>
          <p className="section-desc mx-auto mb-10 text-gray-500">
            Reserve your sanctuary today and receive complimentary airport transfers, daily breakfast, and a welcome spa treatment.
          </p>
          <Link to="/rooms" className="btn-gold text-sm px-12 py-4 inline-block">
            Reserve Your Stay
          </Link>
        </div>
      </section>
    </div>
  );
}
