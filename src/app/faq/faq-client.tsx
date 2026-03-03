"use client";

import { useState, useMemo } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Footer from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInbox, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import FAQTile from '@/components/tiles/faq_tile';
import EmptyState from '@/components/empty_state';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface FaqEntry {
  id?: string | number;
  q?: string;
  question?: string;
  a?: string;
  answer?: string;
}

interface FaqClientProps {
  /** FAQ list fetched by the server component (ISR-cached). */
  initialFaqs: FaqEntry[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FaqClient({ initialFaqs }: FaqClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = initialFaqs;

  const filteredFaqs = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return faqs;

    return faqs.filter(faq => 
      ((faq as any).q || (faq as any).question || '').toLowerCase().includes(cleanQuery) || 
      ((faq as any).a || (faq as any).answer || '').toLowerCase().includes(cleanQuery)
    );
  }, [searchQuery, faqs]);

  const hasNoFaqsAtAll = faqs.length === 0;
  const hasNoSearchResults = filteredFaqs.length === 0 && searchQuery.length > 0;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="relative w-full bg-[var(--background-color)]"
    >
      <Navbar />

      <header className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/farm.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-6 text-center text-[var(--background-color)]">
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-montserrat)] uppercase tracking-tight mb-2">
            FAQs
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-sm md:text-base font-[family-name:var(--font-bricolage-grotesque)] max-w-2xl mx-auto mb-10 leading-relaxed opacity-90"
          >
            Find answers to common questions about Moldify&apos;s AI technology, 
            crop protection, and how we help farmers secure their harvest.
          </motion.p>
          <motion.div variants={itemVariants} className="relative max-w-xl mx-auto mt-8">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full py-3 px-8 rounded-full bg-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] shadow-xl focus:outline-none"
              disabled={hasNoFaqsAtAll}
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--primary-color)]" />
          </motion.div>
        </div>
      </header>

      <section className="bg-[var(--background-color)] py-20 px-4 min-h-[60vh]">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* SCENARIO 1: TOTAL EMPTY DATABASE */}
            {hasNoFaqsAtAll ? (
              <motion.div key="no-faqs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState 
                  icon={faQuestionCircle} 
                  title="No Questions Yet" 
                  message="The FAQ section is currently being updated. Please check back soon for more information." 
                />
              </motion.div>
            ) : 
            /* SCENARIO 2: NO SEARCH RESULTS */
            hasNoSearchResults ? (
              <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState 
                  icon={faInbox} 
                  title="No Matches Found" 
                  message={`We couldn't find any FAQs matching "${searchQuery}".`} 
                />
              </motion.div>
            ) : (
              /* SCENARIO 3: SHOW FAQS */
              <motion.div 
                key={searchQuery === "" ? "full-list" : "filtered-list"}
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                {filteredFaqs.map((faq) => (
                  <motion.div key={faq.id} variants={itemVariants} layout>
                    <FAQTile question={(faq as any).q || (faq as any).question} answer={(faq as any).a || (faq as any).answer} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}
