"use client";
import { useState, useMemo, useEffect } from 'react'; 
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';

// --- Default Placeholders ---
const DEFAULT_BANNER = "/assets/farm.jpg"; // Fallback para sa banner
const DEFAULT_AUTHOR = "/assets/default-fallback.png"; // Fallback para sa profile pic

const MOCK_ARTICLES = [
  {
    id: "1",
    title: "The Rise of Molds: Dive into the Microscopic Landscape of Growing Fungi",
    author: "Karl Manuel Diata",
    date: "September 08, 2026",
    bannerImage: "/assets/mold.jpg",
    authorImage: "/assets/author-placeholder.jpg", 
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet. Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat. In iaculis arcu eros, eget tempus orci facilisis id.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum` 
  }
];

export default function ViewWikiMold() {
  const { id } = useParams();
  
  const article = useMemo(() => {
    return MOCK_ARTICLES.find(a => a.id === id) || MOCK_ARTICLES[0];
  }, [id]);

  // --- Image States ---
  const [bannerSrc, setBannerSrc] = useState(article.bannerImage || DEFAULT_BANNER);
  const [authorSrc, setAuthorSrc] = useState(article.authorImage || DEFAULT_AUTHOR);

  useEffect(() => {
    setBannerSrc(article.bannerImage || DEFAULT_BANNER);
    setAuthorSrc(article.authorImage || DEFAULT_AUTHOR);
  }, [article]);

  // Scroll Animation Logic
  const { scrollY } = useScroll();
  const yBanner = useTransform(scrollY, [0, 500], [0, 200]);

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
              className="object-cover"
              onError={() => setBannerSrc(DEFAULT_BANNER)} // Fallback if link is broken
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
                className="object-cover"
                onError={() => setAuthorSrc(DEFAULT_AUTHOR)} // Fallback if link is broken
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
              className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] leading-tight tracking-tighter"
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