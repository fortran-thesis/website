"use client";
import { useState, useMemo } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Footer from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInbox, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import WikimoldTile from '@/components/tiles/wikimold_tile';
import EmptyState from '@/components/empty_state';

const mockArticles = [
  { id: 1, title: "The Rise of Molds: Dive into the Fungal Kingdom", author: "Dr. Aris Mendoza", image: "/assets/mold.jpg" },
  { id: 2, title: "Aflatoxin Risks in Post-Harvest Corn", author: "Maria Clara", image: "/assets/farm.jpg" },
  { id: 3, title: "Rice Blast: Prevention and Control", author: "Juan Dela Cruz", image: "/assets/mold.jpg" },
  { id: 4, title: "Climate Change and Spore Migration", author: "Elena Adarna", image: "/assets/farm.jpg" },
  { id: 5, title: "Machine Learning for Crop Safety", author: "Moldify Team", image: "/assets/mold.jpg" },
  { id: 6, title: "Root Rot in Hydroponic Systems", author: "Ferdinand Silva", image: "/assets/farm.jpg" },
];

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return mockArticles;
    
    return mockArticles.filter(art => 
      art.title.toLowerCase().includes(cleanQuery) || 
      art.author.toLowerCase().includes(cleanQuery)
    );
  }, [searchQuery]);

  const hasNoArticlesAtAll = mockArticles.length === 0;
  const hasNoSearchResults = filteredArticles.length === 0 && searchQuery.length > 0;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="relative w-full bg-[var(--background-color)]"
    >
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
            Your comprehensive digital encyclopedia for agricultural mold detection, prevention, and fungal research.
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
          <AnimatePresence mode="popLayout">
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
                {/* DYNAMIC LABEL: Only shows when there are articles */}
                <motion.div variants={itemVariants} className="mb-8">
                   <h2 className="text-[var(--primary-color)] font-black font-[family-name:var(--font-montserrat)] text-2xl uppercase tracking-tight flex items-center gap-3">
                      Latest Articles
                   </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
                  {filteredArticles.map((article) => (
                    <motion.div key={article.id} variants={itemVariants} layout>
                      <WikimoldTile 
                        id={article.id} 
                        title={article.title}
                        author={article.author}
                        image={article.image}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}