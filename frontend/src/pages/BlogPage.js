import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Eye, Tag, Search, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { blogService } from '../services/api';

export function BlogPage() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['blog', search, tag, page],
    queryFn: () => blogService.getAll({ search, tag, page, limit: 9 }),
  });

  const posts = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))];

  const fallbackPosts = [
    { id: 1, title: 'The Art of Tropical Luxury', slug: 'art-of-tropical-luxury', excerpt: 'Discover what sets Mango Tree Resort apart in the world of luxury hospitality.', coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', author: 'Sarah Mitchell', tags: ['luxury', 'resort'], views: 1240, createdAt: '2024-01-15' },
    { id: 2, title: 'Top 10 Things to Do at Mango Tree', slug: 'top-10-things-to-do', excerpt: 'From sunrise yoga on the beach to twilight cocktail cruises — must-do experiences.', coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', author: 'James Hartwell', tags: ['activities', 'tips'], views: 987, createdAt: '2024-01-10' },
    { id: 3, title: 'A Culinary Journey Through Our Restaurants', slug: 'culinary-journey-restaurants', excerpt: 'Explore the flavors of paradise across our five distinct dining experiences.', coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', author: 'Chef Marco', tags: ['dining', 'culinary'], views: 756, createdAt: '2024-01-05' },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;

  return (
    <>
      <Helmet>
        <title>Journal & Stories | Mango Tree Resort</title>
        <meta name="description" content="Stories, tips, and insights from Mango Tree destination wedding lawn and weekend stay." />
      </Helmet>
      <div className="pt-20 bg-white">
        <div className="bg-forest-dark py-20 text-center text-white">
          <p className="text-resort-400 text-xs tracking-widest uppercase mb-3">Stories & Insights</p>
          <h1 className="font-display text-5xl font-bold mb-4">The Mango Tree Journal</h1>
          <p className="text-gray-300 max-w-xl mx-auto">Curated stories, travel guides, and inspiration from paradise</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Search & Tags */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-9" />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTag('')} className={`badge ${tag === '' ? 'badge-green' : 'badge-gray'}`}>All</button>
                {allTags.map(t => (
                  <button key={t} onClick={() => setTag(t)} className={`badge ${tag === t ? 'badge-green' : 'badge-gray'}`}>{t}</button>
                ))}
              </div>
            )}
          </div>

          {/* Featured post */}
          {displayPosts[0] && (
            <Link to={`/blog/${displayPosts[0].slug}`} className="group block mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 card-luxury overflow-hidden">
                <div className="aspect-video lg:aspect-auto overflow-hidden">
                  <img src={displayPosts[0].coverImage} alt={displayPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-10 flex flex-col justify-center bg-white">
                  <div className="flex items-center space-x-2 mb-4">
                    {displayPosts[0].tags?.slice(0, 2).map(t => <span key={t} className="badge-green">{t}</span>)}
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Featured</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-resort-700 transition-colors">{displayPosts[0].title}</h2>
                  <p className="text-gray-500 mb-6 leading-relaxed">{displayPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1"><Calendar size={12} /><span>{format(new Date(displayPosts[0].createdAt), 'MMM d, yyyy')}</span></span>
                      <span>By {displayPosts[0].author}</span>
                    </div>
                    <span className="flex items-center space-x-1 text-resort-600 text-sm font-medium">Read More <ArrowRight size={14} className="ml-1" /></span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse h-72" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.slice(1).map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card-luxury overflow-hidden group block">
                  <div className="aspect-video overflow-hidden">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      {post.tags?.slice(0, 1).map(t => <span key={t} className="badge-green">{t}</span>)}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-gray-900 mb-2 group-hover:text-resort-700 transition-colors">{post.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                      <span className="flex items-center space-x-1"><Calendar size={11} /><span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span></span>
                      {post.views > 0 && <span className="flex items-center space-x-1"><Eye size={11} /><span>{post.views}</span></span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center mt-12 space-x-2">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 text-sm transition-all ${page === i + 1 ? 'bg-resort-600 text-white' : 'border border-gray-200 text-gray-600'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getBySlug(slug),
  });
  const post = data?.data?.data;

  // Fallback post
  const fallback = {
    title: 'The Art of Tropical Luxury: What Makes Mango Tree Unique',
    author: 'Sarah Mitchell', createdAt: '2024-01-15', views: 1240,
    tags: ['luxury', 'resort'],
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    content: `<h2>A New Standard of Excellence</h2><p>At Mango Tree, we believe luxury is not about excess but about perfectly curated experiences that connect you with the natural beauty of paradise. Our philosophy is rooted in the belief that the finest things in life are those that feel effortless.</p><h2>The Architecture of Paradise</h2><p>Every structure at Mango Tree was designed with a single purpose: to disappear into the landscape while offering the most breathtaking vantage points. Our architects spent years studying the natural light patterns, prevailing winds, and ocean currents to position each villa and pavilion perfectly.</p><h2>Service Beyond Compare</h2><p>Our butler team undergoes 18 months of training before welcoming their first guest. They learn not just the mechanics of service but the art of anticipation — reading subtle cues to understand what each guest desires before the thought is fully formed.</p>`,
    metaTitle: 'Art of Tropical Luxury | Mango Tree Resort Blog',
    metaDesc: 'Discover what sets Mango Tree apart in the world of luxury hospitality.',
  };

  const displayPost = post || (isLoading ? null : fallback);

  if (isLoading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-resort-200 border-t-resort-600 rounded-full animate-spin" />
    </div>
  );

  if (!displayPost) return <div className="pt-20 text-center py-20 text-gray-500">Post not found.</div>;

  return (
    <>
      <Helmet>
        <title>{displayPost.metaTitle || `${displayPost.title} | Mango Tree`}</title>
        <meta name="description" content={displayPost.metaDesc || displayPost.excerpt} />
        <meta property="og:title" content={displayPost.title} />
        <meta property="og:image" content={displayPost.coverImage} />
      </Helmet>
      <div className="pt-20 bg-white">
        {/* Hero */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img src={displayPost.coverImage} alt={displayPost.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              {displayPost.tags?.map(t => <span key={t} className="badge bg-resort-600/80 text-white">{t}</span>)}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white hero-text-shadow mb-4">{displayPost.title}</h1>
            <div className="flex items-center space-x-4 text-white/70 text-sm">
              <span>By {displayPost.author}</span>
              <span>·</span>
              <span>{format(new Date(displayPost.createdAt), 'MMMM d, yyyy')}</span>
              {displayPost.views > 0 && <><span>·</span><span className="flex items-center space-x-1"><Eye size={12} /><span>{displayPost.views} views</span></span></>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div
            className="prose prose-lg prose-headings:font-display prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 max-w-none"
            dangerouslySetInnerHTML={{ __html: displayPost.content }}
          />

          {/* Tags */}
          {displayPost.tags?.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center space-x-3">
              <Tag size={14} className="text-gray-400" />
              {displayPost.tags.map(t => <span key={t} className="badge-gray text-xs">{t}</span>)}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-100">
            <Link to="/blog" className="flex items-center space-x-2 text-resort-600 hover:text-resort-800 font-medium">
              <ArrowRight size={14} className="rotate-180" /> <span>Back to Journal</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default BlogPage;
