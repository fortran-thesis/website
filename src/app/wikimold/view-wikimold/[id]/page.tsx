"use client";
import { useState, useEffect } from 'react'; 
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { envOptions } from '@/configs/envOptions';
import { endpoints } from '@/services/endpoints';

// --- Default Placeholders ---
const DEFAULT_BANNER = "/assets/mold.jpg";
const DEFAULT_AUTHOR = "/assets/default-fallback.png";

export default function ViewWikiMold() {
  const { id } = useParams();
  
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Image States ---
  const [bannerSrc, setBannerSrc] = useState(DEFAULT_BANNER);
  const [authorSrc, setAuthorSrc] = useState(DEFAULT_AUTHOR);

  // Fetch article data from API
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        console.log('Fetching article with id:', id);
        
        const response = await fetch(`${envOptions.apiUrl}${endpoints.moldipedia.getById(id as string)}`, { 
          cache: 'no-store' 
        });
        
        console.log('Response status:', response.status);
        
        let data: any;
        try {
          data = await response.json();
        } catch (parseError) {
          // Response is not JSON (e.g., plain text error message like 429)
          console.error('Failed to parse response as JSON:', parseError);
          data = { success: false, error: await response.text() };
        }
        
        if (!response.ok) {
          console.error(`API Error (Status: ${response.status}):`, data.error || data);
          setLoading(false);
          return;
        }
        
        if (data.success && data.data) {
          const articleData = data.data;
          if (articleData.metadata) {
            Object.entries(articleData.metadata).forEach(([key, value]) => {
              console.log(`  ${key}:`, value, 'Type:', typeof value);
            });
          }
          
          // Parse date from metadata field
          let formattedDate = 'Date not available';
          if (articleData.metadata) {
            const dateSource = articleData.metadata.created_at || articleData.metadata.timestamp || articleData.metadata.date;
            console.log('📅 Date source from metadata:', dateSource);
            if (dateSource) {
              try {
                let dateObj;
                // Handle Firebase Timestamp object with _seconds property
                if (dateSource && typeof dateSource === 'object' && '_seconds' in dateSource) {
                  console.log('🔥 Firebase Timestamp detected, _seconds:', dateSource._seconds);
                  dateObj = new Date(dateSource._seconds * 1000); // Convert seconds to milliseconds
                } else {
                  dateObj = new Date(dateSource);
                }
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
              } catch (err) {
                console.warn('ailed to parse date:', dateSource, err);
              } 
            }
          } else {
            console.warn('No metadata field in response');
          }
          
          const formattedArticle = {
            id: articleData.id,
            title: articleData.title || 'Untitled Article',
            author: articleData.author || 'Unknown Author',
            date: formattedDate,
            bannerImage: articleData.cover_photo || DEFAULT_BANNER,
            authorImage: articleData.author_photo || DEFAULT_AUTHOR,
            content: articleData.body || articleData.description || articleData.content || 'No content available'
          };
          setArticle(formattedArticle);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (err) {
        console.error('Failed to fetch wikimold article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  // Update image sources when article changes
  useEffect(() => {
    if (article) {
      setBannerSrc(article.bannerImage || DEFAULT_BANNER);
      setAuthorSrc(article.authorImage || DEFAULT_AUTHOR);
    }
  }, [article]);

  // Scroll Animation Logic
  const { scrollY } = useScroll();
  const yBanner = useTransform(scrollY, [0, 500], [0, 200]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-color)] flex flex-col">
        {/* Top Loading Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 text-center">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[var(--background-color)] flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg font-semibold mb-2">❌ {error || 'Article not found'}</p>
            <p className="text-gray-500">Please try going back to the WikiMold library.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-color)] flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* --- HERO BANNER SECTION --- */}
        <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            style={{ y: yBanner }} 
            className="relative h-full w-full"
          >
            <Image 
              src={bannerSrc} 
              alt="Article Banner" 
              fill 
              priority
              sizes="100vw"
              className="object-cover"
              onError={() => setBannerSrc(DEFAULT_BANNER)}
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        </section>

        {/* --- CONTENT SECTION --- */}
        <article className="relative max-w-4xl mx-auto px-6 pb-20">
          
          {/* Overlapping Author Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative -mt-16 md:-mt-24 flex justify-center z-10"
          >
            {/* Fixed Height & Width for Circle Consistency */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--background-color)] overflow-hidden shadow-xl bg-gray-200">
              <Image 
                src={authorSrc} 
                alt={article.author}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover"
                onError={() => setAuthorSrc(DEFAULT_AUTHOR)}
              />
            </div>
          </motion.div>

          {/* Article Header */}
          <div className="text-center mt-8 mb-12">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs md:text-sm text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)]"
            >
              By <span className="font-bold">{article.author}</span> <span className='font-bold text-[var(--accent-color)]'> | </span> {article.date}
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="capitalize mt-4 text-3xl md:text-4xl lg:text-5xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] leading-tight tracking-tighter"
            >
              {article.title}
            </motion.h1>
          </div>

          {/* Article Body */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg max-w-none text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed text-justify space-y-6"
          >
            <p>{article.content}</p>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}