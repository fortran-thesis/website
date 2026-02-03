"use client";
import { useState, useMemo, useEffect } from 'react';
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
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const backendUrl = 'https://api-2p4weeh6lq-as.a.run.app';
        
        const response = await fetch(`${backendUrl}/api/v1/faq?pageSize=100`, { 
          cache: 'no-store' 
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch FAQs (Status: ${response.status})`);
        }
        
        const data = await response.json();
        console.log('Full API response:', data);
        
        if (data.success && data.data) {
          const faqsData = data.data.data || data.data;
          setFaqs(Array.isArray(faqsData) ? faqsData : []);
          setNextPageToken(data.data.nextPageToken || null);
        } else if (data.success && Array.isArray(data.data)) {
          console.log('✅ FAQs loaded:', data.data.length);
          setFaqs(data.data);
        } else {
          console.warn('⚠️ No FAQ data found, using mock data');
          setFaqs(mockFaqs);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch FAQs:', err);
        console.log('📋 Using mock data as fallback');
        setFaqs(mockFaqs);
        setError(null); // Don't show error, just use mock data
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return faqs;

    return faqs.filter(faq => 
      (faq.q || faq.question || '').toLowerCase().includes(cleanQuery) || 
      (faq.a || faq.answer || '').toLowerCase().includes(cleanQuery)
    );
  }, [searchQuery, faqs]);

  // Logic for different empty states
  const hasNoFaqsAtAll = faqs.length === 0 && !loading;
  const hasNoSearchResults = filteredFaqs.length === 0 && searchQuery.length > 0;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="relative w-full bg-[var(--background-color)]"
    >
      {/* Top Loading Bar */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
          <div 
            className="h-full bg-[var(--accent-color)] animate-[loading_1s_ease-in-out_infinite]" 
            style={{ width: '30%' }}
          />
        </div>
      )}
      
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                <p className="text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-xl">Loading FAQs...</p>
              </motion.div>
            </div>
          ) : (
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
                      <FAQTile question={faq.q || faq.question} answer={faq.a || faq.answer} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}