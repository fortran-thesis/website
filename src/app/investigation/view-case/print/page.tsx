"use client";

import Image from "next/image";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMoldReportExport } from "@/hooks/swr";

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

  if (!reportId) {
    return (
      <main className="min-h-screen bg-[var(--background-color)] p-8 text-[var(--primary-color)]">
        <p className="text-lg font-bold">Missing report id.</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--background-color)] p-8 text-[var(--primary-color)]">
        <p className="text-lg font-bold">Preparing printable report...</p>
      </main>
    );
  }

  if (error || !payload) {
    return (
      <main className="min-h-screen bg-[var(--background-color)] p-8 text-[var(--primary-color)]">
        <p className="text-lg font-bold">Unable to load printable report payload.</p>
      </main>
    );
  }

  return (
    <main className="print-shell mx-auto my-6 max-w-[900px] rounded-3xl bg-white shadow-2xl shadow-black/10">
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
          background: var(--background-color);
        }

        @media print {
          body {
            background: #ffffff;
          }

          .print-shell {
            margin: 0 !important;
            box-shadow: none !important;
            max-width: none !important;
            border-radius: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .page-break {
            break-before: page;
          }
        }
      `}</style>

      <div className="no-print flex items-center justify-between gap-4 border-b border-[var(--primary-color)]/10 bg-[var(--background-color)] px-6 py-4">
        <div>
          <p className="font-[family-name:var(--font-montserrat)] text-xs font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">
            Print Preview
          </p>
          <p className="mt-1 text-sm text-[var(--moldify-grey)]">
            Review the report first, then open the browser print dialog when ready.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!canPrint}
          className="cursor-pointer rounded-xl bg-[var(--primary-color)] px-5 py-2.5 font-[family-name:var(--font-bricolage-grotesque)] text-xs font-black uppercase tracking-widest text-[var(--background-color)] transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Print PDF
        </button>
      </div>

      <section className="overflow-hidden rounded-t-3xl bg-[var(--primary-color)]">
        <div className="flex items-center justify-between border-b border-[var(--accent-color)] px-8 py-8 text-[var(--background-color)]">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/moldify-logo-v5.svg"
              alt="Moldify"
              width={72}
              height={72}
            />
            <div>
              <p className="font-[family-name:var(--font-montserrat)] text-4xl font-black tracking-tight">LABORATORY REPORT</p>
              <p className="font-[family-name:var(--font-bricolage-grotesque)] text-xl opacity-85">
                {textValue(payload.report.case_name, textValue(payload.report.report_id))}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-montserrat)] text-xs font-bold uppercase tracking-[0.2em] opacity-70">Mycologist</p>
            <p className="font-[family-name:var(--font-montserrat)] text-3xl font-black leading-none">
              {textValue(payload.identities.mycologist_name)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-8 px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[var(--moldify-grey)]">
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-bold uppercase tracking-[0.16em]">
            Report Date: {textValue(payload.report.report_date)}
          </p>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-sm font-bold uppercase tracking-[0.16em]">
            Date Observed: {textValue(payload.report.date_observed)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--primary-color)]/15 bg-[var(--background-color)] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">Host Plant Affected</p>
            <p className="mt-2 font-[family-name:var(--font-montserrat)] text-xl font-black text-[var(--primary-color)]">
              {textValue(payload.report.host_plant_affected)}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--primary-color)]/15 bg-[var(--background-color)] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">Case Status</p>
            <p className="mt-2 font-[family-name:var(--font-montserrat)] text-xl font-black text-[var(--primary-color)]">
              {textValue(payload.report.case_status)}
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--primary-color)]/15 bg-[var(--background-color)] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--moldify-grey)]">Confidence Level</p>
            <p className="mt-2 font-[family-name:var(--font-montserrat)] text-xl font-black text-[var(--primary-color)]">
              {textValue(payload.report.confidence_level)}
            </p>
          </article>
        </div>

        <article>
          <h1 className="font-[family-name:var(--font-montserrat)] text-5xl font-black uppercase tracking-tight text-[var(--primary-color)]">
            {textValue(payload.sections.fungus_name, "Pending Identification")}
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--moldify-grey)]">
            Reporter: {textValue(payload.identities.reporter_name)}
          </p>
        </article>

        <article className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">Overview</h2>
          {paragraphLines(payload.sections.overview).map((line) => (
            <p key={line} className="text-justify font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-7 text-[var(--moldify-grey)]">
              {line}
            </p>
          ))}
        </article>

        <article className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">Description</h2>
          {paragraphLines(payload.sections.description).map((line) => (
            <p key={line} className="text-justify font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-7 text-[var(--moldify-grey)]">
              {line}
            </p>
          ))}
        </article>

        <article className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">Health Risks</h2>
          {paragraphLines(payload.sections.health_risks).map((line) => (
            <p key={line} className="text-justify font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-7 text-[var(--moldify-grey)]">
              {line}
            </p>
          ))}
        </article>

        <article className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">Affected Crops and Hosts</h2>
          <ul className="grid grid-cols-1 gap-y-2 md:grid-cols-2">
            {affectedHosts.length > 0 ? (
              affectedHosts.map((host) => (
                <li key={host} className="list-disc pl-2 text-[15px] leading-7 text-[var(--moldify-grey)] marker:text-[var(--accent-color)]">
                  {host}
                </li>
              ))
            ) : (
              <li className="text-[15px] leading-7 text-[var(--moldify-grey)]">No host records available.</li>
            )}
          </ul>
        </article>

        <article className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">Symptoms and Signs</h2>
          {paragraphLines(payload.sections.symptoms_and_signs).map((line) => (
            <p key={line} className="text-justify font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-7 text-[var(--moldify-grey)]">
              {line}
            </p>
          ))}
        </article>

        <article className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">Disease Cycle and Impact</h2>
          {paragraphLines(payload.sections.disease_cycle).map((line) => (
            <p key={`cycle-${line}`} className="text-justify font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-7 text-[var(--moldify-grey)]">
              {line}
            </p>
          ))}
          {paragraphLines(payload.sections.impact).map((line) => (
            <p key={`impact-${line}`} className="text-justify font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-7 text-[var(--moldify-grey)]">
              {line}
            </p>
          ))}
        </article>

        <article className="space-y-2">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">Prevention Summary</h2>
          {paragraphLines(payload.sections.prevention_summary).map((line) => (
            <p key={line} className="text-justify font-[family-name:var(--font-bricolage-grotesque)] text-[15px] leading-7 text-[var(--moldify-grey)]">
              {line}
            </p>
          ))}
        </article>

        <section className="page-break grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5">
            <h3 className="text-lg font-black uppercase text-[var(--primary-color)]">Physical Control</h3>
            <p className="mt-2 text-[15px] leading-7 text-[var(--moldify-grey)]">{textValue(payload.sections.physical_control)}</p>
          </article>
          <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5">
            <h3 className="text-lg font-black uppercase text-[var(--primary-color)]">Cultural Control</h3>
            <p className="mt-2 text-[15px] leading-7 text-[var(--moldify-grey)]">{textValue(payload.sections.cultural_control)}</p>
          </article>
          <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5">
            <h3 className="text-lg font-black uppercase text-[var(--primary-color)]">Biological Control</h3>
            <p className="mt-2 text-[15px] leading-7 text-[var(--moldify-grey)]">{textValue(payload.sections.biological_control)}</p>
          </article>
          <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5">
            <h3 className="text-lg font-black uppercase text-[var(--primary-color)]">Mechanical Control</h3>
            <p className="mt-2 text-[15px] leading-7 text-[var(--moldify-grey)]">{textValue(payload.sections.mechanical_control)}</p>
          </article>
          <article className="rounded-2xl border border-[var(--primary-color)]/15 p-5 md:col-span-2">
            <h3 className="text-lg font-black uppercase text-[var(--primary-color)]">Chemical Control</h3>
            <p className="mt-2 text-[15px] leading-7 text-[var(--moldify-grey)]">{textValue(payload.sections.chemical_control)}</p>
          </article>
        </section>

        <section className="page-break space-y-4">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">
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
                  <li key={log.log_id} className="rounded-xl bg-[var(--background-color)] p-3">
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

        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-black uppercase text-[var(--primary-color)]">
            Follow-up Timeline
          </h2>
          {followUps.length === 0 ? (
            <p className="text-sm text-[var(--moldify-grey)]">No follow-up records.</p>
          ) : (
            <ol className="space-y-3">
              {followUps.map((entry, index) => {
                const photos = getFollowUpPhotos(entry as Record<string, unknown>);
                const detailId = textValue((entry as Record<string, unknown>).detail_id, `follow-up-${index + 1}`);

                return (
                <li key={detailId} className="rounded-xl border border-[var(--primary-color)]/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary-color)]">
                    {timestampValue(
                      (entry as Record<string, unknown>).observed_at ??
                      (entry as Record<string, unknown>).timestamp,
                    )}
                  </p>
                  <p className="mt-2 text-sm text-[var(--moldify-grey)]">
                    {textValue((entry as Record<string, unknown>).description)}
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
              );})}
            </ol>
          )}
        </section>

        <section className="no-print rounded-2xl bg-[var(--background-color)] p-4 text-xs uppercase tracking-[0.16em] text-[var(--moldify-grey)]">
          Source: {payload.source.mold_catalog_used ? "Mold Catalog" : "No Mold Catalog"}
          {payload.source.wikimold_used ? " + WikiMold" : ""}
        </section>
      </section>
    </main>
  );
}

export default function PrintableCaseReportPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--background-color)] p-8 text-[var(--primary-color)]">
          <p className="text-lg font-bold">Preparing printable report...</p>
        </main>
      }
    >
      <PrintableCaseReportContent />
    </Suspense>
  );
}