/**
 * FAQ Page — React Server Component
 *
 * Fetches FAQs directly from the backend at build/ISR time (revalidates
 * every 5 minutes), then passes the data to the client component for
 * search filtering and animations.
 *
 * Benefits over the previous "use client" + SWR approach:
 *   - Zero client-side fetch on initial load (no loading spinner)
 *   - ISR cache shared across all visitors
 *   - Smaller client JS bundle (no SWR overhead for this page)
 */

import { serverFetch } from '@/lib/server-fetch';
import { endpoints } from '@/services/endpoints';
import FaqClient, { type FaqEntry } from './faq-client';

/* ISR: regenerate this page at most every 5 minutes */
export const revalidate = 300;

/* ------------------------------------------------------------------ */
/*  Fallback data (used when the backend is unreachable)               */
/* ------------------------------------------------------------------ */

const fallbackFaqs: FaqEntry[] = [
  { id: 1, q: "What is Moldify?", a: "Moldify is an AI-powered investigation system designed for early detection and analysis of agricultural mold to protect crops." },
  { id: 2, q: "How does the detection work?", a: "We use machine learning models trained on thousands of crop images to identify mold patterns before they are visible to the naked eye." },
  { id: 3, q: "Is it applicable for all crops?", a: "Currently, we specialize in high-value crops like rice, corn, and cacao, but we are expanding our database to include more varieties." },
  { id: 4, q: "How accurate is the mold detection?", a: "Our current models achieve a 95% accuracy rate in controlled environments and continue to learn from real-world data inputs." },
  { id: 5, q: "Do I need special hardware to use Moldify?", a: "No, Moldify is designed to work with standard high-resolution cameras and smartphone lenses, making it accessible for local farmers." },
  { id: 6, q: "Can it detect mold in stored grains?", a: "Yes, Moldify can analyze surface mold in storage facilities and silos, provided there is adequate lighting for image capture." },
  { id: 7, q: "Is an internet connection required?", a: "An internet connection is needed to sync data and run the heavy AI analysis, but we are developing an 'Offline Lite' version for remote areas." },
  { id: 8, q: "How fast are the results generated?", a: "Once an image is uploaded, the analysis typically takes between 3 to 10 seconds depending on your connection speed." },
  { id: 9, q: "What kind of molds can the system identify?", a: "We currently identify common agricultural threats such as Aflatoxin-producing molds, Downy Mildew, and Powdery Mildew." },
  { id: 10, q: "How do I sign up for an account?", a: "You can click the 'Log In' button in the navbar and select 'Register' to start your journey with Moldify." },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Defensively extract FAQ array from the backend's various response shapes. */
function extractFaqs(data: unknown): FaqEntry[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  // data.data (double-nested)
  if ('data' in d && Array.isArray(d.data)) return d.data;
  // data.snapshot (paginated)
  if ('snapshot' in d && Array.isArray(d.snapshot)) return d.snapshot;
  // plain array
  if (Array.isArray(data)) return data;
  return [];
}

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default async function FaqPage() {
  let faqs: FaqEntry[] = fallbackFaqs;

  try {
    const res = await serverFetch<Record<string, unknown>>(endpoints.faq.list, {
      revalidate: 300,
      tags: ['faqs'],
    });

    if (res?.data) {
      const extracted = extractFaqs(res.data);
      if (extracted.length > 0) faqs = extracted;
    }
  } catch {
    // Fallback data is already set
  }

  return <FaqClient initialFaqs={faqs} />;
}