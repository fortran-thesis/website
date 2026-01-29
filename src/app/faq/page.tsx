"use client";
import { useState, useMemo } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Footer from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInbox, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import FAQTile from '@/components/tiles/faq_tile';
import EmptyState from '@/components/empty_state';

const mockFaqs = [
  { id: 1, q: "What is Moldify?", a: "Moldify is an AI-powered investigation system designed for early detection and analysis of agricultural mold to protect crops." },
  { id: 2, q: "How does the detection work?", a: "We use machine learning models trained on thousands of crop images to identify mold patterns before they are visible to the naked eye." },
  { id: 3, q: "Is it applicable for all crops?", a: "Currently, we specialize in high-value crops like rice, corn, and cacao, but we are expanding our database to include more varieties." },
  { id: 4, q: "How accurate is the mold detection?", a: "Our current models achieve a 95% accuracy rate in controlled environments and continue to learn from real-world data inputs." },
  { id: 5, q: "Do I need special hardware to use Moldify?", a: "No, Moldify is designed to work with standard high-resolution cameras and smartphone lenses, making it accessible for local farmers." },
  { id: 6, q: "Can it detect mold in stored grains?", a: "Yes, Moldify can analyze surface mold in storage facilities and silos, provided there is adequate lighting for image capture." },
  { id: 7, q: "Is an internet connection required?", a: "An internet connection is needed to sync data and run the heavy AI analysis, but we are developing an 'Offline Lite' version for remote areas." },
  { id: 8, q: "How fast are the results generated?", a: "Once an image is uploaded, the analysis typically takes between 3 to 10 seconds depending on your connection speed." },
  { id: 9, q: "What kind of molds can the system identify?", a: "We currently identify common agricultural threats such as Aflatoxin-producing molds, Downy Mildew, and Powdery Mildew." },
  { id: 10, q: "How do I sign up for an account?", a: "You can click the 'Log In' button in the navbar and select 'Register' to start your journey with Moldify." }
];

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

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return mockFaqs;

    return mockFaqs.filter(faq => 
      faq.q.toLowerCase().includes(cleanQuery) || 
      faq.a.toLowerCase().includes(cleanQuery)
    );
  }, [searchQuery]);

  // Logic for different empty states
  const hasNoFaqsAtAll = mockFaqs.length === 0;
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
              disabled={hasNoFaqsAtAll} // Disabled kung walang data
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
                    <FAQTile question={faq.q} answer={faq.a} />
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