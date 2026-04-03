"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboard,
  faTriangleExclamation,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useReport } from '@/hooks/swr';
import BackButton from "@/components/buttons/back_button";
// Use standard img elements here to avoid Next.js Image domain config issues
import StatusBox from "@/components/tiles/status_tile";
import ConfirmModal from "@/components/modals/confirmation_modal";
import RequestRevisionModal from "@/components/modals/request_revision_modal";

const EMPTY_HTML_FALLBACK = '<p>N/A</p>';

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toHtmlContent(value: string, fallback = EMPTY_HTML_FALLBACK): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (looksLikeHtml(trimmed)) return trimmed;
  return `<p>${escapeHtml(trimmed).replace(/\n/g, '<br />')}</p>`;
}

function ProseContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div className={`prose prose-xl max-w-none text-justify ${className}`}>
      <style>{`
        .prose {
          max-width: none !important;
          text-align: justify !important;
          text-justify: inter-word;
        }
        .prose p,
        .prose li,
        .prose blockquote,
        .prose td,
        .prose th {
          text-align: justify !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          hyphens: auto;
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
}

export default function ViewReport() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ViewReportContent />
    </Suspense>
  );
}

function ViewReportContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  // SWR: fetch report
  const { data: reportRes, isLoading: loading, error: swrError } = useReport(reportId ?? undefined);
  const reportData = reportRes?.data ?? null;
  const error = swrError ? (swrError instanceof Error ? swrError.message : 'Failed to load report') : null;

  const reportedUserName = useMemo(() => {
    const name = reportData?.content?.author
    if (!name) return '(N/A)';
    return typeof name === 'string' ? name : String(name);
  }, [reportData]);

  const reporterName = useMemo(() => {
    const name = reportData?.reporter?.name || reportData?.reporter_name || reportData?.reporter_id || reportData?.reporterId;
    if (!name) return 'N/A';
    return typeof name === 'string' ? name : String(name);
  }, [reportData]);

  const dateReported = useMemo(() => {
    const formatOpts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    if (reportData?.created_at) return new Date(reportData.created_at as string).toLocaleDateString(undefined, formatOpts);
    const metaDate = reportData?.metadata?.created_at;
    if (metaDate && typeof metaDate === 'object' && ('seconds' in metaDate || '_seconds' in metaDate)) {
      const secs = (metaDate._seconds ?? (metaDate as any).seconds) as number;
      return new Date(secs * 1000).toLocaleDateString(undefined, formatOpts);
    }
    return 'N/A';
  }, [reportData]);

  // Values derived from API response
  const userIssue = reportData?.reason || reportData?.title || 'Inappropriate Content Posted';
  const reasonDescription = reportData?.details || reportData?.description || '';
  const additionalInfo = reportData?.details || reportData?.description || '';

  const contentTitle = reportData?.content?.title || reportData?.title || reportData?.content?.name || 'Reported Content';
  const contentBody = reportData?.content?.body || reportData?.content?.description || '';
  const reportedContentHtml = useMemo(
    () => toHtmlContent(contentBody || reasonDescription, '<p>No content details provided.</p>'),
    [contentBody, reasonDescription],
  );
  const userRole = "Administrator";

  const defaultProfile = "/assets/default-fallback.png";
  const [imgSrc, setImgSrc] = useState<string | null>(reportData?.reported?.photo || reportData?.reported?.avatar || defaultProfile);
  const [hasImage, setHasImage] = useState(Boolean(reportData?.reported?.photo || reportData?.reported?.avatar));
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isReqRevisionsModalOpen, setIsReqRevisionsModalOpen] = useState(false);
  const [reportActionLoading, setReportActionLoading] = useState(false);
  const deriveStatus = (raw?: any) => {
    const s = raw || reportData?.status || reportData?.metadata?.status;
    if (!s) return 'Unresolved';
    const lower = String(s).toLowerCase();
    if (lower === 'resolved' || lower === 'rejected') return 'Resolved';
    return 'Unresolved';
  };

  const [reportStatus, setReportStatus] = useState<string>(deriveStatus());
  // Keep status in sync if the fetched report includes a status
  useEffect(() => {
    setReportStatus(deriveStatus());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData]);

  // Update images when report data arrives
  useEffect(() => {
    if (!reportData) return;
    const profile = reportData?.reported?.photo || reportData?.reported?.avatar || null;
    const contentImage = reportData?.content?.cover_photo
    if (contentImage) {
      setImgSrc(contentImage);
      setHasImage(true);
    } else if (profile) {
      setImgSrc(profile);
      setHasImage(true);
    } else {
      setImgSrc(defaultProfile);
      setHasImage(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData]);
  const [isResolved, setIsResolved] = useState(false); 

  const imageSrc = reportData?.image || reportData?.image_url || reportData?.content?.image || reportData?.content?.cover_photo || (hasImage ? imgSrc : null) || null;

  /** Handles rejecting a report */
  const handleReject = async () => {
    setReportStatus("Rejected");
    setRejectModalOpen(false);
    setIsResolved(true);
  };

  /** Handles requesting revision with additional details */
  const handleSubmit = async (details: string) => {
    setReportActionLoading(true);
    try {
      setReportStatus("Revision Requested");
      setIsReqRevisionsModalOpen(false);
      setIsResolved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setReportActionLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full max-w-none overflow-x-visible">
      {/* Header Section */}
      <div className="flex flex-row justify-between mb-10">
        <div className="flex flex-col">
          <Breadcrumbs role={userRole} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
            REPORTS
          </h1>
        </div>
      </div>

      <BackButton />

      {loading && <p className="text-center">Loading report...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && (
        <>

      {/* User Info */}
      <div className="flex flex-col lg:flex-row w-full gap-12 items-start py-10 border-b border-[var(--primary-color)]/10">
  
        {/* 1. Subject Profile - Circular & Floating */}
        <div className="relative flex-shrink-0">
          <div className={`w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 
            ${reportedUserName === '(N/A)' ? 'border-[var(--moldify-red)]/30' : 'border-white'}`}>
            <img
              src={imgSrc ?? "/assets/default-fallback.png"}
              alt="profile picture"
              className="object-cover w-full h-full rounded-full"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                if (t.src !== '/assets/default-fallback.png') t.src = '/assets/default-fallback.png';
              }}
            />
          </div>
          {/* Subtle Glow Ring */}
          <div className="absolute -inset-2 border border-[var(--primary-color)]/10 rounded-full animate-[spin_20s_linear_infinite]" />
        </div>

        {/* 2. Content Architecture */}
        <div className="flex flex-col w-full">
          
          {/* Top Label & Identity */}
          <div className="flex flex-col gap-1 mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary-color)] opacity-30 font-[family-name:var(--font-bricolage-grotesque)]">
              Reported User
            </span>
            <div className="flex flex-wrap items-center gap-6">
              <h1 className="font-[family-name:var(--font-montserrat)] text-5xl font-black text-[var(--primary-color)] tracking-tighter leading-none">
                {reportedUserName === '(N/A)' ? (
                  <span className="text-[var(--moldify-red)]">{reportedUserName}</span>
                ) : (
                  reportedUserName
                )}
              </h1>
              <StatusBox status={isResolved ? "Resolved" : reportStatus} />
            </div>
          </div>

          {/* 3. The Dual Registry Bar (Everything included) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-6 border-t border-b border-[var(--primary-color)]/[0.05]">
            
            {/* Reporter Info */}
            <div className="flex flex-col gap-1.5 border-l-2 border-[var(--accent-color)] pl-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-30">Reporter</span>
              <h2 className="text-[15px] font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                {reporterName}
              </h2>
            </div>

            {/* Date Info */}
            <div className="flex flex-col gap-1.5 border-l-2 border-[var(--primary-color)]/10 pl-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-30">Date Reported</span>
              <h2 className="text-[15px] font-bold text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                {dateReported}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className="flex flex-col lg:flex-row w-full gap-12 mt-12 items-start">
  
        {/* LEFT SIDE: Management & Context */}
        <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-8 sticky top-8">
          
          {/* 1. Status & Action Area */}
          <div className="flex flex-col gap-3">
            {reportStatus === "Rejected" ? (
              <div className="group flex items-center gap-4 p-5 rounded-3xl bg-[var(--moldify-red)]/[0.05] border border-[var(--moldify-red)]/10 transition-all duration-300 hover:bg-[var(--moldify-red)]/[0.08]">
                <div className="w-11 h-11 rounded-2xl bg-[var(--moldify-red)]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-[var(--moldify-red)] text-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-bricolage-grotesque)] font-black text-[10px] uppercase tracking-[0.2em] text-[var(--moldify-red)] opacity-60">Status</span>
                  <span className="font-[family-name:var(--font-bricolage-grotesque)] font-black text-sm uppercase tracking-tight text-[var(--moldify-red)]">
                      Report Rejected
                  </span>
                </div>
              </div>
            ) : reportStatus === "Revision Requested" ? (
              <div className="group flex items-center gap-4 p-5 rounded-3xl bg-[var(--primary-color)]/[0.05] border border-[var(--primary-color)]/10 transition-all duration-300 hover:bg-[var(--primary-color)]/[0.08]">
                <div className="w-11 h-11 rounded-2xl bg-[var(--primary-color)]/10 flex items-center justify-center shrink-0 shadow-sm">
                  <FontAwesomeIcon icon={faClipboard} className="text-[var(--primary-color)] text-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-bricolage-grotesque)] font-black text-[10px] uppercase tracking-[0.2em] text-[var(--primary-color)] opacity-60">Status</span>
                  <span className="font-[family-name:var(--font-bricolage-grotesque)] font-black text-sm uppercase tracking-tight text-[var(--primary-color)]">
                      Revision Pending
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full py-4 rounded-2xl bg-[var(--primary-color)] text-[var(--background-color)] font-[family-name:var(--font-bricolage-grotesque)] font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_15px_25px_rgba(0,0,0,0.15)] transition-all active:scale-[0.98] cursor-pointer"
                  onClick={() => setIsReqRevisionsModalOpen(true)}
                >
                  Request Revision
                </button>
                <button
                  type="button"
                  className="w-full py-4 rounded-2xl bg-transparent border-2 border-[var(--moldify-red)]/30 text-[var(--moldify-red)] font-[family-name:var(--font-bricolage-grotesque)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--moldify-red)] hover:border-[var(--moldify-red)] hover:text-[var(--background-color)] transition-all active:scale-[0.98] cursor-pointer"
                  onClick={() => setRejectModalOpen(true)}
                >
                  Reject Report
                </button>
              </div>
            )}
          </div>

          {/* 2. Issue Details Module */}
          <div className="flex flex-col gap-6 p-8 rounded-[2.5rem] bg-[var(--primary-color)]/[0.02] border border-[var(--primary-color)]/[0.06] backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--primary-color)] opacity-30">Categorized_Issue</p>
              <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black text-[var(--primary-color)] tracking-tighter leading-tight">
                {userIssue}
              </h2>
            </div>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-10" />

            <div className="flex flex-col gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--primary-color)] opacity-30">Audit_Notes</p>
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[14px] text-[var(--moldify-black)] leading-relaxed opacity-70 italic border-l-2 border-[var(--primary-color)]/10 pl-4">
                {additionalInfo || 'No additional information provided by reporter.'}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Content Preview */}
        <div className="flex-grow min-w-0 bg-[var(--taupe)] rounded-[3rem] border border-[var(--primary-color)]/[0.08] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
          
          {/* Evidence Header */}
          <div className="relative w-full aspect-[21/9] bg-[var(--moldify-softGrey)] overflow-hidden group">
            {imageSrc ? (
              <>
                <img
                  src={imageSrc}
                  alt="Report evidence"
                  className="object-cover w-full h-full grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out"
                  onError={(e) => {
                    setHasImage(false);
                    const t = e.target as HTMLImageElement;
                    t.style.display = 'none';
                  }}
                />
                {/* Subtle Vignette for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--primary-color)] opacity-10">
                <FontAwesomeIcon icon={faImage} className="text-5xl mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Evidence_Missing</p>
              </div>
            )}
            
          
          </div>

          {/* Content Body */}
          <div className="p-12 lg:p-20">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex flex-col gap-2 mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--primary-color)] opacity-20">Content Reported</span>
                <h2 className="font-[family-name:var(--font-montserrat)] text-5xl font-black text-[var(--primary-color)] tracking-tighter leading-[0.9] lg:text-6xl">
                  {contentTitle}
                </h2>
              </div>
              
              <div className="prose prose-lg max-w-none font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] leading-[1.8] opacity-80 text-justify">
                <ProseContent html={reportedContentHtml} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <ConfirmModal
        isOpen={isRejectModalOpen}
        title="Are you sure you want to reject this report?"
        subtitle="This action is permanent and cannot be undone."
        cancelText="Cancel"
        confirmText="Yes"
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
      />

      <RequestRevisionModal
        isOpen={isReqRevisionsModalOpen}
        onClose={() => setIsReqRevisionsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={reportActionLoading}
        reasonTitle={userIssue}
        reasonDescription={reasonDescription}
      />
        </>
      )}
    </main>
  );
}
