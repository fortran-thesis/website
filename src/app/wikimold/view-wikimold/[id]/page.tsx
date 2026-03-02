"use client";
import { useState, useEffect, useMemo } from 'react'; 
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { useMoldipediaArticle } from '@/hooks/swr';

// --- Default Placeholders ---
const DEFAULT_BANNER = "/assets/mold.jpg";
const DEFAULT_AUTHOR = "/assets/default-fallback.png";

export default function ViewWikiMold() {
  const { id } = useParams();
  
  // SWR: fetch article
  const { data: articleRes, isLoading: loading, error: swrError } = useMoldipediaArticle(id as string | undefined);
  const error = swrError ? (swrError instanceof Error ? swrError.message : 'Failed to load article') : null;

  // --- Image States ---
  const [bannerSrc, setBannerSrc] = useState(DEFAULT_BANNER);
  const [authorSrc, setAuthorSrc] = useState(DEFAULT_AUTHOR);

  const article = useMemo(() => {
    const data = articleRes?.data;
    if (!data) return null;

    let formattedDate = 'Date not available';
    if (data.metadata) {
      const dateSource = data.metadata.created_at;
      if (dateSource) {
        try {
          let dateObj;
          if (typeof dateSource === 'object' && '_seconds' in dateSource) {
            dateObj = new Date(dateSource._seconds * 1000);
          } else {
            dateObj = new Date(dateSource as string);
          }
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          }
        } catch { /* keep default */ }
      }
    }

    return {
      id: data.id,
      title: data.title || 'Untitled Article',
      author: data.author || 'Unknown Author',
      date: formattedDate,
      bannerImage: data.cover_photo || DEFAULT_BANNER,
      authorImage: data.author_photo || DEFAULT_AUTHOR,
      content: data.body || data.description || data.content || 'No content available',
    };
  }, [articleRes]);

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
            style={{}}
          >
            <style>{`
              .prose ul, .prose ol {
                list-style-position: inside !important;
                list-style-type: disc !important;
                margin-left: 1.5em !important;
                padding-left: 0 !important;
              }
              .prose ol {
                list-style-type: decimal !important;
              }
              .prose li {
                margin-bottom: 0.5em !important;
              }
              .prose h2 {
                font-family: var(--font-montserrat) !important;
                font-size: 2rem !important;
                font-weight: 900 !important;
                margin-top: 2em !important;
                margin-bottom: 1em !important;
                color: var(--primary-color) !important;
              }
              .prose h3 {
                font-family: var(--font-montserrat) !important;
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                margin-top: 1.5em !important;
                margin-bottom: 0.75em !important;
                color: var(--accent-color) !important;
              }
              .prose a {
                color: var(--moldify-blue) !important;
                text-decoration: underline !important;
                font-weight: 600 !important;
                transition: color 0.2s;
              }
              .prose a:hover {
                color: var(--primary-color) !important;
                text-decoration: underline !important;
              }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}