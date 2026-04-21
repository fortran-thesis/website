"use client";

import Image from "next/image";
import { Suspense, useMemo } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useMoldReportExport } from "@/hooks/swr";
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

function PrintableCaseReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id") ?? undefined;

  const { data, isLoading, error } = useMoldReportExport(reportId);
  const payload = data?.data;
  const canPrint = Boolean(payload && !isLoading && !error);

  const affectedHosts = useMemo(
    () => textList(payload?.sections?.affected_hosts),
    [payload?.sections?.affected_hosts],
  );
  const followUps = Array.isArray(payload?.follow_ups) ? payload.follow_ups : [];
  const cultivationLogs = Array.isArray(payload?.investigation?.cultivation_logs)
    ? payload.investigation.cultivation_logs
    : [];
  const getFollowUpPhotos = (entry: Record<string, unknown>): string[] => {
    const fromCoverPhoto = textList(entry.cover_photo);
    if (fromCoverPhoto.length > 0) return fromCoverPhoto;
    return textList(entry.cover_photo_urls);
  };

  const handleBack = () => {
    if (reportId) {
      router.push(`/investigation/view-case?id=${encodeURIComponent(reportId)}`);
      return;
    }

    router.push("/investigation");
  };

  if (!reportId) {
    return (
      <main className="min-h-screen bg-[var(--background-color)] p-8 text-[var(--primary-color)]">
        <p className="text-lg font-bold">Missing report id.</p>
      </main>
    );
  }

  if (isLoading) {
    return <PageLoading message="Preparing printable report..." fullScreen showTopBar />;
  }

  if (error || !payload) {
    return (
      <main className="min-h-screen bg-[var(--background-color)] p-8 text-[var(--primary-color)]">
        <p className="text-lg font-bold">Unable to load printable report payload.</p>
      </main>
    );
  }

  return (
    <main className="print-shell mx-auto my-12 max-w-[900px] overflow-hidden rounded-3xl bg-[var(--background-color)] shadow-2xl shadow-black/10 border border-[var(--primary-color)]/5">
  <style jsx global>{`
    @page {
      size: A4;
      margin: 0;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      background: var(--background-color);
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
        max-width: 100vw !important;
        border-radius: 0 !important;
        border: none !important;
        background: #ffffff !important;
        overflow: visible !important;
        width: 100vw !important;
        padding: 0 !important;
      }

      .print-bleed-header {
        width: 100vw !important;
        margin-left: calc(50% - 50vw) !important;
        margin-right: calc(50% - 50vw) !important;
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

  {/* Minimalist Header Section */}
  <section className="print-bleed-header bg-[var(--primary-color)] px-10 py-10 text-[var(--background-color)]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="rounded-lg p-2">
          <Image
            src="/assets/moldify-logo-v5.svg"
            alt="Moldify"
            width={80}
            height={80}
          />
        </div>
        <div className="space-y-0.5">
          <h1 className="font-[family-name:var(--font-montserrat)] text-sm font-black uppercase tracking-[0.15em] leading-none text-[var(--accent-color)]">
            Technical Lab Report
          </h1>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-xs opacity-70">
            Internal Case: {textValue(payload.report.report_id)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">Mycologist</p>
        <p className="font-[family-name:var(--font-montserrat)] text-lg font-black uppercase tracking-tight">
          {textValue(payload.identities.mycologist_name)}
        </p>
      </div>
    </div>
  </section>

  {/* Content Body */}
  <section className="space-y-12 px-10 py-12 md:px-12">
    
    {/* Subject Identification & Vital Dates */}
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[var(--primary-color)]/10 pb-10">
      <div>
        <h2 className="font-[family-name:var(--font-montserrat)] text-6xl font-black uppercase tracking-tighter text-[var(--primary-color)]">
          {textValue(payload.sections.fungus_name, "Identification Pending")}
        </h2>
        <p className="mt-3 font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)] opacity-60">
          Reported By: {textValue(payload.identities.reporter_name)}
        </p>
      </div>
      
      <div className="flex gap-10 md:text-right border-l md:border-l-0 md:border-r border-[var(--primary-color)]/10 pl-6 md:pl-0 md:pr-6 py-2">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--moldify-grey)] opacity-40">Issue Date</p>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-bold text-[var(--moldify-grey)]">{textValue(payload.report.report_date)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--moldify-grey)] opacity-40">Observation</p>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-bold text-[var(--moldify-grey)]">{textValue(payload.report.date_observed)}</p>
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
        <article key={i} className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

    <section className="page-break space-y-4 border-t border-[var(--primary-color)]/10 pt-10">
      <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)] tracking-tight">
        Investigation Snapshot
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">Initial Observation</p>
          <p className="mt-2 text-sm font-bold text-[var(--primary-color)]">
            {textValue(payload.investigation?.initial_observation?.microscopic_identification)}
          </p>
          <p className="mt-1 text-xs text-[var(--moldify-grey)]">
            Confidence: {textValue(
              payload.investigation?.initial_observation?.microscopic_confidence,
              textValue(payload.investigation?.initial_observation?.confidence),
            )}
          </p>
          <p className="mt-2 text-sm text-[var(--moldify-grey)]">
            {textValue(
              payload.investigation?.initial_observation?.macroscopic_summary,
              textValue(payload.investigation?.initial_observation?.summary),
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">Latest In Vivo</p>
          <p className="mt-2 text-sm font-bold text-[var(--primary-color)]">
            {textValue(payload.investigation?.in_vivo_latest?.identified_mold)}
          </p>
          <p className="mt-1 text-xs text-[var(--moldify-grey)]">
            Confidence: {textValue(payload.investigation?.in_vivo_latest?.confidence)}
          </p>
          <p className="mt-2 text-sm text-[var(--moldify-grey)]">
            {textValue(payload.investigation?.in_vivo_latest?.summary)}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">Latest In Vitro</p>
          <p className="mt-2 text-sm font-bold text-[var(--primary-color)]">
            {textValue(payload.investigation?.in_vitro_latest?.identified_mold)}
          </p>
          <p className="mt-1 text-xs text-[var(--moldify-grey)]">
            Confidence: {textValue(payload.investigation?.in_vitro_latest?.confidence)}
          </p>
          <p className="mt-2 text-sm text-[var(--moldify-grey)]">
            {textValue(payload.investigation?.in_vitro_latest?.summary)}
          </p>
        </article>
      </div>

      <article className="space-y-3 rounded-2xl border border-[var(--primary-color)]/15 p-5">
        <h3 className="text-base font-black uppercase text-[var(--primary-color)]">Cultivation Logs</h3>
        {cultivationLogs.length === 0 ? (
          <p className="text-sm text-[var(--moldify-grey)]">No cultivation logs captured yet.</p>
        ) : (
          <ul className="space-y-3">
            {cultivationLogs.map((log) => (
              <li key={String(log.log_id ?? `${log.type}-${log.created_at ?? "unknown"}`)} className="rounded-xl bg-[var(--background-color)] p-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary-color)]">
                  {textValue(log.type)} • {timestampValue(log.observed_at ?? log.created_at)}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--moldify-grey)]">
                  {textValue(log.identified_mold, "Pending identification")}
                </p>
                <p className="mt-1 text-sm text-[var(--moldify-grey)]">{textValue(log.summary)}</p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>

    <section className="space-y-3 border-t border-[var(--primary-color)]/10 pt-10">
      <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)] tracking-tight">
        Follow-up Timeline
      </h2>
      {followUps.length === 0 ? (
        <p className="text-sm text-[var(--moldify-grey)]">No follow-up records.</p>
      ) : (
        <ol className="space-y-3">
          {followUps.map((entry, index) => {
            const record = entry as Record<string, unknown>;
            const photos = getFollowUpPhotos(record);
            const detailId = textValue(record.detail_id, `follow-up-${index + 1}`);

            return (
              <li key={detailId} className="rounded-xl border border-[var(--primary-color)]/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary-color)]">
                  {timestampValue(record.observed_at ?? record.timestamp)}
                </p>
                <p className="mt-2 text-sm text-[var(--moldify-grey)]">
                  {textValue(record.description)}
                </p>
                {photos.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {photos.map((url, photoIndex) => (
                      <a
                        key={`${detailId}-photo-${photoIndex}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border border-[var(--primary-color)]/10"
                      >
                        <Image
                          src={url}
                          alt={`Follow-up photo ${photoIndex + 1}`}
                          width={240}
                          height={160}
                          className="h-24 w-full object-cover"
                          loading="lazy"
                          unoptimized
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
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