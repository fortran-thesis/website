"use client";
import { useState, useEffect, useMemo } from 'react'; 
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import Footer from '@/components/footer';
import { useMoldipediaArticle, useMoldipediaCases, type MoldipediaArticle, type MoldCaseSummary } from '@/hooks/swr';
import { CollapsibleEntry } from '../../../../components/wikimold/collapsible-entry';
import TopLoadingBar from '@/components/loading/top_loading_bar';
import PageLoading from '@/components/loading/page_loading';

// --- Default Placeholders ---
const DEFAULT_BANNER = "/assets/mold.jpg";
const DEFAULT_AUTHOR = "/assets/default-fallback.png";
const DEFAULT_CASE_THUMB = "/assets/mold.jpg";

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
  
  // SWR: fetch article
  const { data: articleRes, isLoading: loading, error: swrError } = useMoldipediaArticle(id as string | undefined);
  const { data: casesRes, isLoading: casesLoading } = useMoldipediaCases(id as string | undefined);
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
      findings: Array.isArray(data.findings)
        ? data.findings
            .map((item) => ({
              title: (item?.title || 'Untitled Stage').toString(),
              content: (item?.content || '').toString(),
            }))
            .filter((item) => item.title.trim().length > 0 || item.content.trim().length > 0)
        : [],
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

  const [activeTreatment, setActiveTreatment] = useState(0);
  const [expandedPathogenItems, setExpandedPathogenItems] = useState<Record<number, boolean>>({});
  const [isPreventionExpanded, setIsPreventionExpanded] = useState(false);

  // Helper: Check if content is long enough to warrant expanding
  const isContentLong = (html: string): boolean => {
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 300; // Show button if more than 300 characters
  };

  const togglePathogenItem = (index: number) => {
    setExpandedPathogenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({});

  const getCaseKey = (entry: MoldCaseSummary, index: number): string => {
    const idValue = (entry.id || '').trim();
    if (idValue) return idValue;
    const reportValue = (entry.mold_report_id || '').trim();
    if (reportValue) return reportValue;
    return `case-${index}`;
  };

  const toggleCase = (caseKey: string) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseKey]: !prev[caseKey],
    }));
  };

  const asText = (...values: unknown[]): string => {
    for (const value of values) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) return trimmed;
        continue;
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }

      if (Array.isArray(value)) {
        const joined = value.map((item) => asText(item)).filter(Boolean).join(', ');
        if (joined) return joined;
      }
    }

    return '';
  };

  const isMissingCropLabel = (value: string): boolean => {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[.:]+$/g, '');

    return [
      '',
      'unknown',
      'unknown crop',
      'n/a',
      'na',
      'none',
      'null',
      'undefined',
      'not available',
      'not specified',
      'pending',
      'tbd',
    ].includes(normalized);
  };

  const asCanonicalCrop = (...values: unknown[]): string => {
    for (const value of values) {
      const text = asText(value);
      if (!text) continue;
      if (isMissingCropLabel(text)) continue;
      return text;
    }

    return '';
  };

  const asRecord = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return {};
  };

  const getRecordText = (
    record: Record<string, unknown> | null | undefined,
    fields: string[],
  ): string => {
    if (!record) return '';

    for (const field of fields) {
      const text = asText(record[field]);
      if (text) return text;
    }

    return '';
  };

  const parseDateValue = (value: unknown): number => {
    if (!value) return 0;
    if (typeof value === 'object' && value !== null && '_seconds' in value) {
      const seconds = (value as { _seconds?: unknown })._seconds;
      if (typeof seconds === 'number') return seconds * 1000;
    }

    const dateObj = new Date(String(value));
    return Number.isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
  };

  const normalizeLogType = (typeValue: unknown): string => {
    return asText(typeValue).toLowerCase().replace(/[_\s-]+/g, '');
  };

  const getLatestLogByType = (entry: MoldCaseSummary, type: 'vivo' | 'vitro'): Record<string, unknown> | null => {
    const rawLogs = Array.isArray(entry.cultivation_logs) ? entry.cultivation_logs : [];

    const matching = rawLogs
      .filter((log) => {
        const normalized = normalizeLogType(log.type);
        if (type === 'vivo') return normalized === 'vivo' || normalized === 'invivo';
        return normalized === 'vitro' || normalized === 'invitro';
      })
      .sort((a, b) => {
        const aTime = parseDateValue(a.created_at ?? a.metadata?.created_at);
        const bTime = parseDateValue(b.created_at ?? b.metadata?.created_at);
        return bTime - aTime;
      });

    if (matching.length === 0) return null;
    return asRecord(matching[0]);
  };

  const getCaseRouteId = (entry: MoldCaseSummary): string => {
    return asText(entry.mold_report_id, entry.id);
  };

  const getCaseThumbnail = (entry: MoldCaseSummary): string => {
    const cultivation = asRecord(entry.cultivation_details);
    const imageCandidates = [
      asText(cultivation.initial_macroscopic_image_url),
      asText(cultivation.initial_microscopic_image_url),
      asText(entry.cover_photo),
      asText(entry.report_cover_photo),
    ].filter(Boolean);

    return imageCandidates[0] || DEFAULT_CASE_THUMB;
  };

  const pathogenItems = useMemo(
    () => [
      {
        title: 'Affected Hosts',
        summary: 'Expected host range and crop impact.',
        content: article?.affected_crops ?? '',
      },
      {
        title: 'Symptoms & Signs',
        summary: 'Expected visible symptoms and warning signs.',
        content: article?.symptoms ?? '',
      },
      {
        title: 'Transmission Cycle',
        summary: 'Expected spread and infection path.',
        content: article?.disease_cycle ?? '',
      },
      {
        title: 'Impact Analysis',
        summary: 'Expected severity and downstream damage.',
        content: article?.impact ?? '',
      },
    ],
    [article],
  );

  const fieldSporeSeeds = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        key: `spore-${i}`,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        opacityStart: Math.random() * 0.3,
        duration: Math.random() * 10 + 10,
      })),
    [],
  );

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
        <TopLoadingBar />
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <PageLoading message="Loading article..." />
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

      {/* --- GLOBAL FLOATING LEAF ACCENTS --- */}
      <div className="absolute inset-0 pointer-events-none z-[2] overflow-visible">
        <motion.div
          className="absolute top-[6%] left-[2%] opacity-[0.12]"
          animate={{ y: [0, 12, 0], rotate: [-4, 2, -4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={95} height={95} className="grayscale -scale-x-100" />
        </motion.div>

        <motion.div
          className="absolute top-[14%] right-[4%] opacity-[0.14]"
          animate={{ y: [0, -10, 0], rotate: [-2, 4, -2] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={120} height={120} className="grayscale" />
        </motion.div>

        <motion.div
          className="absolute top-[30%] left-[6%] opacity-[0.12] hidden md:block"
          animate={{ y: [0, 14, 0], rotate: [3, -3, 3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={140} height={140} className="grayscale -scale-x-100" />
        </motion.div>

        <motion.div
          className="absolute top-[44%] right-[7%] opacity-[0.13]"
          animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={105} height={105} className="grayscale" />
        </motion.div>

        <motion.div
          className="absolute top-[58%] left-[3%] opacity-[0.11] hidden lg:block"
          animate={{ y: [0, 10, 0], rotate: [-3, 2, -3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={125} height={125} className="grayscale -scale-x-100" />
        </motion.div>

        <motion.div
          className="absolute top-[72%] right-[12%] opacity-[0.13]"
          animate={{ y: [0, -9, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={98} height={98} className="grayscale" />
        </motion.div>

        <motion.div
          className="absolute bottom-[18%] left-[10%] opacity-[0.12] hidden md:block"
          animate={{ y: [0, 8, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={110} height={110} className="grayscale" />
        </motion.div>

        <motion.div
          className="absolute bottom-[6%] right-[18%] opacity-[0.14] hidden lg:block"
          animate={{ y: [0, -7, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Image src="/assets/leaf.svg" alt="decorative leaf" width={130} height={130} className="grayscale -scale-x-100" />
        </motion.div>
      </div>

      <main className="flex-grow relative z-10">
        {/* --- HERO BANNER SECTION  --- */}
        <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
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
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-[var(--accent-color)]/15 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div className="relative z-10">
              <ProseContent 
                html={article.content} 
                className="text-xl text-[var(--moldify-black)] font-[family-name:var(--font-bricolage-grotesque)] leading-relaxed text-left"
              />
            </motion.div>
          </section>

          {/* --- 3. AGRICULTURAL INFO --- */}
          <section className="mb-30 relative max-w-5xl mx-auto">
            <SectionHeader 
              number="02" 
              title="Host & Pathogen Impact" 
              subtitle="Technical Analysis & Observations" 
            />

            {/* Main content */}
            <div className="space-y-4 relative">
              {pathogenItems.map((item, index) => {
                const isLong = isContentLong(item.content);
                const isExpanded = expandedPathogenItems[index] || false;
                
                return (
                <CollapsibleEntry
                  key={index}
                  number={`0${index + 1}`}
                  title={item.title}
                  description={item.summary}
                  isExpanded={isExpanded}
                  onToggle={() => togglePathogenItem(index)}
                  className=""
                  bodyClassName="text-[var(--moldify-black)]/80"
                >
                  <ProseContent html={item.content} className="text-lg leading-relaxed text-[var(--primary-color)]/70 font-light" />
                </CollapsibleEntry>
                );
              })}
            </div>
          </section>
          
        {/* --- 02. PREVENTION & TREATMENT --- */}
          <section className="mb-30 relative max-w-5xl mx-auto">
            <SectionHeader number="03" title="Prevention & Treatment" />

            <CollapsibleEntry
              number="00"
              title="Prevention Summary"
              description="Expected steps to reduce infection."
              isExpanded={isPreventionExpanded}
              onToggle={() => setIsPreventionExpanded((prev) => !prev)}
              className="mb-6"
              bodyClassName="text-[var(--moldify-black)]/80"
            >
              <ProseContent
                html={article.prevention}
                className="text-lg leading-relaxed text-[var(--primary-color)]/70 font-light"
              />
            </CollapsibleEntry>
            
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
        <section className="mb-30 relative max-w-5xl mx-auto bg-transparent overflow-visible">
          {/* HIGH-DENSITY BIO-SPORE SWARM */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {fieldSporeSeeds.map((seed) => (
              <motion.div
                key={seed.key}
                initial={{ x: seed.x, y: seed.y, opacity: seed.opacityStart }}
                animate={{
                  y: ["-20%", "20%"],
                  x: ["-10%", "10%"],
                  opacity: [0.05, 0.3, 0.05]
                }}
                transition={{
                  duration: seed.duration,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-[2px] h-[2px] rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]"
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <SectionHeader 
                number="04" 
                title="Field Evidence" 
                subtitle="Correlated Fungal Investigations"
              />

              {/* SIDE-ALIGNED COUNTER */}
              {!casesLoading && (
                <div className="flex items-center gap-4 pb-2 border-b border-[var(--primary-color)]/10">
                  <div className="flex flex-col items-end">
                    <span className="font-[family-name:var(--font-montserrat)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] leading-none">Linked</span>
                    <span className="font-[family-name:var(--font-montserrat)] text-[9px] font-black uppercase tracking-[0.3em] text-[var(--primary-color)]/30 leading-none mt-1">Investigations</span>
                  </div>
                  <div className="relative">
                    <span className="font-[family-name:var(--font-montserrat)] font-black text-5xl text-[var(--primary-color)] tracking-tighter tabular-nums leading-none">
                      {linkedCases.length.toString().padStart(2, '0')}
                    </span>
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)] animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* INVESTIGATION LIST */}
            <div className="flex flex-col divide-y divide-[var(--primary-color)]/10">
              {casesLoading ? (
                <div className="py-24 flex items-center gap-4">
                  <div className="w-12 h-[2px] bg-[var(--accent-color)] animate-pulse" />
                  <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary-color)]/40">Synchronizing Archives</p>
                </div>
              ) : linkedCases.length === 0 ? (
                <div className="py-16 rounded-2xl border border-dashed border-[var(--primary-color)]/20 px-6">
                  <p className="font-[family-name:var(--font-montserrat)] text-[11px] font-black uppercase tracking-[0.25em] text-[var(--primary-color)]/40">
                    No Linked Investigations Yet
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-bricolage-grotesque)] text-base text-[var(--moldify-black)]/70">
                    Field evidence will appear here once reports are linked to this WikiMold entry.
                  </p>
                </div>
              ) : (
                linkedCases.map((entry, idx) => {
                  const caseKey = getCaseKey(entry, idx);
                  const isExpanded = !!expandedCases[caseKey];
                  const caseRouteId = getCaseRouteId(entry);
                  const caseHref = caseRouteId
                    ? `/investigation/view-case?id=${encodeURIComponent(caseRouteId)}&entityType=mold_report`
                    : '';
                  const caseThumb = getCaseThumbnail(entry);
                  
                  const initial = asRecord(entry.cultivation_details);
                  const evidenceSummary = asRecord(entry.evidence_summary);
                  const initialSummary = asRecord(evidenceSummary.initial);
                  const inVivoSummary = asRecord(evidenceSummary.in_vivo);
                  const inVitroSummary = asRecord(evidenceSummary.in_vitro);
                  const inVivo = getLatestLogByType(entry, 'vivo') ?? {};
                  const inVitro = getLatestLogByType(entry, 'vitro') ?? {};
                  const inVivoCharacteristics = asRecord(inVivo.characteristics);
                  const inVitroCharacteristics = asRecord(inVitro.characteristics);
                  const inVivoSummaryCharacteristics = asRecord(inVivoSummary.characteristics);
                  const inVitroSummaryCharacteristics = asRecord(inVitroSummary.characteristics);
                  const inVivoAdditional = asText(
                    inVivo.additional_info,
                    inVivo.characteristics && asRecord(inVivo.characteristics).additional_info,
                  );
                  const inVitroAdditional = asText(
                    inVitro.additional_info,
                    inVitro.characteristics && asRecord(inVitro.characteristics).additional_info,
                  );
                  
                  const cropRecord = entry as Record<string, unknown>;
                  const reportRecord = asRecord(cropRecord.report);
                  const moldReportRecord = asRecord(cropRecord.mold_report);
                  const cropName =
                    asCanonicalCrop(
                      entry.crop_label,
                      cropRecord.common_name,
                      cropRecord.crop_name,
                      cropRecord.host_plant_affected,
                      cropRecord.host,
                      cropRecord.report_host,
                      reportRecord.host,
                      reportRecord.host_plant_affected,
                      moldReportRecord.host,
                      moldReportRecord.host_plant_affected,
                      cropRecord.crop,
                    ) ||
                    'Crop Not Specified';
                  
                  const sections = [
                    {
                      label: "[01] Initial Observation",
                      content: [
                        getRecordText(initialSummary, ['microscopic', 'macroscopic']),
                        getRecordText(initialSummary, ['symptoms', 'characteristics']),
                        getRecordText(initial, [
                          'initial_microscopic',
                          'initial_macroscopic',
                          'initial_symptoms',
                          'initial_characteristics',
                          'initial_macroscopic_symptoms',
                          'initial_macroscopic_characteristics',
                        ]),
                      ].filter(Boolean).join(' // ') || 'Observation metadata incomplete.',
                    },
                    {
                      label: "[02] In Vivo Analysis",
                      content: [
                        getRecordText(inVivoCharacteristics, ['symptoms', 'characteristics', 'lesion_color', 'lesion_size']),
                        getRecordText(inVivoSummaryCharacteristics, ['symptoms', 'characteristics', 'lesion_color', 'lesion_size']),
                        inVivoAdditional,
                      ].filter(Boolean).join(' // ') || 'No active bio-logs.',
                    },
                    {
                      label: "[03] In Vitro Results",
                      content: [
                        getRecordText(inVitroCharacteristics, ['characteristics', 'colony_color', 'colony_diameter']),
                        getRecordText(inVitroSummaryCharacteristics, ['characteristics', 'colony_color', 'colony_diameter']),
                        inVitroAdditional,
                      ].filter(Boolean).join(' // ') || 'Laboratory culture pending.',
                    },
                  ];

                  return (
                    <div key={caseKey} className={`group pb-12 transition-all duration-700 relative ${isExpanded ? 'bg-[var(--primary-color)]/[0.01]' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="flex flex-col">
                          <span className="font-[family-name:var(--font-montserrat)] font-black text-[10px] text-[var(--accent-color)] tracking-[0.3em] uppercase block mb-1">Crop Name</span>
                          <h4 className="font-[family-name:var(--font-montserrat)] font-black text-3xl text-[var(--primary-color)] uppercase tracking-tight">
                            {cropName} <span className="opacity-20 ml-2 font-light text-xl italic tabular-nums">{caseKey.slice(-6)}</span>
                          </h4>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => toggleCase(caseKey)}
                          className={`cursor-pointer px-8 py-3 transition-all duration-500 rounded-full font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-[0.4em] ${
                            isExpanded ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' : 'bg-transparent border border-[var(--primary-color)]/20 text-[var(--primary-color)] hover:border-[var(--primary-color)]'
                          }`}
                        >
                          {isExpanded ? 'Close Case' : 'View Case'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <div className="mt-12 space-y-6 pl-6 relative">
                              {/* Investigation Line Spores */}
                              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--accent-color)]/40 via-[var(--accent-color)]/10 to-transparent" />
                              {[0, 50, 95].map((pos) => (
                                <div key={pos} className="absolute left-[-3.5px] w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" style={{ top: `${pos}%` }} />
                              ))}
                              
                              {sections.map((section, sIdx) => (
                                <div key={sIdx} className="relative group/card">
                                  <div className="p-8 rounded-2xl bg-[var(--primary-color)]/[0.02] border border-[var(--primary-color)]/5 backdrop-blur-sm transition-all duration-500 hover:bg-[var(--primary-color)]/[0.04] hover:border-[var(--accent-color)]/20">
                                    <label className="block font-[family-name:var(--font-montserrat)] text-[9px] font-black uppercase tracking-[0.5em] text-[var(--accent-color)] mb-4 opacity-70">
                                      {section.label}
                                    </label>
                                    <p className="font-[family-name:var(--font-bricolage-grotesque)] text-lg leading-relaxed text-[var(--primary-color)]/80 font-medium">
                                      {section.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
          
        </article>
      </main>
      <Footer />
    </div>
  );
}