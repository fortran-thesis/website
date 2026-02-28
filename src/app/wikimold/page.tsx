"use client";
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInbox, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import WikimoldTile from '@/components/tiles/wikimold_tile';
import EmptyState from '@/components/empty_state';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

const mockArticles = [
  { id: 1, title: "The Rise of Molds: Dive into the Fungal Kingdom", author: "Dr. Aris Mendoza", image: "/assets/mold.jpg" },
  { id: 2, title: "Aflatoxin Risks in Post-Harvest Corn", author: "Maria Clara", image: "/assets/farm.jpg" },
  { id: 3, title: "Rice Blast: Prevention and Control", author: "Juan Dela Cruz", image: "/assets/mold.jpg" },
  { id: 4, title: "Climate Change and Spore Migration", author: "Elena Adarna", image: "/assets/farm.jpg" },
  { id: 5, title: "Machine Learning for Crop Safety", author: "Moldify Team", image: "/assets/mold.jpg" },
  { id: 6, title: "Root Rot in Hydroponic Systems", author: "Ferdinand Silva", image: "/assets/farm.jpg" },
];

interface Article {
  id: string;
  title: string;
  body: string;
  author_id: string;
  cover_photo: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut" } 
  }
};

export default function WikiMold() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  // Listen for route changes to show loading bar when navigating to article details
  useEffect(() => {
    const handleNavigate = () => {
      setIsNavigating(true);
      // Auto-hide loading bar after 3 seconds as fallback
      const timeout = setTimeout(() => setIsNavigating(false), 3000);
      return () => clearTimeout(timeout);
    };

    // Detect when user clicks on a WikimoldTile (which uses Link component)
    // The route will change, so we listen for any navigation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const linkElement = target.closest('a[href*="/wikimold/view-wikimold/"]');
      if (linkElement) {
        setIsNavigating(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Fetch articles from API
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchArticles = async (pageToken?: string) => {
      try {
        if (!pageToken) setLoading(true);
        else setIsLoadingMore(true);
        
        let url: string = `${envOptions.apiUrl}${endpoints.moldipedia.list}?limit=50`;
        if (pageToken) {
          url += `&pageToken=${encodeURIComponent(pageToken)}`;
        }
        
        console.log('🔍 Fetching from:', url);
        const response = await fetch(url, { cache: 'no-store' });
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch articles (Status: ${response.status})`);
        }
        
        let data: any;
        try {
          data = await response.json();
        } catch (parseError) {
          // Response is not JSON (e.g., plain text error message like 429)
          console.error('Failed to parse response as JSON:', parseError);
          console.error('ailed to fetch wikimold articles:', parseError);
          setError('Failed to load articles');
          if (!pageToken) setArticles([]);
          return;
        }
        
        console.log('Full API response:', data);
        
        // Handle different possible response structures
        let articlesData = null;
        if (data.success) {
          if (data.data?.data) {
            // Handle double-nested data.data structure
            articlesData = data.data.data;
          } else if (data.data?.snapshot) {
            articlesData = data.data.snapshot;
          } else if (data.data?.items) {
            articlesData = data.data.items;
          } else if (data.data?.records) {
            articlesData = data.data.records;
          } else if (data.data?.articles) {
            articlesData = data.data.articles;
          } else if (Array.isArray(data.data)) {
            articlesData = data.data;
          }
        }
        
        if (articlesData && Array.isArray(articlesData)) {
          console.log('Found articles:', articlesData.length);
          if (pageToken) {
            setArticles(prev => [...prev, ...articlesData]);
          } else {
            setArticles(articlesData);
          }
          setNextPageToken(data.data?.nextPageToken || null);
        } else {
          console.error('No articles data found in response');
          if (!pageToken) setArticles([]);
        }
        setError(null);
      } catch (err) {
        console.error('ailed to fetch wikimold articles:', err);
        setError('Failed to load articles');
        if (!pageToken) setArticles([]);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };
    
    fetchArticles();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting && nextPageToken && !isLoadingMore && !searchQuery) {
          console.log('📚 Scrolled to bottom, loading more articles...');
          setIsLoadingMore(true);
          
          const fetchMoreArticles = async () => {
            try {
              let url = `${envOptions.apiUrl}${endpoints.moldipedia.list}?limit=50`;
              url += `&pageToken=${encodeURIComponent(nextPageToken)}`;
              
              const response = await fetch(url, { cache: 'no-store' });
              const data = await response.json();
              
              if (data.success && data.data?.snapshot && data.data.snapshot.length > 0) {
                setArticles(prev => [...prev, ...data.data.snapshot]);
                setNextPageToken(data.data.nextPageToken || null);
                console.log('✅ Loaded', data.data.snapshot.length, 'more articles');
              } else {
                setNextPageToken(null);
              }
            } catch (err) {
              console.error('Failed to load more articles:', err);
            } finally {
              setIsLoadingMore(false);
            }
          };
          
          fetchMoreArticles();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [nextPageToken, isLoadingMore, searchQuery]);

  const filteredArticles = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return articles;
    
    return articles.filter(art => 
      art.title.toLowerCase().includes(cleanQuery) || 
      (art.author && art.author.toLowerCase().includes(cleanQuery)) ||
      (art.author_id && art.author_id.toLowerCase().includes(cleanQuery))
    );
  }, [searchQuery, articles]);

  const hasNoArticlesAtAll = articles.length === 0 && !loading;
  const hasNoSearchResults = filteredArticles.length === 0 && searchQuery.length > 0;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="relative w-full bg-[var(--background-color)]"
    >
      {/* Top Loading Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
      )}

      <Navbar />

      <header className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/mold2.jpg')" }}>
          <div className="absolute inset-0 bg-black/45 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-6 text-center text-[var(--background-color)]">
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tighter mb-4">
            WikiMold
          </motion.h1>
          <motion.p variants={itemVariants} className="text-sm md:text-base font-[family-name:var(--font-bricolage-grotesque)] max-w-xl mx-auto mb-10 leading-relaxed opacity-90">
            Your comprehensive digital encyclopedia for agricultural mold identification, treatments, and fungal research.
          </motion.p>
          
          <motion.div variants={itemVariants} className="relative max-w-xl mx-auto">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for articles..."
              className="w-full py-3 px-8 rounded-full bg-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] shadow-xl focus:outline-none"
              disabled={hasNoArticlesAtAll}
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-8 top-1/2 -translate-y-1/2 text-[var(--primary-color)] text-xl" />
          </motion.div>
        </div>
      </header>

      <main className="bg-[var(--background-color)] py-20 px-6 sm:px-10 min-h-[70vh]">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                <p className="text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl">Loading articles...</p>
              </motion.div>
            </div>
          ) : error ? (
            <EmptyState 
              icon={faInbox} 
              title="Error Loading Articles" 
              message={error} 
            />
          ) : (
            <AnimatePresence mode="wait">
              {hasNoArticlesAtAll ? (
                <motion.div key="no-articles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState 
                    icon={faPlusCircle} 
                    title="The Library is Empty" 
                    message="There are currently no articles uploaded in the WikiMold database." 
                  />
                </motion.div>
              ) : hasNoSearchResults ? (
                <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState 
                    icon={faInbox} 
                    title="No Matches Found" 
                    message={`We couldn't find any articles matching "${searchQuery}". Try using different keywords.`} 
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key={searchQuery === "" ? "full-grid" : "filtered-grid"}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                  variants={containerVariants}
                  className="w-full"
                >
                  <motion.div variants={itemVariants} className="mb-8">
                     <h2 className="text-[var(--primary-color)] font-black font-[family-name:var(--font-montserrat)] text-2xl uppercase tracking-tight flex items-center gap-3">
                        Articles ({filteredArticles.length})
                     </h2>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
                    {filteredArticles.map((article) => (
                      <motion.div key={article.id} variants={itemVariants} layout>
                        <WikimoldTile 
                          id={article.id} 
                          title={article.title}
                          author={article.author || article.author_id || 'Unknown'}
                          image={article.cover_photo || '/assets/mold.jpg'}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Infinite scroll trigger - appears when user scrolls near bottom */}
                  {!searchQuery && (
                    <div 
                      ref={loadMoreRef} 
                      className="h-10 flex items-center justify-center mt-12"
                    >
                      {isLoadingMore && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="text-gray-500 flex items-center gap-2"
                        >
                          <span className="animate-spin text-xl">⟳</span>
                          <span>Loading more articles...</span>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}