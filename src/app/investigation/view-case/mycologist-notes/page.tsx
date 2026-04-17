"use client";

import { Fragment, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { faArrowRight, faArrowUp, faBookOpen, faFileSignature, faMicroscope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import PageLoading from "@/components/loading/page_loading";
import { useAuth } from "@/hooks/useAuth";
import { useMoldCase, useMoldCaseByReport, useMoldReport, useUser } from "@/hooks/swr";

function MycologistNotesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resourceId = searchParams.get("id") ?? undefined;
  const { user: authUser } = useAuth();

  const rawRole = (authUser?.user?.role || authUser?.role || "").toLowerCase();
  const userRole = rawRole === "mycologist" ? "Mycologist" : "Administrator";

  const { data: moldCaseByIdRes, isLoading: moldCaseByIdLoading } = useMoldCase(resourceId);
  const reportId = moldCaseByIdRes?.data?.mold_report_id || resourceId;

  const { data: reportRes, isLoading: reportLoading } = useMoldReport(reportId);
  const { data: moldCaseRes, isLoading: moldCaseByReportLoading } = useMoldCaseByReport(reportId);

  const caseData = reportRes?.data ?? null;
  const moldCase = moldCaseRes?.data ?? moldCaseByIdRes?.data ?? null;
  const mycologistId = caseData?.assigned_mycologist_id;
  const { data: mycologistRes } = useUser(mycologistId);

  const loading = reportLoading || moldCaseByIdLoading || moldCaseByReportLoading;
  const error = !resourceId ? "No case ID provided" : null;
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pageContentRef = useRef<HTMLElement | null>(null);

  const asText = (...values: unknown[]): string => {
    for (const value of values) {
      if (value === null || value === undefined) continue;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length > 0) return trimmed;
        continue;
      }
      if (typeof value === "number") return String(value);
      if (typeof value === "boolean") return value ? "true" : "false";
      if (Array.isArray(value)) {
        const joined = value.map((item) => asText(item)).filter(Boolean).join(", ");
        if (joined.length > 0) return joined;
      }
    }
    return "";
  };

  const toDate = (v: string | { _seconds: number } | undefined): Date | null => {
    if (!v) return null;
    if (typeof v === "string") return new Date(v);
    return new Date(v._seconds * 1000);
  };

  const confidenceText = (rawConfidence: unknown): string => {
    if (rawConfidence === null || rawConfidence === undefined) return "";
    if (typeof rawConfidence === "number") {
      const value = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
      return `${Math.round(value)}%`;
    }

    const text = asText(rawConfidence);
    if (!text) return "";
    return text.includes("%") ? text : `${text}%`;
  };

  const finalVerdict = moldCase?.final_verdict;
  const finalVerdictMoldName = asText(finalVerdict?.moldName, finalVerdict?.moldId);
  const finalVerdictConfidence = confidenceText(finalVerdict?.confidence);
  const finalVerdictWikiMoldId = asText(finalVerdict?.moldipedia_id);
  const finalVerdictNotes = asText(finalVerdict?.mycologist_notes);
  const finalVerdictTimestamp = (() => {
    const d = toDate(finalVerdict?.verdict_timestamp as string | { _seconds: number } | undefined);
    return d
      ? d.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";
  })();
  const finalVerdictWikiMoldHref = finalVerdictWikiMoldId
    ? `/wikimold/view-wikimold/${encodeURIComponent(finalVerdictWikiMoldId)}`
    : "";

  const caseName = caseData?.case_name || (loading ? "Loading..." : "N/A");
  const status = caseData?.status ? caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1) : "Pending";
  const assignedMycologistName =
    mycologistRes?.data?.details?.displayName
    || mycologistRes?.data?.user?.displayName
    || moldCase?.mycologist_name
    || "Assigned Specialist";
  const assignedMycologistOccupation = mycologistRes?.data?.user?.occupation || "Mycologist";

  const noteSectionLabels = [
    "AFFECTED CROPS / HOSTS",
    "SYMPTOMS & SIGNS",
    "DISEASE CYCLE / SPREAD",
    "MECHANICAL CONTROL",
    "CULTURAL CONTROL",
    "BIOLOGICAL CONTROL",
    "PHYSICAL CONTROL",
    "CHEMICAL CONTROL",
    "HEALTH RISKS",
    "DESCRIPTION",
    "OVERVIEW",
    "IMPACT",
    "PREVENTION",
  ];

  const sanitizeNoteText = (value: string): string => {
    return value.replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "").trim();
  };

  const normalizeListItemText = (value: string): string => {
    let text = sanitizeNoteText(value);
    text = text.replace(/^\[(?:\s|x|X)\]\s*/, "");
    text = text.replace(/^[-–—*•●◦▪▫◾◽◻◼□■☐☑✓]+\s*/, "");
    return sanitizeNoteText(text);
  };

  const extractBulletItems = (text: string): string[] => {
    const trimmed = text.trim();
    if (!trimmed) return [];

    if (/[•●◦]/.test(trimmed)) {
      return trimmed
        .split(/[•●◦]/)
        .map((item) => sanitizeNoteText(item))
        .filter(Boolean);
    }

    const dashedItems = trimmed
      .split(/\s+-\s+/)
      .map((item) => sanitizeNoteText(item))
      .filter(Boolean);

    // Avoid splitting explanatory phrases like
    // "Otomycosis (...) - pain, temporary hearing loss..." into separate bullets.
    if (dashedItems.length >= 3) {
      return dashedItems;
    }

    if (dashedItems.length === 2) {
      const secondStartsLowercase = /^[a-z]/.test(dashedItems[1]);
      const secondLooksExplanatory = /^(rare|pain|sneezing|coughing|causes|may|can|occurs|associated|with)\b/i.test(dashedItems[1]);

      if (!secondStartsLowercase && !secondLooksExplanatory) {
        return dashedItems;
      }
    }

    return [];
  };

  const renderNotesWithEmphasizedLabels = (notes: string) => {
    const sortedLabels = [...noteSectionLabels].sort((a, b) => b.length - a.length);
    const lines = notes.split(/\r?\n/);
    const rendered: ReactNode[] = [];

    const isSectionHeaderLine = (value: string): boolean => {
      return sortedLabels.some((label) => {
        const regex = new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(?:\\s*:)?`, "i");
        return regex.test(value);
      });
    };

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        rendered.push(<div key={`note-gap-${index}`} className="h-4" />);
        continue;
      }

      const matchedLabel = sortedLabels.find((label) => {
        const regex = new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(?:\\s*:)?`, "i");
        return regex.test(line);
      });

      if (matchedLabel) {
        const lineRegex = new RegExp(`^(\\s*)(${matchedLabel.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})(\\s*:?)`, "i");
        const match = line.match(lineRegex);

        if (!match) {
          rendered.push(<p key={`note-line-${index}`}>{sanitizeNoteText(line)}</p>);
          continue;
        }

        const leading = match[1] ?? "";
        const labelText = `${match[2] ?? ""}${match[3] ?? ""}`;
        const rest = sanitizeNoteText(line.slice(match[0].length));

        rendered.push(
          <p key={`note-line-${index}`}>
            {leading}
            <strong className="font-[family-name:var(--font-montserrat)] font-black uppercase tracking-[0.02em] text-[var(--primary-color)]">
              {labelText}
            </strong>
          </p>,
        );

        const sectionItems: string[] = [];
        let currentItem = "";
        let cursor = index + 1;

        const appendItem = (value: string) => {
          const clean = normalizeListItemText(value);
          if (clean) sectionItems.push(clean);
        };

        const handleChunk = (chunk: string, forceNewItem: boolean) => {
          const cleanChunk = normalizeListItemText(chunk);
          if (!cleanChunk) return;

          const inline = extractBulletItems(cleanChunk);
          if (inline.length > 1) {
            if (currentItem) {
              appendItem(currentItem);
              currentItem = "";
            }
            inline.forEach((item) => appendItem(item));
            return;
          }

          if (forceNewItem) {
            if (currentItem) appendItem(currentItem);
            currentItem = cleanChunk;
            return;
          }

          if (!currentItem) {
            currentItem = cleanChunk;
            return;
          }

          if (/^[a-z]/.test(cleanChunk)) {
            currentItem = `${currentItem} ${cleanChunk}`;
            return;
          }

          appendItem(currentItem);
          currentItem = cleanChunk;
        };

        if (rest) {
          handleChunk(rest, false);
        }

        while (cursor < lines.length) {
          const rawLine = lines[cursor];
          const trimmed = rawLine.trim();

          if (isSectionHeaderLine(rawLine)) {
            break;
          }

          if (!trimmed) {
            if (currentItem) {
              appendItem(currentItem);
              currentItem = "";
            }
            cursor += 1;
            continue;
          }

          const bulletMatch = trimmed.match(/^[-*•●◦]\s+(.+)$/);
          const candidate = bulletMatch ? bulletMatch[1] : trimmed;
          handleChunk(candidate, Boolean(bulletMatch));
          cursor += 1;
        }

        if (currentItem) {
          appendItem(currentItem);
        }

        if (sectionItems.length > 1) {
          rendered.push(
            <ul key={`section-list-${index}`} className="mt-2 pl-7 list-disc list-inside space-y-1 text-[0.95em] leading-[1.9]">
              {sectionItems.map((item, itemIndex) => (
                <li key={`section-list-${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>,
          );
        } else if (sectionItems.length === 1) {
          rendered.push(
            <p key={`note-body-${index}`} className="mt-1 pl-7">
              {sectionItems[0]}
            </p>,
          );
        }

        index = cursor - 1;
        continue;
      }

      const bulletMatch = trimmedLine.match(/^[-*•●◦]\s+(.+)$/);
      if (!bulletMatch) {
        rendered.push(<p key={`note-line-${index}`}>{sanitizeNoteText(line)}</p>);
        continue;
      }

      const bulletItems: string[] = [];
      let cursor = index;

      while (cursor < lines.length) {
        const currentTrimmed = lines[cursor].trim();
        const currentMatch = currentTrimmed.match(/^[-*•●◦]\s+(.+)$/);
        if (!currentMatch) break;
        bulletItems.push(currentMatch[1].trim());
        cursor += 1;
      }

      rendered.push(
        <ul key={`note-list-${index}`} className="pl-7 list-disc list-inside space-y-1 text-[0.95em] leading-[1.9]">
          {bulletItems.map((item, itemIndex) => (
            <li key={`note-list-${index}-${itemIndex}`}>{normalizeListItemText(item)}</li>
          ))}
        </ul>,
      );

      index = cursor - 1;
    }

    return rendered;
  };

  const openCase = () => {
    if (!resourceId) return;
    router.push(`/investigation/view-case?id=${encodeURIComponent(resourceId)}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportBottom = scrollTop + window.innerHeight;

      if (!pageContentRef.current) {
        setShowBackToTop(false);
        return;
      }

      const contentRect = pageContentRef.current.getBoundingClientRect();
      const contentBottom = scrollTop + contentRect.bottom;
      const distanceToContentBottom = contentBottom - viewportBottom;

      setShowBackToTop(scrollTop > 300 && distanceToContentBottom <= 260);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <PageLoading message="Loading mycologist notes..." fullScreen showTopBar />;
  }

  if (error) {
    return (
      <main className="relative flex flex-col xl:py-2 py-10 w-full bg-[var(--background-color)] text-[var(--primary-color)]">
        <div className="mb-3">
          <BackButton onClick={() => router.push("/investigation")} />
        </div>
        <div className="rounded-3xl border border-[var(--primary-color)]/10 bg-[var(--background-color)] p-8">
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--moldify-grey)]">
            No case ID was provided.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main ref={pageContentRef} className="relative flex flex-col xl:py-2 py-10 w-full bg-[var(--background-color)] text-[var(--primary-color)]">
      <header className="mb-12 border-b border-[var(--primary-color)]/5 pb-10">
        <div className="space-y-2">
          <Breadcrumbs role={userRole} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-4xl uppercase tracking-tighter">
            Case Management
          </h1>
        </div>

        <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--accent-color)]/20 bg-[var(--accent-color)]/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] mt-20">
          <FontAwesomeIcon icon={faBookOpen} className="text-[8px]" />
          Mycologist Remarks Overview
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton onClick={openCase} />
            <h2 className="font-[family-name:var(--font-montserrat)] text-4xl font-black uppercase tracking-tighter leading-none text-[var(--primary-color)]">
              Findings & Remarks
            </h2>
          </div>
        </div>
        <div className="mt-3 pace-y-4">
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-base font-medium leading-relaxed opacity-60 max-w-2xl text-[var(--primary-color)]">
            This page displays the full documented observations for the current case.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <aside className="xl:col-span-4 space-y-8">
          <div className="rounded-[2.5rem] border border-[var(--primary-color)]/10 bg-[var(--background-color)] p-10 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)] font-[family-name:var(--font-bricolage-grotesque)]">
              Laboratory Code
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-montserrat)] text-3xl font-black uppercase tracking-tight">
              {caseName}
            </h2>

            <div className="mt-8 space-y-6 border-t border-[var(--primary-color)]/5 pt-8 text-[11px] font-bold uppercase tracking-wider">
              <div className="flex justify-between items-center">
                <span className="opacity-40">Status</span>
                <span className="text-[var(--accent-color)]">{status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-40">Mycologist</span>
                <span className="text-right">{assignedMycologistName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-40">Occupation</span>
                <span className="text-right">{assignedMycologistOccupation}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-[var(--primary-color)]/10 bg-[var(--background-color)] p-10 shadow-sm relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(var(--primary-color) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                  Findings
                </span>
              </div>

              <h3 className="font-[family-name:var(--font-montserrat)] text-3xl font-black uppercase tracking-tighter text-[var(--primary-color)] leading-none mb-10">
                {finalVerdictMoldName || "Awaiting Data"}
              </h3>

              <div className="grid grid-cols-2 gap-8 border-y border-[var(--primary-color)]/5 py-8 mb-8">
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold uppercase tracking-widest text-[var(--moldify-grey)] opacity-60 font-[family-name:var(--font-montserrat)]">Confidence Level</span>
                  <span className="text-3xl font-black text-[var(--primary-color)] font-[family-name:var(--font-montserrat)]">
                    {finalVerdictConfidence || "N/A"}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="block text-[8px] font-bold uppercase tracking-widest text-[var(--moldify-grey)] opacity-60 font-[family-name:var(--font-montserrat)]">Last Sync</span>
                  <span className="text-[10px] font-bold uppercase text-[var(--primary-color)] leading-tight block font-[family-name:var(--font-bricolage-grotesque)]">
                    {finalVerdictTimestamp || "Pending..."}
                  </span>
                </div>
              </div>

              {finalVerdictWikiMoldHref && (
                <Link
                  href={finalVerdictWikiMoldHref}
                  className="group mt-8 flex items-center justify-between border-t border-[var(--primary-color)]/10 pt-8 transition-opacity hover:opacity-80"
                >
                  <div className="space-y-1">
                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)]">
                      Reference Article
                    </span>
                    <h4 className="font-[family-name:var(--font-montserrat)] text-sm font-black uppercase text-[var(--primary-color)]">
                      Open WikiMold Analysis
                    </h4>
                  </div>

                  <div className="text-[var(--primary-color)] opacity-40 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </aside>

        <section className="xl:col-span-8">
          <div className="rounded-[3rem] border border-[var(--primary-color)]/10 bg-[var(--background-color)] p-12 lg:p-16 shadow-sm">
            <div className="mb-12 flex items-center justify-between border-b border-[var(--primary-color)]/5 pb-12">
              <div className="space-y-2">
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)]">
                  Findings and Remarks
                </p>
                <h2 className="font-[family-name:var(--font-montserrat)] text-4xl font-black uppercase tracking-tighter">
                  Read carefully
                </h2>
              </div>
              <FontAwesomeIcon icon={faMicroscope} className="text-4xl opacity-10" />
            </div>

            {finalVerdictNotes ? (
              <article className="relative">
                <div className="absolute -left-8 top-0 h-full w-px bg-[var(--accent-color)]/20" />

                <div className="whitespace-pre-wrap font-[family-name:var(--font-bricolage-grotesque)] text-lg leading-[2.4] tracking-tight opacity-90">
                  {renderNotesWithEmphasizedLabels(finalVerdictNotes).map((node, idx) => (
                    <Fragment key={`formatted-note-${idx}`}>{node}</Fragment>
                  ))}
                </div>

                <div className="mt-16 flex items-center gap-4 border-t border-[var(--primary-color)]/5 pt-12 text-[var(--primary-color)] opacity-30">
                  <FontAwesomeIcon icon={faFileSignature} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] font-[family-name:var(--font-bricolage-grotesque)]">
                    Registry Authentication Signature - End of File
                  </span>
                </div>
              </article>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--primary-color)]/5 opacity-20">
                  <FontAwesomeIcon icon={faBookOpen} size="2x" />
                </div>
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[11px] font-black uppercase tracking-[0.3em] opacity-30">
                  No technical notes recorded for this case.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Back to top"
          className="cursor-pointer fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-color)] text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
    </main>
  );
}

export default function MycologistNotesPage() {
  return (
    <Suspense fallback={<PageLoading fullScreen showTopBar />}>
      <MycologistNotesContent />
    </Suspense>
  );
}
