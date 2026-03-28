"use client";
import { useState, useEffect, useMemo, useRef } from 'react'; 
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { useMoldipediaArticle, useMoldipediaCases, type MoldipediaArticle, type MoldCaseSummary } from '@/hooks/swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicroscope, faChevronLeft, faArrowRight, faCompass } from '@fortawesome/free-solid-svg-icons';

// --- Default Placeholders ---
const DEFAULT_BANNER = "/assets/mold.jpg";
const DEFAULT_AUTHOR = "/assets/default-fallback.png";

const EMPTY_HTML_FALLBACK = '<p>Content will be added here while dummy data is in use.</p>';

type ArticleViewModel = {
  id: string;
  title: string;
  author: string;
  date: string;
  bannerImage: string;
  authorImage: string;
  content: string;
  treatment: string;
  treatment_mechanical: string;
  treatment_cultural: string;
  treatment_biological: string;
  treatment_physical: string;
  treatment_chemical: string;
  mold_type: string;
  affected_crops: string;
  symptoms: string;
  disease_cycle: string;
  impact: string;
  prevention: string;
  findings: Array<{ title: string; content: string }>;
};

type DossierField = 'affected_crops' | 'symptoms' | 'disease_cycle' | 'impact' | 'prevention';
type TreatmentField =
  | 'treatment_mechanical'
  | 'treatment_cultural'
  | 'treatment_biological'
  | 'treatment_physical'
  | 'treatment_chemical';

const TREATMENT_FIELD_BY_CONTROL: Record<TreatmentControlId, TreatmentField> = {
  mechanical: 'treatment_mechanical',
  cultural: 'treatment_cultural',
  biological: 'treatment_biological',
  physical: 'treatment_physical',
  chemical: 'treatment_chemical',
};

// --- Treatment Control Types ---
type TreatmentControlId = 'mechanical' | 'cultural' | 'biological' | 'physical' | 'chemical';

const TREATMENT_CONTROLS: Array<{ name: string; id: TreatmentControlId; desc: string }> = [
  { name: 'Mechanical Control', id: 'mechanical', desc: 'Physical removal of fungal structures' },
  { name: 'Cultural Control', id: 'cultural', desc: 'Environmental habit modification' },
  { name: 'Biological Control', id: 'biological', desc: 'Microbial antagonism strategies' },
  { name: 'Physical Control', id: 'physical', desc: 'Temperature and moisture regulation' },
  { name: 'Chemical Control', id: 'chemical', desc: 'Targeted antimicrobial application' },
];

const FALLBACK_FINDINGS = [
  { title: "Initial Observation", content: "<p>No initial observation data available yet.</p>" },
  { title: "In Vivo", content: "<p>No in vivo data available yet.</p>" },
  { title: "In Vitro", content: "<p>No in vitro data available yet.</p>" },
];

function getHtmlField(
  article: MoldipediaArticle,
  fieldName: DossierField,
  fallback = EMPTY_HTML_FALLBACK,
): string {
  // The API payload is still evolving, so normalize optional rich-text fields once here.
  const value = article[fieldName];
  return typeof value === 'string' && value.trim() ? value : fallback;
}


export default function ViewWikiMold() {
  const { id } = useParams();
  const router = useRouter();
  
  // SWR: fetch article
  const { data: articleRes, isLoading: loading, error: swrError } = useMoldipediaArticle(id as string | undefined);
  const { data: casesRes, isLoading: casesLoading, error: casesError } = useMoldipediaCases(id as string | undefined);
  const error = swrError ? (swrError instanceof Error ? swrError.message : 'Failed to load article') : null;

  // --- Image States ---
  const [bannerSrc, setBannerSrc] = useState(DEFAULT_BANNER);
  const [authorSrc, setAuthorSrc] = useState(DEFAULT_AUTHOR);

  const article = useMemo<ArticleViewModel | null>(() => {
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
      content: data.body || data.description || data.content || EMPTY_HTML_FALLBACK,
      treatment: data.treatment || (data.treatments && (data.treatments.mechanical || data.treatments.cultural || data.treatments.biological || data.treatments.physical || data.treatments.chemical) ? '<p>Treatment details available in specific categories.</p>' : '<p>No treatment information available yet.</p>'),
      treatment_mechanical: data.treatment_mechanical || (data.treatments?.mechanical as string | undefined) || '',
      treatment_cultural: data.treatment_cultural || (data.treatments?.cultural as string | undefined) || '',
      treatment_biological: data.treatment_biological || (data.treatments?.biological as string | undefined) || '',
      treatment_physical: data.treatment_physical || (data.treatments?.physical as string | undefined) || '',
      treatment_chemical: data.treatment_chemical || (data.treatments?.chemical as string | undefined) || '',
      mold_type: data.mold_type || 'Unknown Mold Type',
      affected_crops: getHtmlField(data, 'affected_crops', '<p>Affected host data will be added here.</p>'),
      symptoms: getHtmlField(data, 'symptoms', '<p>Symptom data will be added here.</p>'),
      disease_cycle: getHtmlField(data, 'disease_cycle', '<p>Transmission details will be added here.</p>'),
      impact: getHtmlField(data, 'impact', '<p>Impact analysis will be added here.</p>'),
      prevention: getHtmlField(data, 'prevention', '<p>Prevention strategies will be added here.</p>'),
      findings: Array.isArray(data.findings) ? data.findings : [],
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

  const [activeStage, setActiveStage] = useState(0);
  const [activeTreatment, setActiveTreatment] = useState(0);
  const [showExploreCasesCta, setShowExploreCasesCta] = useState(false);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const similarCasesSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const heroElement = heroSectionRef.current;
    if (!heroElement || typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Show CTA only after the hero section leaves the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowExploreCasesCta(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(heroElement);

    return () => observer.disconnect();
  }, []);

  // Get findings from article, fallback to empty state messages
  const discoveryStages = article?.findings && article.findings.length > 0
    ? article.findings
    : FALLBACK_FINDINGS;

  // Fast Refresh can keep an old activeStage even when dummy stages change size.
  const currentStageIndex = Math.min(Math.max(activeStage, 0), discoveryStages.length - 1);
  const currentStage = discoveryStages[currentStageIndex];

  // Helper to get treatment HTML based on control type
  const getTreatmentHtml = (controlId: TreatmentControlId): string => {
    if (!article) {
      return '';
    }

    const treatmentField = TREATMENT_FIELD_BY_CONTROL[controlId];
    return article[treatmentField] || article.treatment || '';
  };

  const linkedCases = useMemo<MoldCaseSummary[]>(() => {
    const raw = casesRes?.data;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw && typeof raw === 'object') {
      const snapshot = (raw as { snapshot?: unknown }).snapshot;
      if (Array.isArray(snapshot)) {
        return snapshot as MoldCaseSummary[];
      }
    }
    return [];
  }, [casesRes]);

  const formatCaseDate = (entry: MoldCaseSummary): string => {
    const value = entry.final_verdict?.verdict_timestamp;
    if (!value) return 'Date unavailable';
    try {
      const dateObj = typeof value === 'object' && '_seconds' in value
        ? new Date(value._seconds * 1000)
        : new Date(value as string);
      if (isNaN(dateObj.getTime())) return 'Date unavailable';
      return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Date unavailable';
    }
  };

  const openLinkedCase = (entry: MoldCaseSummary) => {
    const target = (entry.mold_report_id || entry.id || '').trim();
    if (!target) return;
    router.push(`/investigation/view-case?id=${encodeURIComponent(target)}`);
  };

  const scrollToLinkedCases = () => {
    similarCasesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

/** * SectionHeader Component (UNTOUCHED LOGIC, UPDATED STYLING) * Unified look for Description, Treatment, and Findings sections. */
const SectionHeader = ({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="relative mb-20 flex flex-col md:flex-row items-start gap-4">
    <div className="hidden md:block absolute -left-12 -top-5 text-[8rem] font-black font-[family-name:var(--font-montserrat)] leading-none select-none opacity-5 text-[var(--primary-color)]">
      {number}
    </div>
    <div className="relative z-10 pl-6 border-l-4 border-[var(--accent-color)] mt-3">
      <p className="font-[family-name:var(--font-montserrat)] font-black uppercase text-[10px] tracking-[0.4em] text-[var(--primary-color)]/50 mb-1">
        Fungal Analysis Phase
      </p>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tight leading-none">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--moldify-black)]/60">
          {subtitle}
        </p>
      ) : null}
    </div>
  </div>
);

/** * Background Pattern Component * Adds subtle biological texture without using images. */
const BioTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.015]" viewBox="0 0 100 100">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="2" stitchTiles="stitch" />
    </filter>
    <rect width="100" height="100" filter="url(#noiseFilter)" />
    <defs>
      <pattern id="dotPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="var(--primary-color)" />
      </pattern>
    </defs>
    <rect width="100" height="100" fill="url(#dotPattern)" />
  </svg>
);

/**
 * ProseContent Component - Reusable prose wrapper with custom styles
 * Handles HTML content with proper styling for lists, headings, links, etc.
 */
const ProseContent = ({ 
  html, 
  className = "" 
}: { 
  html: string; 
  className?: string 
}) => (
  <div className={`prose prose-xl max-w-none ${className}`}>
    <style>{`
      .prose {
        max-width: 100% !important;
      }
      .prose p,
      .prose li,
      .prose div,
      .prose span {
        text-align: justify !important;
        text-align-last: left;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        hyphens: auto;
      }
      .prose img,
      .prose video,
      .prose table,
      .prose pre,
      .prose code {
        max-width: 100% !important;
      }
      .prose pre,
      .prose code {
        white-space: pre-wrap !important;
      }
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
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </div>
);

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
    <div className="min-h-screen bg-[var(--background-color)] flex flex-col selection:bg-[var(--accent-color)] selection:text-white font-[family-name:var(--font-bricolage-grotesque)] relative overflow-hidden">
      <Navbar />

      {/* --- BACKGROUND TEXTURE LAYER --- */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.2] z-0">
        <svg width="100%" height="100%">
          <filter id="grainy">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grainy)" />
        </svg>
      </div>

      <main className="flex-grow relative z-10">
        {/* --- HERO BANNER SECTION  --- */}
        <section ref={heroSectionRef} className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div style={{ y: yBanner }} className="relative h-full w-full">
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
        <article className="relative max-w-5xl mx-auto px-6 pb-32">
          
          {/* Overlapping Author Image  --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative -mt-16 md:-mt-24 flex justify-center z-10"
          >
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

          {/* Article Header --- */}
          <div className="text-center mt-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs md:text-sm text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)]"
            >
              By <span className="font-bold">{article.author}</span> 
              <span className="font-bold text-[var(--accent-color)]"> | </span> 
              {article.date}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="capitalize mt-4 text-5xl md:text-6xl lg:text-7xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] leading-tight tracking-tighter"
            >
              {article.title}
            </motion.h1>
          </div>

          {/* --- 01. DESCRIPTION: Creative No-Container Layout --- */}
          <section className="my-20 max-w-7xl mx-auto relative">
            <SectionHeader number="01" title="Biological Description" />
            
            {/* Background Radial Glow (Accent Color at 5% opacity) */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-[var(--accent-color)]/5 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div className="relative z-10">
              <ProseContent 
                html={article.content} 
                className="text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed text-left"
              />
            </motion.div>
          </section>

          {/* --- 3. AGRICULTURAL INFO --- */}
          <section className="my-32 px-16 py-28 rounded-[3.5rem] bg-[var(--primary-color)]/[0.02] border border-[var(--primary-color)]/10 relative overflow-hidden">
            {/* The decorative leaf moved to the far background */}
            <div className="absolute top-12 right-12 opacity-[0.07] pointer-events-none">
              <Image src="/assets/leaf.svg" alt="leaf" width={220} height={220} className="grayscale" />
            </div>
            
            <SectionHeader 
              number="02" 
              title="Host & Pathogen Impact" 
              subtitle="Technical Analysis & Observations" 
            />

            {/* Main content */}
            <div className="mt-32 max-w-5xl mx-auto space-y-40">
              {[
                { title: "Affected Hosts", content: article.affected_crops },
                { title: "Symptoms & Signs", content: article.symptoms },
                { title: "Transmission Cycle", content: article.disease_cycle },
                { title: "Impact Analysis", content: article.impact },
                { title: "Prevention Strategies", content: article.prevention },
              ].map((item, index) => (
                <div key={index} className="relative flex flex-col md:flex-row gap-12 md:gap-24">
                  
                  {/* The Number*/}
                  <div className="flex-shrink-0">
                    <span className="text-5xl font-extrabold text-[var(--accent-color)]/80 font-[family-name:var(--font-montserrat)] leading-none select-none">
                      0{index + 1}
                    </span>
                  </div>

                  {/* The Content */}
                  <div className="flex-grow space-y-8 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="h-[2px] w-8 bg-[var(--accent-color)]/40" />
                      <h4 className="text-2xl font-black uppercase text-[var(--primary-color)] tracking-tight font-[family-name:var(--font-montserrat)]">
                        {item.title}
                      </h4>
                    </div>
                    
                    <div className="md:pl-12">
                      <ProseContent 
                        html={item.content} 
                        className="text-lg leading-relaxed text-[var(--primary-color)]/70 font-light" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
        {/* --- 02. TREATMENT --- */}
          <section className="mb-30 relative max-w-5xl mx-auto">
            <SectionHeader number="02" title="Treatment Protocols" />
            
            <div className="space-y-4 relative">
              {TREATMENT_CONTROLS.map((ctrl, idx) => {
                const isOpen = activeTreatment === idx;
                
                return (
                  <motion.div 
                    key={ctrl.id}
                    initial={false}
                    className={`relative overflow-hidden transition-all duration-700 rounded-[2.5rem] border-2 ${
                      isOpen 
                        ? 'border-[var(--primary-color)]/20 bg-[var(--primary-color)]/[0.02]' 
                        : 'border-[var(--primary-color)]/5 bg-transparent hover:border-[var(--accent-color)]/20'
                    }`}
                  >
                    {/* Header / Trigger */}
                    <button
                      onClick={() => setActiveTreatment(isOpen ? -1 : idx)}
                      className="w-full text-left p-8 md:p-10 flex items-center justify-between group relative z-10"
                    >
                      <div className="flex items-center gap-8">
                        <span className={`font-[family-name:var(--font-montserrat)] font-black text-2xl md:text-4xl transition-colors ${
                          isOpen ? 'text-[var(--accent-color)]' : 'text-[var(--primary-color)]/20'
                        }`}>
                          0{idx + 1}
                        </span>
                        
                        <div className="flex flex-col">
                          <h3 className="text-xl md:text-2xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tighter">
                            {ctrl.name}
                          </h3>
                          {!isOpen && (
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-black)]/40 mt-1">
                              {ctrl.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Biological Toggle Icon */}
                      <div className={`relative w-8 h-8 rounded-full border-2 border-[var(--primary-color)]/10 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180 border-[var(--accent-color)]/40' : ''}`}>
                        <div className={`w-3 h-0.5 bg-[var(--primary-color)] transition-colors ${isOpen ? 'bg-[var(--accent-color)]' : ''}`} />
                        <div className={`absolute w-3 h-0.5 bg-[var(--primary-color)] transition-all ${isOpen ? 'bg-[var(--accent-color)] rotate-0 opacity-0' : 'rotate-90'}`} />
                      </div>
                    </button>

                    {/* Expandable Content Area (Handles "Many Information") */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-10 md:px-24 pb-12 pt-2 relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/[0.03] blur-[80px] rounded-full -z-10" />
                            
                            <div className="border-l-2 border-[var(--accent-color)]/20 pl-8">
                              <ProseContent 
                                html={getTreatmentHtml(ctrl.id)}
                                className="text-[var(--moldify-black)]/80 font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed text-left"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* --- 4. FINDINGS: Typography Specimen & Interactive Stages --- */}
         <section className="max-w-6xl mx-auto selection:bg-[var(--accent-color)] selection:text-white">
            <SectionHeader number="04" title="Specimen ID & Findings" />
       
            <div className="mb-22 -mt-10 relative py-16 px-6 md:px-12 border-b-2 border-[var(--primary-color)]/10 overflow-hidden group">
              
              <div className="absolute inset-0 opacity-[0.2] -z-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <defs>
                          <radialGradient id="bioGradient1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                              <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="1" />
                              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.1" />
                          </radialGradient>
                      </defs>
                      <circle cx="20" cy="20" r="15" fill="url(#bioGradient1)" />
                      <circle cx="80" cy="80" r="25" fill="url(#bioGradient1)" opacity="0.5" />
                      <circle cx="50" cy="60" r="10" fill="var(--accent-color)" />
                  </svg>
              </div>

              {/* Elegant "Glass-Morphism" Verification Chip */}
              <div className="absolute top-10 right-10 flex gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm z-30">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                  <div className="w-10 h-2.5 rounded-full bg-[var(--primary-color)] opacity-20" />
              </div>

              <div className="relative z-20 text-center md:text-left flex flex-col md:flex-row items-center md:items-baseline gap-6 md:gap-12">
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-5">
                      Mold Classification
                    </span>
                    {/* Main Mold Title - Striking Italic Montserrat */}
                    <h3 className="mb-5 text-5xl md:text-6xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] italic tracking-tighter uppercase leading-none max-w-4xl">
                      {article.mold_type}
                    </h3>
                  </div>
                 
              </div>
            </div>

          
            <div className="flex flex-col lg:flex-row gap-10 items-stretch">
              {/* Slim Navigation Sidebar */}
              <div className="w-full lg:w-[28%] space-y-2 sticky top-32 z-20">
                {discoveryStages.map((stage, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStage(idx)}
                    className={`w-full text-left px-8 py-5 rounded-2xl transition-all duration-500 font-[family-name:var(--font-montserrat)] flex flex-col justify-center gap-1 border-2 ${
                      activeStage === idx
                        ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white shadow-xl scale-[1.03] z-20 translate-x-3'
                        : 'bg-transparent border-[var(--primary-color)]/10 text-[var(--primary-color)] opacity-60 hover:opacity-100 hover:bg-[var(--accent-color)]/[0.02]'
                    }`}
                  >
                    <span className={`text-[10px] font-black tracking-widest ${activeStage === idx ? 'text-[var(--accent-color)]' : 'opacity-40'}`}>PHASE 0{idx + 1}</span>
                    <span className="font-black uppercase tracking-tight text-sm">{stage.title}</span>
                  </button>
                ))}
              </div>

              {/* Robust Findings Content Area */}
              <div className="w-full lg:w-[72%] bg-transparent rounded-[3.5rem] border-4 border-[var(--primary-color)]/5 backdrop-blur-3xl p-12 md:p-20 relative overflow-hidden flex flex-col min-h-[600px] shadow-sm">
                
                {/* Dynamic Background Ghost Number (Using low opacity Primary Color creatively) --- */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] font-black text-[var(--primary-color)]/[0.01] select-none pointer-events-none font-[family-name:var(--font-montserrat)] leading-none z-0">
                  {currentStageIndex + 1}
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStageIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 flex flex-col h-full"
                  >
                    {/* Phase Header with organic accent dot */}
                    <div className="mb-12 border-b-2 border-[var(--primary-color)]/10 pb-8 flex justify-between gap-4">
                      <h4 className="text-4xl md:text-6xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] uppercase tracking-tighter mb-2 leading-none">
                            {currentStage.title}
                      </h4>
                      <div className="shrink-0 pt-2 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] opacity-50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                      </div>
                    </div>

                    {/* Immersive text handling inside prose container - handles large data easily --- */}
                    <div className="flex-grow">
                      <ProseContent 
                        html={currentStage.content}
                        className="text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed text-left"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Supporting Cases Section */}
          <section className="relative px-8 md:px-16 lg:px-24 py-24 bg-gradient-to-b from-[var(--background-color)] to-[var(--background-color)]/50 border-t border-[var(--primary-color)]/10">
            <div className="mx-auto max-w-6xl">
              {linkedCases.length > 0 && (
                <>
                  <div className="mb-12">
                    <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.35em] uppercase text-[var(--accent-color)]/80 mb-2">
                      Evidence Base
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tight mb-2">
                      Supporting Cases
                    </h3>
                    <p className="text-sm text-[var(--moldify-black)]/60 max-w-2xl">
                      Real-world investigations linked to this WikiMold article, showing initial observations, field conditions (in vivo), and laboratory findings (in vitro).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {linkedCases.map((caseEntry, idx) => (
                      <div
                        key={caseEntry.id || `case-${idx}`}
                        className="bg-white rounded-2xl border border-[var(--primary-color)]/10 overflow-hidden hover:border-[var(--primary-color)]/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-6 border-b border-[var(--primary-color)]/10">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="font-[family-name:var(--font-montserrat)] font-black text-[var(--primary-color)] text-lg truncate">
                                {caseEntry.name || 'Unnamed Case'}
                              </p>
                              <p className="text-xs text-[var(--moldify-black)]/60 mt-1">
                                Case ID: {caseEntry.id?.substring(0, 8) || 'N/A'}...
                              </p>
                            </div>
                            <span className={`shrink-0 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                              caseEntry.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : caseEntry.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {caseEntry.priority || 'normal'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div>
                            <p className="text-xs font-black text-[var(--primary-color)] uppercase tracking-wider mb-1">
                              Identified Mold
                            </p>
                            <p className="text-sm font-semibold text-[var(--moldify-black)]">
                              {caseEntry.final_verdict?.moldName || 'Pending verdict'}
                            </p>
                          </div>

                          {caseEntry.final_verdict?.confidence && (
                            <div>
                              <p className="text-xs font-black text-[var(--primary-color)] uppercase tracking-wider mb-2">
                                Confidence
                              </p>
                              <div className="w-full bg-[var(--primary-color)]/10 rounded-full h-2">
                                <div
                                  className="bg-[var(--primary-color)] h-2 rounded-full transition-all"
                                  style={{ width: `${caseEntry.final_verdict.confidence * 100}%` }}
                                />
                              </div>
                              <p className="text-xs text-[var(--moldify-black)]/60 mt-1">
                                {Math.round(caseEntry.final_verdict.confidence * 100)}% match
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-black text-[var(--primary-color)] uppercase tracking-wider mb-1">
                              Verdict Date
                            </p>
                            <p className="text-sm text-[var(--moldify-black)]/70">
                              {formatCaseDate(caseEntry)}
                            </p>
                          </div>

                          {caseEntry.final_verdict?.mycologist_notes && (
                            <div className="pt-3 border-t border-[var(--primary-color)]/10">
                              <p className="text-xs font-black text-[var(--primary-color)] uppercase tracking-wider mb-2">
                                Notes
                              </p>
                              <p className="text-xs text-[var(--moldify-black)] line-clamp-3">
                                {caseEntry.final_verdict.mycologist_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          <section
            ref={similarCasesSectionRef}
            className="relative px-8 md:px-16 lg:px-24 py-24 bg-[var(--background-color)] border-t border-[var(--primary-color)]/10"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.35em] uppercase text-[var(--accent-color)]/80 mb-2">
                    Linked Investigations
                  </p>
                  <h3 className="text-3xl md:text-4xl font-black font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] uppercase tracking-tight">
                    Similar Cases
                  </h3>
                </div>
                <div className="text-sm font-semibold text-[var(--primary-color)]/70">
                  {linkedCases.length} case{linkedCases.length === 1 ? '' : 's'} found
                </div>
              </div>

              {casesLoading ? (
                <div className="rounded-3xl border border-[var(--primary-color)]/15 bg-white/70 p-8 text-center text-[var(--primary-color)]/80 font-semibold">
                  Loading linked cases...
                </div>
              ) : casesError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700 font-semibold">
                  Unable to load linked cases right now.
                </div>
              ) : linkedCases.length === 0 ? (
                <div className="rounded-3xl border border-[var(--primary-color)]/15 bg-white/70 p-8 text-center text-[var(--primary-color)]/80">
                  No linked resolved cases yet for this WikiMold article.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {linkedCases.map((entry, idx) => (
                    <button
                      key={entry.id || `${entry.name || 'case'}-${idx}`}
                      type="button"
                      onClick={() => openLinkedCase(entry)}
                      className="text-left rounded-2xl border border-[var(--primary-color)]/15 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="font-[family-name:var(--font-montserrat)] font-black text-lg text-[var(--primary-color)] truncate">
                          {entry.name || 'Unnamed Case'}
                        </p>
                        <span className="shrink-0 text-[11px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-[var(--accent-color)]/15 text-[var(--accent-color)]">
                          {(entry.is_archived ?? true) ? 'Resolved' : 'In Progress'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--moldify-black)]/75 mb-1">
                        Verdict: {entry.final_verdict?.moldName || 'Not available'}
                      </p>
                      <p className="text-sm text-[var(--moldify-black)]/65 mb-4">
                        Date: {formatCaseDate(entry)}
                      </p>
                      <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--accent-color)]">
                        Open Case
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Explore Similar Cases Button */}
          <div className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 transition-opacity duration-300 ${showExploreCasesCta ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              type="button"
              onClick={scrollToLinkedCases}
              className="group relative flex items-center gap-4 bg-[var(--accent-color)]/10 backdrop-blur-md border border-[var(--accent-color)]/30 p-2 pr-6 rounded-full transition-all duration-500 hover:bg-[var(--accent-color)]/20 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]"
            >
              
              <div className="absolute inset-0 rounded-full border border-[var(--accent-color)]/50 animate-pulse group-hover:hidden" />

              <div className="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg">
                <FontAwesomeIcon icon={faCompass} className="text-sm" />
              </div>

              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] opacity-80 mb-1">
                  Explore
                </span>
                <span className="text-[13px] font-bold text-[var(--primary-color)] tracking-tight font-[family-name:var(--font-montserrat)]">
                  Similar Cases
                </span>
              </div>

              <div className="w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-500">
                <FontAwesomeIcon icon={faArrowRight} className="text-xs text-[var(--accent-color)]" />
              </div>
            </button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}