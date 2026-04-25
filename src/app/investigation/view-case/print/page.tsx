"use client";

import Image from "next/image";
import { Suspense, useMemo } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useMoldCaseByReport, useMoldCaseLogs, useMoldReport, useMoldReportExport } from "@/hooks/swr";
import PageLoading from "@/components/loading/page_loading";
import BackButton from "@/components/buttons/back_button";

const textValue = (value: unknown, fallback = "N/A"): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const textList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/[,;|\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const paragraphLines = (value: unknown): string[] => {
  const text = textValue(value, "");
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

const timestampValue = (value: unknown): string => {
  if (typeof value !== "string") return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const isLikelyImageUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/")) return false;
  if (/\s/.test(trimmed)) return false;
  return true;
};

const uniqueImageUrls = (values: string[]): string[] => {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!isLikelyImageUrl(trimmed)) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    urls.push(trimmed);
  }

  return urls;
};

const collectImageUrls = (value: unknown, keyHint?: string): string[] => {
  const results: string[] = [];

  const walk = (node: unknown, hint?: string) => {
    if (typeof node === "string") {
      if (hint && /(image|photo|cover|microscopic|macroscopic)/i.test(hint)) {
        results.push(node);
      }
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item, hint);
      }
      return;
    }

    if (node && typeof node === "object") {
      for (const [key, nested] of Object.entries(node as Record<string, unknown>)) {
        walk(nested, key);
      }
    }
  };

  walk(value, keyHint);
  return uniqueImageUrls(results);
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

const normalizeLogType = (rawType: unknown): string => {
  const text = textValue(rawType, "").toLowerCase().replace(/[_\s-]+/g, "");
  if (text === "vivo" || text === "invivo") return "vivo";
  if (text === "vitro" || text === "invitro") return "vitro";
  if (text === "initialobservation" || text === "initialobs") return "initial";
  return text;
};

function PrintableCaseReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id") ?? undefined;

  const { data, isLoading, error } = useMoldReportExport(reportId);
  const { data: reportRes } = useMoldReport(reportId);
  const { data: moldCaseRes } = useMoldCaseByReport(reportId);

  const payload = data?.data;
  const reportData = reportRes?.data;
  const moldCase = moldCaseRes?.data;
  const moldCaseId = moldCase?.id;
  const { data: logsRes } = useMoldCaseLogs(moldCaseId, 200, Boolean(moldCaseId));
  const canPrint = Boolean(payload && !isLoading && !error);

  const affectedHosts = useMemo(
    () => textList(payload?.sections?.affected_hosts),
    [payload?.sections?.affected_hosts],
  );
  const exportCultivationLogs = Array.isArray(payload?.investigation?.cultivation_logs)
    ? payload.investigation.cultivation_logs
    : [];
  const endpointCultivationLogs = Array.isArray(logsRes?.data?.snapshot) ? logsRes.data.snapshot : [];
  const cultivationLogs = endpointCultivationLogs.length > 0
    ? endpointCultivationLogs
    : exportCultivationLogs;
  const caseDetails = useMemo(
    () => (Array.isArray((reportData as { case_details?: unknown[] } | undefined)?.case_details)
      ? ((reportData as { case_details?: unknown[] }).case_details ?? [])
      : []),
    [reportData],
  );
  const cultivationDetails = useMemo(
    () => asRecord((moldCase as { cultivation_details?: unknown } | null | undefined)?.cultivation_details),
    [moldCase],
  );
  const initialObservationFromInvestigation = asRecord(payload?.investigation?.initial_observation);
  const initialObservationFromCase = asRecord(cultivationDetails.initial_observations ?? cultivationDetails);
  const latestInitialLog = useMemo(
    () => cultivationLogs.slice().reverse().find((log) => normalizeLogType(asRecord(log).type) === "initial"),
    [cultivationLogs],
  );
  const latestInVivoLog = useMemo(
    () => cultivationLogs.slice().reverse().find((log) => normalizeLogType(asRecord(log).type) === "vivo"),
    [cultivationLogs],
  );
  const latestInVitroLog = useMemo(
    () => cultivationLogs.slice().reverse().find((log) => normalizeLogType(asRecord(log).type) === "vitro"),
    [cultivationLogs],
  );
  const latestInitialLogCharacteristics = asRecord(asRecord(latestInitialLog).characteristics);
  const latestInVivoCharacteristics = asRecord(asRecord(latestInVivoLog).characteristics);
  const latestInVitroCharacteristics = asRecord(asRecord(latestInVitroLog).characteristics);
  const initialObservationImages = useMemo(
    () =>
      uniqueImageUrls([
        ...collectImageUrls(initialObservationFromInvestigation),
        ...collectImageUrls(initialObservationFromCase),
        ...collectImageUrls(latestInitialLog),
        ...collectImageUrls(latestInitialLogCharacteristics),
      ]),
    [
      initialObservationFromInvestigation,
      initialObservationFromCase,
      latestInitialLog,
      latestInitialLogCharacteristics,
    ],
  );
  const inVivoFromInvestigation = asRecord(payload?.investigation?.in_vivo_latest);
  const inVivoImages = useMemo(
    () =>
      uniqueImageUrls([
        ...collectImageUrls(inVivoFromInvestigation),
        ...collectImageUrls(latestInVivoLog),
        ...collectImageUrls(latestInVivoCharacteristics),
      ]),
    [inVivoFromInvestigation, latestInVivoLog, latestInVivoCharacteristics],
  );
  const inVitroFromInvestigation = asRecord(payload?.investigation?.in_vitro_latest);
  const inVitroImages = useMemo(
    () =>
      uniqueImageUrls([
        ...collectImageUrls(inVitroFromInvestigation),
        ...collectImageUrls(latestInVitroLog),
        ...collectImageUrls(latestInVitroCharacteristics),
      ]),
    [inVitroFromInvestigation, latestInVitroLog, latestInVitroCharacteristics],
  );
  const laboratoryCode = textValue(payload?.report?.case_name, textValue(payload?.report?.report_id));

  const initialObservationTitle = textValue(
    initialObservationFromInvestigation.microscopic_identification,
    textValue(
      initialObservationFromCase.initial_microscopic,
      textValue(
        latestInitialLogCharacteristics.microscopic_identification,
        textValue(latestInitialLogCharacteristics.identified_mold, "N/A"),
      ),
    ),
  );
  const initialObservationConfidence = textValue(
    initialObservationFromInvestigation.microscopic_confidence,
    textValue(
      initialObservationFromInvestigation.confidence,
      textValue(
        initialObservationFromCase.confidence,
        textValue(latestInitialLogCharacteristics.confidence, "N/A"),
      ),
    ),
  );
  const initialObservationSummary = textValue(
    initialObservationFromInvestigation.macroscopic_summary,
    textValue(
      initialObservationFromInvestigation.summary,
      textValue(
        initialObservationFromCase.initial_macroscopic,
        textValue(asRecord(latestInitialLog).summary, "N/A"),
      ),
    ),
  );

  const inVivoTitle = textValue(
    inVivoFromInvestigation.identified_mold,
    textValue(
      latestInVivoCharacteristics.identified_mold,
      textValue(latestInVivoCharacteristics.microscopic_identification, "N/A"),
    ),
  );
  const inVivoConfidence = textValue(
    inVivoFromInvestigation.confidence,
    textValue(latestInVivoCharacteristics.confidence, "N/A"),
  );
  const inVivoSummary = textValue(
    inVivoFromInvestigation.summary,
    textValue(asRecord(latestInVivoLog).summary, "N/A"),
  );

  const inVitroTitle = textValue(
    inVitroFromInvestigation.identified_mold,
    textValue(
      latestInVitroCharacteristics.identified_mold,
      textValue(latestInVitroCharacteristics.microscopic_identification, "N/A"),
    ),
  );
  const inVitroConfidence = textValue(
    inVitroFromInvestigation.confidence,
    textValue(latestInVitroCharacteristics.confidence, "N/A"),
  );
  const inVitroSummary = textValue(
    inVitroFromInvestigation.summary,
    textValue(asRecord(latestInVitroLog).summary, "N/A"),
  );

  const handleBack = () => {
    if (reportId) {
      router.push(`/investigation/view-case?id=${encodeURIComponent(reportId)}`);
      return;
    }

    router.push("/investigation");
  };

  if (!reportId) {
    return (
      <main className="min-h-screen bg-[var(--taupe)] p-8 text-[var(--primary-color)]">
        <p className="text-lg font-bold">Missing report id.</p>
      </main>
    );
  }

  if (isLoading) {
    return <PageLoading message="Preparing printable report..." fullScreen showTopBar />;
  }

  if (error || !payload) {
    return (
      <main className="min-h-screen bg-[var(--taupe)] p-8 text-[var(--primary-color)]">
        <p className="text-lg font-bold">Unable to load printable report payload.</p>
      </main>
    );
  }

  return (
    <main className="print-shell mx-auto my-12 max-w-[900px] overflow-hidden rounded-3xl bg-[var(--background-color)] shadow-2xl shadow-black/10 border border-[var(--primary-color)]/5">
  <style jsx global>{`
    @page {
      size: A4;
      margin: 12mm;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      background: var(--taupe);
    }

    @media print {
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }

      body {
        background: #ffffff !important;
      }

      .print-shell {
        margin: 0 !important;
        box-shadow: none !important;
        max-width: none !important;
        border-radius: 0 !important;
        border: none !important;
        background: #ffffff !important;
        overflow: visible !important;
        width: auto !important;
        padding: 0 !important;
      }

      .print-bleed-header {
        width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        color: var(--primary-color) !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
      }

      .avoid-page-break {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .no-print {
        display: none !important;
      }

      .page-break {
        break-before: page;
        page-break-before: always;
      }

      .print-tech-section {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .print-snapshot-section,
      .print-case-block,
      .print-case-row,
      .print-analysis-item,
      .print-image-grid,
      .print-image-frame {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .print-analysis-item {
        break-after: auto !important;
        page-break-after: auto !important;
      }

      .print-featured-frame {
        max-height: 72mm !important;
      }

      .print-thumb-frame {
        max-height: 30mm !important;
      }

      .print-image-frame > span,
      .print-image-frame img {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `}</style>

  {/* Top Utility Bar */}
  <div className="no-print flex items-center justify-between gap-4 border-b border-[var(--primary-color)]/10 bg-[var(--background-color)] px-8 py-5">
    <div className="flex items-center gap-4">
      <BackButton
        bgColor="var(--primary-color)"
        iconColor="var(--background-color)"
        onClick={handleBack}
      />
      <div>
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">
          Document Preview
        </p>
        <p className="font-[family-name:var(--font-bricolage-grotesque)] text-xs text-[var(--moldify-grey)] opacity-70">
          Standard Laboratory Export Format
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => window.print()}
      disabled={!canPrint}
      className="cursor-pointer rounded-xl bg-[var(--primary-color)] px-6 py-3 font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-widest text-[var(--background-color)] transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Print PDF
    </button>
  </div>

  {/* Professional Editorial Header */}
  <section className="print-bleed-header px-10 py-10">
    <div className="flex items-center justify-between gap-6 border-b border-[var(--primary-color)]/20 pb-8">
      <div className="flex items-center gap-6">
        {/* Keeping your exact logo styling and size */}
        <div className="rounded-lg p-2">
          <Image
            src="/assets/moldify-logo-v5.svg"
            alt="Moldify"
            width={80}
            height={80}
          />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-[family-name:var(--font-montserrat)] text-xs font-black uppercase tracking-[0.3em] text-[var(--accent-color)] leading-none">
            Technical Lab Report
          </h1>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--primary-color)] font-medium">
            Laboratory Code: <span className="opacity-70">{laboratoryCode}</span>
          </p>
        </div>
      </div>
      <div className="ml-auto max-w-[42%] min-w-0 text-right">
        <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--moldify-grey)] opacity-50">Authorized Mycologist</p>
        <p className="font-[family-name:var(--font-montserrat)] text-lg font-black uppercase tracking-tight leading-tight break-words whitespace-normal text-[var(--primary-color)] md:text-xl">
          {textValue(payload.identities.mycologist_name)}
        </p>
      </div>
    </div>
  </section>

  {/* Content Body */}
  <section className="px-10 py-12 md:px-12 space-y-16">
    
    {/* Subject Identification & Vital Dates - Clean Typographic Layout */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
      <div className="md:col-span-8 space-y-6">
        <div className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-7xl font-black uppercase tracking-tighter leading-[0.85] text-[var(--primary-color)]">
            {textValue(payload.sections.fungus_name, "Identification Pending")}
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-12 bg-[var(--accent-color)]" />
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)] opacity-60">
              Reported By: {textValue(payload.identities.reporter_name)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Vital Dates - Minimalist Grid without containers */}
      <div className="md:col-span-4 grid grid-cols-2 gap-8 md:text-right">
        <div className="space-y-1 border-r border-[var(--primary-color)]/10 md:border-r-0 md:pr-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--moldify-grey)] opacity-40">Issue Date</p>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-bold text-[var(--primary-color)]">
            {textValue(payload.report.report_date)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--moldify-grey)] opacity-40">Observation</p>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-bold text-[var(--primary-color)]">
            {textValue(payload.report.date_observed)}
          </p>
        </div>
      </div>
    </div>
 

    {/* Metadata Matrix */}
    <div className="grid grid-cols-1 gap-px bg-[var(--primary-color)]/10 md:grid-cols-3 border border-[var(--primary-color)]/10 rounded-2xl overflow-hidden">
      {[
        { label: "Host Plant", value: payload.report.host_plant_affected },
        { label: "Case Status", value: payload.report.case_status },
        { label: "Confidence", value: payload.report.confidence_level }
      ].map((item, i) => (
        <div key={i} className="bg-[var(--background-color)] p-6 transition-colors hover:bg-[var(--primary-color)]/[0.02]">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--moldify-grey)] opacity-50 mb-1">{item.label}</p>
          <p className="font-[family-name:var(--font-montserrat)] text-lg font-black text-[var(--primary-color)] truncate">{textValue(item.value)}</p>
        </div>
      ))}
    </div>

    {/* Technical Analysis Sections */}
    <div className="space-y-10">
      {[
        { title: "Overview", content: payload.sections.overview },
        { title: "Morphology", content: payload.sections.description },
        { title: "Clinical Risks", content: payload.sections.health_risks, highlight: true }
      ].map((section, i) => (
        <article key={i} className="print-tech-section grid grid-cols-1 md:grid-cols-4 gap-6">
          <h3 className="font-[family-name:var(--font-montserrat)] text-xs font-black uppercase tracking-widest text-[var(--moldify-grey)] pt-1">
            {section.title}
          </h3>
          <div className={`md:col-span-3 ${section.highlight ? 'bg-[var(--moldify-red)]/5 border-l-2 border-[var(--moldify-red)] p-5 rounded-r-xl' : ''}`}>
            {paragraphLines(section.content).map((line, idx) => (
              <p key={idx} className={`font-[family-name:var(--font-bricolage-grotesque)] text-[14px] leading-7 text-justify ${section.highlight ? 'text-[var(--moldify-red)] font-medium' : 'text-[var(--moldify-grey)]'}`}>
                {line}
              </p>
            ))}
          </div>
        </article>
      ))}

      <article className="avoid-page-break grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-[var(--primary-color)]/5 pt-10">
        <h3 className="font-[family-name:var(--font-montserrat)] text-xs font-black uppercase tracking-widest text-[var(--moldify-grey)]">
          Affected Hosts
        </h3>
        <div className="md:col-span-3">
          <ul className="grid grid-cols-2 gap-4">
            {affectedHosts.map((host) => (
              <li key={host} className="font-[family-name:var(--font-bricolage-grotesque)] text-sm text-[var(--moldify-grey)] flex items-center gap-3">
                <div className="h-1 w-1 bg-[var(--accent-color)] rotate-45" /> {host}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>

    {/* Management Protocols */}
    <section className="avoid-page-break space-y-8 border-t border-[var(--primary-color)]/10 pt-10">
      <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)] tracking-tight">
        Integrated Management Protocols
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          { label: "Physical", content: payload.sections.physical_control },
          { label: "Cultural", content: payload.sections.cultural_control },
          { label: "Biological", content: payload.sections.biological_control },
          { label: "Chemical", content: payload.sections.chemical_control }
        ].map((control, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-6 border-b border-[var(--primary-color)]/5 pb-6 last:border-0">
            <span className="w-32 font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase text-[var(--accent-color)]">{control.label} Controls</span>
            <p className="flex-1 font-[family-name:var(--font-bricolage-grotesque)] text-sm leading-relaxed text-[var(--moldify-grey)]">
              {textValue(control.content)}
            </p>
          </div>
        ))}
      </div>
    </section>

    <section className="page-break print-snapshot-section space-y-16 border-t border-[var(--primary-color)]/20 pt-16">
  {/* Header */}
  <div className="space-y-3">
    <h2 className="font-[family-name:var(--font-montserrat)] text-xs font-black uppercase tracking-[0.4em] text-[var(--accent-color)]">
      Investigation Snapshot
    </h2>
    <p className="font-[family-name:var(--font-bricolage-grotesque)] text-3xl font-black tracking-tight text-[var(--primary-color)]">
      Visual Specimen Analysis
    </p>
  </div>

  {/* Case Details / Field Journal - Wider Images */}
  <div className="print-case-block space-y-8">
    <h3 className="font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-widest text-[var(--moldify-grey)] opacity-50">
      Field Intelligence Log
    </h3>
    
    {caseDetails.length === 0 ? (
      <p className="text-sm italic text-[var(--moldify-grey)] opacity-40">No entries logged.</p>
    ) : (
      <div className="space-y-12">
        {caseDetails.map((detail, index) => {
          const record = asRecord(detail);
          const photos = uniqueImageUrls([
            ...textList(record.cover_photo),
            ...textList(record.cover_photo_urls),
            ...textList(record.image_url),
            ...textList(record.image_urls),
          ]);
          return (
            <div key={textValue(record.detail_id, `case-detail-${index + 1}`)} className="print-case-row grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="border-l-2 border-[var(--accent-color)] pl-4">
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)]">
                  Log Entry
                </p>
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-xs font-bold text-[var(--moldify-grey)]/60">
                  {timestampValue(record.observed_at ?? asRecord(record.metadata).created_at)}
                </p>
              </div>
              
              <div className="md:col-span-3 space-y-6">
                <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-relaxed text-[var(--moldify-grey)]">
                  {textValue(record.description)}
                </p>
                
                {photos.length > 0 && (
                  <div className="print-image-grid grid grid-cols-2 gap-4">
                    {photos.map((url, pIdx) => (
                      <a key={pIdx} href={url} target="_blank" rel="noreferrer" className="print-image-frame relative aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--primary-color)]/10">
                        <Image src={url} alt="Log detail" fill className="object-cover" unoptimized />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>

  {/* Analytical Snapshots - Featured Image Style */}
  <div className="space-y-12">
    {[
      { title: "Initial Observation", subtitle: initialObservationTitle, conf: initialObservationConfidence, summary: initialObservationSummary, imgs: initialObservationImages },
      { title: "In Vivo Analysis", subtitle: inVivoTitle, conf: inVivoConfidence, summary: inVivoSummary, imgs: inVivoImages },
      { title: "In Vitro Analysis", subtitle: inVitroTitle, conf: inVitroConfidence, summary: inVitroSummary, imgs: inVitroImages }
    ].map((obs, idx) => (
      <article key={idx} className="print-analysis-item space-y-6">
        <div className="flex items-end justify-between border-b border-[var(--primary-color)]/10 pb-2">
          <div className="space-y-1">
            <span className="font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]">
              {obs.title}
            </span>
            <h4 className="font-[family-name:var(--font-montserrat)] text-xl font-black text-[var(--primary-color)] uppercase tracking-tight">
              {obs.subtitle}
            </h4>
          </div>
          <span className="mb-1 text-[10px] font-black uppercase text-[var(--moldify-grey)] opacity-40">
            Confidence: {obs.conf}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[14px] leading-relaxed text-[var(--moldify-grey)]">
              {obs.summary}
            </p>
          </div>

          <div className="space-y-3">
            {obs.imgs.length > 0 ? (
              <>
                {/* Large Featured Image */}
                <a href={obs.imgs[0]} target="_blank" rel="noreferrer" className="print-image-frame print-featured-frame relative block aspect-[3/2] overflow-hidden rounded-2xl border border-[var(--primary-color)]/10 bg-white">
                  <Image src={obs.imgs[0]} alt="Featured specimen" fill className="object-cover" unoptimized />
                </a>
                
                {/* Secondary Images Grid */}
                {obs.imgs.length > 1 && (
                  <div className="print-image-grid grid grid-cols-3 gap-3">
                    {obs.imgs.slice(1, 4).map((url, imgIdx) => (
                      <a key={imgIdx} href={url} target="_blank" rel="noreferrer" className="print-image-frame print-thumb-frame relative aspect-square overflow-hidden rounded-xl border border-[var(--primary-color)]/10">
                        <Image src={url} alt="Specimen detail" fill className="object-cover" unoptimized />
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-[3/2] items-center justify-center rounded-2xl border-2 border-dashed border-[var(--primary-color)]/5 bg-[var(--primary-color)]/[0.01]">
                <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-black uppercase tracking-widest text-[var(--moldify-grey)] opacity-20">
                  No Optical Data Available
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    ))}
  </div>
</section>

    {/* Footer Source Info */}
    <footer className="mt-16 flex items-center justify-between border-t border-[var(--primary-color)]/10 pt-8 text-[9px]">
      <div className="space-y-0.5 opacity-60">
        <p className="font-black uppercase tracking-widest text-[var(--moldify-grey)]">Data Verification Source</p>
        <p className="font-[family-name:var(--font-bricolage-grotesque)] font-bold text-[var(--primary-color)]">
          {payload.source.mold_catalog_used ? "MOLD CATALOG v2.0" : "DIRECT OBSERVATION"} {payload.source.wikimold_used ? "• WIKIMOLD DB" : ""}
        </p>
      </div>
      <p className="font-[family-name:var(--font-montserrat)] font-black text-[var(--moldify-grey)] opacity-20 uppercase tracking-tighter">
        © 2026 MOLDIFY AGRICULTURAL INVESTIGATION SYSTEM
      </p>
    </footer>
  </section>
</main>
  );
}

export default function PrintableCaseReportPage() {
  return (
    <Suspense
      fallback={<PageLoading message="Preparing printable report..." fullScreen showTopBar />}
    >
      <PrintableCaseReportContent />
    </Suspense>
  );
}
