"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import BackButton from "@/components/buttons/back_button";
import ConfirmModal from "@/components/modals/confirmation_modal";
import { StickyDossierNav } from "@/components/dossier_nav";
import StatusBox from "@/components/tiles/status_tile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faRotate } from "@fortawesome/free-solid-svg-icons";
import { useMoldById } from "@/hooks/swr";
import { apiMutate, ApiError } from "@/lib/api";
import { normalizeInfoSections, unwrapMoldResponse } from "@/lib/mold-detail-normalizer";
import { useInvalidationFunctions } from "@/utils/cache-invalidation";
import PageLoading from "@/components/loading/page_loading";
import TopLoadingBar from "@/components/loading/top_loading_bar";
import MessageBanner from "@/components/feedback/message_banner";

interface MoldInfoFormData {
  moldName: string;
  description: string;
  predictedClassId: string;
  predictedClassName: string;
  symptoms: string;
  signs: string;
  characteristics: string;
  additionalInfo: {
    overview: string;
    healthRisks: string;
    affectedHosts: string;
    symptomsSigns: string;
    diseaseCycleImpact: string;
    preventionSummary: string;
  };
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
  };
}

interface MoldManagementFormData {
  physicalControl: string;
  mechanicalControl: string;
  culturalControl: string;
  biologicalControl: string;
  chemicalControl: string;
}

export default function ViewMoldInfo() {
  return (
    <Suspense fallback={<PageLoading fullScreen showTopBar />}>
      <ViewMoldInfoContent />
    </Suspense>
  );
}

function ViewMoldInfoContent() {
  const userRole = "Mycologist";
  const searchParams = useSearchParams();
  const router = useRouter();
  const moldId = searchParams.get("id");
  const { invalidateMolds } = useInvalidationFunctions();

  const [moldInfo, setMoldInfo] = useState<MoldInfoFormData>({
    moldName: "",
    description: "",
    predictedClassId: "",
    predictedClassName: "",
    symptoms: "",
    signs: "",
    characteristics: "",
    additionalInfo: {
      overview: "",
      healthRisks: "",
      affectedHosts: "",
      symptomsSigns: "",
      diseaseCycleImpact: "",
      preventionSummary: "",
    },
    taxonomy: {
      kingdom: "Fungi",
      phylum: "Ascomycota",
      class: "",
      order: "",
      family: "",
      genus: "",
    },
  });

  const [moldManagement, setMoldManagement] = useState<MoldManagementFormData>({
    physicalControl: "",
    mechanicalControl: "",
    culturalControl: "",
    biologicalControl: "",
    chemicalControl: "",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingReviewed, setIsMarkingReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moldStatus, setMoldStatus] = useState<"draft" | "reviewed" | null>(null);

  const { data: moldSwr, isLoading } = useMoldById(moldId ?? undefined);

  useEffect(() => {
    const responseData = (moldSwr as any)?.data;
    const mold = unwrapMoldResponse(responseData);
    if (!mold || Object.keys(mold).length === 0) return;

    const apiTax = mold.mold_details?.info?.taxonomy || mold.info?.taxonomy || {};
    const info = mold.mold_details?.info || mold.info || {};
    const additionalInfo = normalizeInfoSections(info as Record<string, unknown>);

    setMoldInfo((prev) => ({
      ...prev,
      moldName: mold.name || "",
      description: info.description || "",
      predictedClassId: info.predicted_class_id !== undefined ? String(info.predicted_class_id) : "",
      predictedClassName: info.predicted_class_name || "",
      symptoms: Array.isArray(mold.symptoms) ? mold.symptoms.join(", ") : "",
      signs: Array.isArray(mold.signs) ? mold.signs.join(", ") : "",
      characteristics: Array.isArray(mold.characteristics) ? mold.characteristics.join(", ") : "",
      additionalInfo: {
        overview: additionalInfo.overview,
        healthRisks: additionalInfo.healthRisks,
        affectedHosts: additionalInfo.affectedHosts,
        symptomsSigns: additionalInfo.symptomsSigns,
        diseaseCycleImpact: additionalInfo.diseaseCycleImpact,
        preventionSummary: additionalInfo.preventionSummary,
      },
      taxonomy: {
        kingdom: apiTax.kingdom ?? prev.taxonomy.kingdom ?? "",
        phylum: apiTax.phylum ?? prev.taxonomy.phylum ?? "",
        class: apiTax.class ?? prev.taxonomy.class ?? "",
        order: apiTax.order ?? prev.taxonomy.order ?? "",
        family: apiTax.family ?? prev.taxonomy.family ?? "",
        genus: mold.name || apiTax.genus || prev.taxonomy.genus || "",
      },
    }));

    const rawStatus = (mold as any).status;
    setMoldStatus(rawStatus === "reviewed" ? "reviewed" : "draft");

    if (mold.mold_details?.prevention) {
      const prev = mold.mold_details.prevention as any;
      setMoldManagement((curr) => ({
        physicalControl: prev.physicalControl ?? curr.physicalControl ?? "",
        mechanicalControl: prev.mechanicalControl ?? curr.mechanicalControl ?? "",
        culturalControl: prev.culturalControl ?? curr.culturalControl ?? "",
        biologicalControl: prev.biologicalControl ?? curr.biologicalControl ?? "",
        chemicalControl: Array.isArray(prev.fungicide)
          ? prev.fungicide.join(", ")
          : prev.chemicalControl ?? curr.chemicalControl ?? "",
      }));
    }
  }, [moldSwr]);

  const handleTaxonomyChange = (field: keyof MoldInfoFormData["taxonomy"], value: string) => {
    setMoldInfo((prev) => ({
      ...prev,
      taxonomy: {
        ...prev.taxonomy,
        [field]: value,
      },
    }));
  };

  const handleManagementChange = (field: keyof MoldManagementFormData, value: string) => {
    setMoldManagement((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdditionalInfoChange = (field: keyof MoldInfoFormData["additionalInfo"], value: string) => {
    setMoldInfo((prev) => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [field]: value,
      },
    }));
  };

  const parseCommaList = (value: string): string[] =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);
    setError(null);

    try {
      const symptomsArray = parseCommaList(moldInfo.symptoms);
      const signsArray = parseCommaList(moldInfo.signs);
      const characteristicsArray = parseCommaList(moldInfo.characteristics);

      const payload = {
        moldName: moldInfo.moldName,
        details: {
          info: {
            description: moldInfo.description,
            taxonomy: moldInfo.taxonomy,
            predicted_class_id: moldInfo.predictedClassId.trim() ? Number(moldInfo.predictedClassId.trim()) : undefined,
            predicted_class_name: moldInfo.predictedClassName.trim() || undefined,
            overview: moldInfo.additionalInfo.overview.trim(),
            health_risks: moldInfo.additionalInfo.healthRisks.trim(),
            affected_hosts: moldInfo.additionalInfo.affectedHosts.trim(),
            symptoms_and_signs: moldInfo.additionalInfo.symptomsSigns.trim(),
            disease_cycle_spread_impact: moldInfo.additionalInfo.diseaseCycleImpact.trim(),
            prevention_summary: moldInfo.additionalInfo.preventionSummary.trim(),
          },
          prevention: moldManagement,
        },
        ...(symptomsArray.length ? { symptoms: symptomsArray } : {}),
        ...(signsArray.length ? { signs: signsArray } : {}),
        ...(characteristicsArray.length ? { characteristics: characteristicsArray } : {}),
      };

      const method = moldId ? "PATCH" : "POST";
      const url = moldId ? `/api/v1/mold/${moldId}` : "/api/v1/mold";
      await apiMutate(url, { method: method as "POST" | "PATCH", body: payload });

      await invalidateMolds();
      setTimeout(() => {
        router.push("./");
      }, 500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to save mold information",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    if (!moldId || moldStatus === "reviewed") return;

    setIsMarkingReviewed(true);
    setError(null);

    try {
      await apiMutate(`/api/v1/mold/${moldId}`, {
        method: "PATCH",
        body: { status: "reviewed" },
      });
      setMoldStatus("reviewed");
      await invalidateMolds();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to mark as reviewed",
      );
    } finally {
      setIsMarkingReviewed(false);
    }
  };

  const navigateBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/content-management/tab-content/mold-info");
  };

  const handleBack = () => {
    setIsBackModalOpen(true);
  };

  const fieldLabelClass = "text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] opacity-40";
  const cardTitleClass = "font-black text-2xl text-[var(--primary-color)] uppercase tracking-tight";
  const cardNoteClass = "text-[10px] font-black uppercase tracking-[0.35em] text-[var(--primary-color)]/25";
  const sectionCardClass = "p-10 rounded-[3rem] border-2 border-[var(--primary-color)]/5 flex flex-col gap-8 bg-transparent";
  const inputClass = "w-full py-4 bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-lg placeholder:text-[var(--primary-color)]/20 focus:outline-none transition-all tracking-tight border-b border-[var(--primary-color)]/10 focus:border-[var(--accent-color)]";

  const navItems = [
    { id: "description", label: "Description" },
    { id: "taxonomy", label: "Taxonomy" },
    { id: "additional-info", label: "Additional Info" },
    { id: "management", label: "Management" },
  ];

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full font-[family-name:var(--font-bricolage-grotesque)]">
      <TopLoadingBar isVisible={isSaving || isMarkingReviewed} />

      <div className="flex flex-col gap-2 mb-8">
        <Breadcrumbs role={userRole} skipSegments={["tab-content", "mold-info", "view-mold-info"]} />
        <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl uppercase tracking-tighter">
          Content Management
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <BackButton onClick={handleBack} />
          
        </div>
      </div>

      {isLoading && <PageLoading message="Loading mold data..." />}
      {error && <MessageBanner variant="error" className="mb-4">{error}</MessageBanner>}

      {!isLoading && (
        <>
          <StickyDossierNav items={navItems} />

          <form onSubmit={handleSubmit} className="w-full pb-40">
            
            <div className="max-w-full mx-auto px-4 mb-24 mt-20">
                
              <div className="w-full mb-16">
  {/* SYSTEM REGISTRY STRIP */}
  <div className="flex items-center justify-between border-b border-[var(--primary-color)]/10 pb-4 mb-10">
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary-color)] opacity-30">
        Record Status
      </span>
      <StatusBox status={moldStatus || "Draft"} fontSize="0.65rem" />
    </div>

    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary-color)] opacity-30">
        Ref ID
      </span>
      <span className="font-[family-name:var(--font-bricolage-grotesque)] text-[11px] font-bold tracking-widest text-[var(--primary-color)] opacity-60">
        {moldId?.slice(-6).toUpperCase() || "NEW_ENTRY"}
      </span>
    </div>
  </div>

  {/* MOLD NAME SECTION */}
  <div className="relative group">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)]">
        01. Mold Name
      </span>
      <div className="h-[1px] w-8 bg-[var(--accent-color)] opacity-30" />
    </div>

    <input
      id="moldName"
      type="text"
      value={moldInfo.moldName}
      onChange={(e) => setMoldInfo({ ...moldInfo, moldName: e.target.value })}
      placeholder="Enter mold name..."
      required
      className="w-full bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-montserrat)] text-4xl md:text-5xl font-black placeholder:opacity-10 focus:outline-none tracking-tighter leading-tight transition-all"
    />
    
    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--primary-color)]/20 mt-4 italic">
      Public Facing Record Title
    </p>

    {/* MODEL ID AND NAME FIELDS */}
    <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-[var(--primary-color)]/10">
      <div>
        <label htmlFor="predictedClassId" className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--primary-color)]/50 block mb-2">
          Model ID
        </label>
        <input
          id="predictedClassId"
          type="text"
          value={moldInfo.predictedClassId}
          onChange={(e) => setMoldInfo({ ...moldInfo, predictedClassId: e.target.value })}
          placeholder="e.g., 1, 2, 3..."
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="predictedClassName" className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--primary-color)]/50 block mb-2">
          Model Name
        </label>
        <input
          id="predictedClassName"
          type="text"
          value={moldInfo.predictedClassName}
          onChange={(e) => setMoldInfo({ ...moldInfo, predictedClassName: e.target.value })}
          placeholder="e.g., Alternaria_spp..."
          className={inputClass}
        />
      </div>
    </div>
  </div>
</div>
            </div>

            <div className="max-w-full mx-auto px-4 space-y-20">
              <section id="description" className="scroll-mt-32">
                <div className="flex flex-col gap-2 mb-8">
                  <label className={fieldLabelClass}>Section 01</label>
                  <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">
                    Description
                  </h2>
                </div>
                <div className={sectionCardClass}>
                  <div className="flex flex-col gap-2">
                    <h3 className={cardTitleClass}>Core Description</h3>
                    <span className={cardNoteClass}>Biological Overview</span>
                  </div>
                  <textarea
                    id="description"
                    value={moldInfo.description}
                    onChange={(e) => setMoldInfo({ ...moldInfo, description: e.target.value })}
                    rows={6}
                    placeholder="Enter detailed description of the mold genus..."
                    className="w-full min-h-[220px] bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-lg placeholder:text-[var(--primary-color)]/20 focus:outline-none resize-y leading-8"
                  />
                </div>
              </section>

              <section id="taxonomy" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
                <div className="flex flex-col gap-2 mb-8">
                  <label className={fieldLabelClass}>Section 02</label>
                  <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">
                    Taxonomy
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {[
                    ["kingdom", "Kingdom"],
                    ["phylum", "Phylum"],
                    ["class", "Class"],
                    ["order", "Order"],
                    ["family", "Family"],
                    ["genus", "Genus"],
                  ].map(([key, label]) => (
                    <div key={key} className={sectionCardClass}>
                      <div className="flex flex-col gap-2">
                        <h3 className={cardTitleClass}>{label}</h3>
                        <span className={cardNoteClass}>Taxonomy Field</span>
                      </div>
                      <input
                        id={key}
                        type="text"
                        value={moldInfo.taxonomy[key as keyof MoldInfoFormData["taxonomy"]]}
                        onChange={(e) => handleTaxonomyChange(key as keyof MoldInfoFormData["taxonomy"], e.target.value)}
                        placeholder={label}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section id="additional-info" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
                <div className="flex flex-col gap-2 mb-8">
                  <label className={fieldLabelClass}>Section 03</label>
                  <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">
                    Additional Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {[
                    ["overview", "Overview", "Short background and context"],
                    ["healthRisks", "Health Risks", "Known risks and safety concerns"],
                    ["affectedHosts", "Affected Hosts", "Crops, hosts, and contexts affected"],
                    ["symptomsSigns", "Symptoms and Signs", "Field-visible symptoms and signs"],
                    ["diseaseCycleImpact", "Disease Cycle / Spread / Impact", "Lifecycle, spread behavior, and practical impact"],
                    ["preventionSummary", "Prevention Summary", "Quick prevention summary for operators"],
                  ].map(([key, label, placeholder]) => (
                    <div key={key} className={sectionCardClass}>
                      <div className="flex flex-col gap-2">
                        <h3 className={cardTitleClass}>{label}</h3>
                        <span className={cardNoteClass}>Reference Note</span>
                      </div>
                      <textarea
                        id={key}
                        value={moldInfo.additionalInfo[key as keyof MoldInfoFormData["additionalInfo"]]}
                        onChange={(e) => handleAdditionalInfoChange(key as keyof MoldInfoFormData["additionalInfo"], e.target.value)}
                        rows={4}
                        placeholder={placeholder}
                        className="w-full min-h-[180px] bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-lg placeholder:text-[var(--primary-color)]/20 focus:outline-none resize-y leading-8"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section id="management" className="scroll-mt-32 pt-12 border-t border-[var(--primary-color)]/10">
                <div className="flex flex-col gap-2 mb-8">
                  <label className={fieldLabelClass}>Section 04</label>
                  <h2 className="font-black text-3xl text-[var(--primary-color)] uppercase tracking-tighter font-[family-name:var(--font-montserrat)]">
                    Management
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-12">
                  {[
                    ["physicalControl", "Physical Control"],
                    ["mechanicalControl", "Mechanical Control"],
                    ["culturalControl", "Cultural Control"],
                    ["biologicalControl", "Biological Control"],
                    ["chemicalControl", "Chemical Control"],
                  ].map(([key, label], index) => (
                    <div key={key} className={sectionCardClass}>
                      <div className="flex flex-col gap-2">
                        <h3 className={cardTitleClass}>{label}</h3>
                        <span className={cardNoteClass}>Protocol 0{index + 1}</span>
                      </div>
                      <textarea
                        id={key}
                        value={moldManagement[key as keyof MoldManagementFormData]}
                        onChange={(e) => handleManagementChange(key as keyof MoldManagementFormData, e.target.value)}
                        rows={5}
                        placeholder={`Describe ${label.toLowerCase()} methods...`}
                        className="w-full min-h-[200px] bg-transparent text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)] text-lg placeholder:text-[var(--primary-color)]/20 focus:outline-none resize-y leading-8"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit flex items-center gap-4">
              {moldId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMarkAsReviewed();
                  }}
                  disabled={isMarkingReviewed || moldStatus === "reviewed" || isSaving}
                  className="flex items-center gap-2 bg-[var(--moldify-blue)] text-white font-black uppercase tracking-[0.2em] px-8 py-5 rounded-full hover:scale-105 transition-all text-xs shadow-2xl border-2 border-white/20 cursor-pointer disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faRotate} className={isMarkingReviewed ? "animate-spin" : ""} />
                  {isMarkingReviewed ? "Saving..." : moldStatus === "reviewed" ? "Reviewed" : "Mark Reviewed"}
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving || !moldInfo.moldName.trim()}
                className="flex items-center gap-2 bg-[var(--primary-color)] text-white font-black uppercase tracking-[0.2em] px-12 py-5 rounded-full hover:scale-105 transition-all text-xs shadow-2xl border-2 border-white/20 cursor-pointer disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                {isSaving ? "Syncing..." : "Save Changes"}
              </button>
            </div>
          </form>
        </>
      )}

      <style>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid rgba(var(--primary-rgb), 0.1) !important; padding: 0 0 1rem 0 !important; margin-bottom: 1rem !important; }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { font-family: var(--font-bricolage-grotesque) !important; color: var(--primary-color) !important; font-size: 1.1rem !important; min-height: 200px !important; padding: 0 !important; }
        .ql-editor.ql-blank::before { color: var(--primary-color) !important; opacity: 0.2 !important; left: 0 !important; }
      `}</style>

      <ConfirmModal
        isOpen={showConfirmModal}
        title={moldId ? "Update Mold Information" : "Publish Mold Information"}
        subtitle="Are you sure you want to save this mold information? This will make it available to all users."
        cancelText="Cancel"
        confirmText={moldId ? "Update" : "Publish"}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPublish}
      />

      <ConfirmModal
        isOpen={isBackModalOpen}
        title="Discard changes?"
        subtitle="If you leave this page now, unsaved edits will be lost."
        cancelText="Stay"
        confirmText="Leave"
        onCancel={() => setIsBackModalOpen(false)}
        onConfirm={() => {
          setIsBackModalOpen(false);
          navigateBack();
        }}
      />
    </main>
  );
}