"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import BackButton from '@/components/buttons/back_button';
import TabBar from '@/components/tab_bar';
import ConfirmModal from '@/components/modals/confirmation_modal';
import { faInfoCircle, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useMoldById } from '@/hooks/swr';
import { apiMutate, ApiError } from '@/lib/api';
import { useInvalidationFunctions } from '@/utils/cache-invalidation';

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
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ViewMoldInfoContent />
    </Suspense>
  );
}

function ViewMoldInfoContent() {
    const userRole = "Mycologist";
    const searchParams = useSearchParams();
    const router = useRouter();
    const moldId = searchParams.get('id');
    const { invalidateMolds } = useInvalidationFunctions();

    // Form state for General Information tab
    const [moldInfo, setMoldInfo] = useState<MoldInfoFormData>({
      moldName: '',
      description: '',
      predictedClassId: '',
      predictedClassName: '',
      symptoms: '',
      signs: '',
      characteristics: '',
      additionalInfo: {
        overview: '',
        healthRisks: '',
        affectedHosts: '',
        symptomsSigns: '',
        diseaseCycleImpact: '',
        preventionSummary: '',
      },
      taxonomy: {
        kingdom: 'Fungi', 
        phylum: 'Ascomycota', 
        class: '',
        order: '',
        family: '',
        genus: '',
      }
    });

    // Form state for Mold Management tab
    const [moldManagement, setMoldManagement] = useState<MoldManagementFormData>({
      physicalControl: '',
      mechanicalControl: '',
      culturalControl: '',
      biologicalControl: '',
      chemicalControl: '',
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizeLabel = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    const additionalInfoValue = (
      rows: Array<{ title?: string; description?: string }> | undefined,
      aliases: string[],
    ) => {
      if (!Array.isArray(rows)) return '';
      const normalizedAliases = aliases.map(normalizeLabel);

      for (const row of rows) {
        const normalizedTitle = normalizeLabel(String(row?.title ?? ''));
        const content = String(row?.description ?? '').trim();
        if (!normalizedTitle || !content) continue;

        for (const alias of normalizedAliases) {
          if (normalizedTitle === alias || normalizedTitle.includes(alias)) {
            return content;
          }
        }
      }

      return '';
    };

    // SWR: fetch mold data
    const { data: moldSwr, isLoading } = useMoldById(moldId ?? undefined);

    // Sync SWR data → form state when data first arrives
    useEffect(() => {
      const mold = (moldSwr as any)?.data;
      if (!mold) return;
      const apiTax = mold.mold_details?.info?.taxonomy || {};
      const info = mold.mold_details?.info || {};
      const additionalInfoRows = Array.isArray(info.additional_info) ? info.additional_info : [];

      setMoldInfo(prev => ({
        ...prev,
        moldName: mold.name || '',
        description: info.description || '',
        predictedClassId: info.predicted_class_id !== undefined ? String(info.predicted_class_id) : '',
        predictedClassName: info.predicted_class_name || '',
        symptoms: Array.isArray(mold.symptoms) ? mold.symptoms.join(', ') : '',
        signs: Array.isArray(mold.signs) ? mold.signs.join(', ') : '',
        characteristics: Array.isArray(mold.characteristics) ? mold.characteristics.join(', ') : '',
        additionalInfo: {
          overview: (info.overview as string) || additionalInfoValue(additionalInfoRows, ['overview']),
          healthRisks: (info.health_risks as string) || additionalInfoValue(additionalInfoRows, ['health risks', 'health risk', 'risk']),
          affectedHosts: (info.affected_hosts as string) || additionalInfoValue(additionalInfoRows, ['affected hosts', 'affected crops', 'hosts', 'host']),
          symptomsSigns: (info.symptoms_and_signs as string) || additionalInfoValue(additionalInfoRows, ['symptoms signs', 'symptoms and signs', 'symptoms', 'signs']),
          diseaseCycleImpact: (info.disease_cycle_spread_impact as string) || additionalInfoValue(additionalInfoRows, ['disease cycle spread', 'disease cycle', 'spread', 'impact']),
          preventionSummary: (info.prevention_summary as string) || additionalInfoValue(additionalInfoRows, ['prevention summary', 'prevention']),
        },
        taxonomy: {
          kingdom: apiTax.kingdom ?? prev.taxonomy.kingdom ?? '',
          phylum: apiTax.phylum ?? prev.taxonomy.phylum ?? '',
          class: apiTax.class ?? prev.taxonomy.class ?? '',
          order: apiTax.order ?? prev.taxonomy.order ?? '',
          family: apiTax.family ?? prev.taxonomy.family ?? '',
          genus: mold.name || apiTax.genus || prev.taxonomy.genus || ''
        }
      }));
      if (mold.mold_details?.prevention) {
        const prev = mold.mold_details.prevention as any;
        setMoldManagement(curr => ({
          physicalControl: prev.physicalControl ?? curr.physicalControl ?? '',
          mechanicalControl: prev.mechanicalControl ?? curr.mechanicalControl ?? '',
          culturalControl: prev.culturalControl ?? curr.culturalControl ?? '',
          biologicalControl: prev.biologicalControl ?? curr.biologicalControl ?? '',
          chemicalControl: Array.isArray(prev.fungicide)
            ? prev.fungicide.join(', ')
            : prev.chemicalControl ?? curr.chemicalControl ?? '',
        }));
      }
    }, [moldSwr]);

    // Update taxonomy field
    const handleTaxonomyChange = (field: keyof MoldInfoFormData['taxonomy'], value: string) => {
      setMoldInfo(prev => ({
        ...prev,
        taxonomy: {
          ...prev.taxonomy,
          [field]: value
        }
      }));
    };

    // Update mold management field
    const handleManagementChange = (field: keyof MoldManagementFormData, value: string) => {
      setMoldManagement(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleAdditionalInfoChange = (
      field: keyof MoldInfoFormData['additionalInfo'],
      value: string,
    ) => {
      setMoldInfo(prev => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          [field]: value,
        },
      }));
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setShowConfirmModal(true);
    };

    // Handle confirmed publish
    const parseCommaList = (value: string): string[] =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    const handleConfirmPublish = async () => {
      setShowConfirmModal(false);
      setIsSaving(true);
      setError(null);
      try {
        const additionalInfoPayload = [
          { title: 'Overview', description: moldInfo.additionalInfo.overview.trim() },
          { title: 'Health Risks', description: moldInfo.additionalInfo.healthRisks.trim() },
          { title: 'Affected Hosts', description: moldInfo.additionalInfo.affectedHosts.trim() },
          { title: 'Symptoms & Signs', description: moldInfo.additionalInfo.symptomsSigns.trim() },
          { title: 'Disease Cycle / Spread / Impact', description: moldInfo.additionalInfo.diseaseCycleImpact.trim() },
          { title: 'Prevention Summary', description: moldInfo.additionalInfo.preventionSummary.trim() },
        ].filter((entry) => entry.description.length > 0);

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
              additional_info: additionalInfoPayload,
            },
            prevention: moldManagement,
          },
          ...(symptomsArray.length ? { symptoms: symptomsArray } : {}),
          ...(signsArray.length ? { signs: signsArray } : {}),
          ...(characteristicsArray.length ? { characteristics: characteristicsArray } : {}),
        };
        const method = moldId ? 'PATCH' : 'POST';
        const url = moldId ? `/api/v1/mold/${moldId}` : '/api/v1/mold';
        await apiMutate(url, { method: method as 'POST' | 'PATCH', body: payload });

        await invalidateMolds();

        // Navigate back to mold info list page after successful submission
        setTimeout(() => {
          router.push('./');
        }, 500);

        // Success handled via UI state; removed intrusive alert dialog.
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message :
          err instanceof Error ? err.message :
          'Failed to save mold information'
        );
      } finally {
        setIsSaving(false);
      }
    };

    // Tab content rendered directly without wrapper functions
    const generalInfoContent = (
      <div className="space-y-6">
        {/* Mold Description */}
        <div>
          <label htmlFor="description" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-semibold mb-2">
            Mold Description
          </label>
          <textarea
            id="description"
            value={moldInfo.description}
            onChange={(e) => setMoldInfo({ ...moldInfo, description: e.target.value })}
            rows={5}
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
            placeholder="Enter detailed description of the mold genus..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="predictedClassId" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
              Predicted Class ID
            </label>
            <input
              id="predictedClassId"
              type="text"
              value={moldInfo.predictedClassId}
              onChange={(e) => setMoldInfo({ ...moldInfo, predictedClassId: e.target.value })}
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
              placeholder="Enter predicted class id"
            />
          </div>

          <div>
            <label htmlFor="predictedClassName" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
              Predicted Class Name
            </label>
            <input
              id="predictedClassName"
              type="text"
              value={moldInfo.predictedClassName}
              onChange={(e) => setMoldInfo({ ...moldInfo, predictedClassName: e.target.value })}
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
              placeholder="Enter predicted class name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="symptoms" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
              Symptoms (comma-separated)
            </label>
            <input
              id="symptoms"
              type="text"
              value={moldInfo.symptoms}
              onChange={(e) => setMoldInfo({ ...moldInfo, symptoms: e.target.value })}
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
              placeholder="eg. yellowing, spotting"
            />
          </div>

          <div>
            <label htmlFor="signs" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
              Signs (comma-separated)
            </label>
            <input
              id="signs"
              type="text"
              value={moldInfo.signs}
              onChange={(e) => setMoldInfo({ ...moldInfo, signs: e.target.value })}
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
              placeholder="eg. white coating, mold colonies"
            />
          </div>

          <div>
            <label htmlFor="characteristics" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
              Characteristics (comma-separated)
            </label>
            <input
              id="characteristics"
              type="text"
              value={moldInfo.characteristics}
              onChange={(e) => setMoldInfo({ ...moldInfo, characteristics: e.target.value })}
              className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
              placeholder="eg. rapid spread, high humidity"
            />
          </div>
        </div>

        {/* Taxonomy Section */}
        <div>
          <h3 className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-bold text-lg mb-4">
            Taxonomy
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kingdom - Prefilled */}
            <div>
              <label htmlFor="kingdom" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Kingdom
              </label>
              <input
                id="kingdom"
                type="text"
                value={moldInfo.taxonomy.kingdom}
                onChange={(e) => handleTaxonomyChange('kingdom', e.target.value)}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Kingdom"
              />
            </div>

            {/* Phylum - Prefilled */}
            <div>
              <label htmlFor="phylum" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Phylum
              </label>
              <input
                id="phylum"
                type="text"
                value={moldInfo.taxonomy.phylum}
                onChange={(e) => handleTaxonomyChange('phylum', e.target.value)}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Phylum"
              />
            </div>

            {/* Class */}
            <div>
              <label htmlFor="class" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Class
              </label>
              <input
                id="class"
                type="text"
                value={moldInfo.taxonomy.class}
                onChange={(e) => handleTaxonomyChange('class', e.target.value)}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Class"
              />
            </div>

            {/* Order */}
            <div>
              <label htmlFor="order" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Order
              </label>
              <input
                id="order"
                type="text"
                value={moldInfo.taxonomy.order}
                onChange={(e) => handleTaxonomyChange('order', e.target.value)}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Order"
              />
            </div>

            {/* Family */}
            <div>
              <label htmlFor="family" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Family
              </label>
              <input
                id="family"
                type="text"
                value={moldInfo.taxonomy.family}
                onChange={(e) => handleTaxonomyChange('family', e.target.value)}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Family"
              />
            </div>

            {/* Genus */}
            <div>
              <label htmlFor="genus" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Genus
              </label>
              <input
                id="genus"
                type="text"
                value={moldInfo.taxonomy.genus}
                onChange={(e) => handleTaxonomyChange('genus', e.target.value)}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Genus"
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div>
          <h3 className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] font-bold text-lg mb-4">
            Additional Information
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="overview" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Overview
              </label>
              <textarea
                id="overview"
                value={moldInfo.additionalInfo.overview}
                onChange={(e) => handleAdditionalInfoChange('overview', e.target.value)}
                rows={3}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Short background and context"
              />
            </div>

            <div>
              <label htmlFor="healthRisks" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Health Risks
              </label>
              <textarea
                id="healthRisks"
                value={moldInfo.additionalInfo.healthRisks}
                onChange={(e) => handleAdditionalInfoChange('healthRisks', e.target.value)}
                rows={3}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Known risks and safety concerns"
              />
            </div>

            <div>
              <label htmlFor="affectedHosts" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Affected Hosts
              </label>
              <textarea
                id="affectedHosts"
                value={moldInfo.additionalInfo.affectedHosts}
                onChange={(e) => handleAdditionalInfoChange('affectedHosts', e.target.value)}
                rows={3}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Crops, hosts, and contexts affected"
              />
            </div>

            <div>
              <label htmlFor="symptomsSigns" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Symptoms and Signs
              </label>
              <textarea
                id="symptomsSigns"
                value={moldInfo.additionalInfo.symptomsSigns}
                onChange={(e) => handleAdditionalInfoChange('symptomsSigns', e.target.value)}
                rows={3}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Field-visible symptoms and signs"
              />
            </div>

            <div>
              <label htmlFor="diseaseCycleImpact" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Disease Cycle / Spread / Impact
              </label>
              <textarea
                id="diseaseCycleImpact"
                value={moldInfo.additionalInfo.diseaseCycleImpact}
                onChange={(e) => handleAdditionalInfoChange('diseaseCycleImpact', e.target.value)}
                rows={4}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Lifecycle, spread behavior, and practical impact"
              />
            </div>

            <div>
              <label htmlFor="preventionSummary" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
                Prevention Summary
              </label>
              <textarea
                id="preventionSummary"
                value={moldInfo.additionalInfo.preventionSummary}
                onChange={(e) => handleAdditionalInfoChange('preventionSummary', e.target.value)}
                rows={3}
                className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                placeholder="Quick prevention summary for operators"
              />
            </div>
          </div>
        </div>
      </div>
    );

    const moldManagementContent = (
      <div className="space-y-6">
        {/* Physical Control */}
        <div>
          <label htmlFor="physicalControl" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
            Physical Control
          </label>
          <textarea
            id="physicalControl"
            value={moldManagement.physicalControl}
            onChange={(e) => handleManagementChange('physicalControl', e.target.value)}
            rows={4}
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
            placeholder="Describe physical control methods..."
          />
        </div>

        {/* Mechanical Control */}
        <div>
          <label htmlFor="mechanicalControl" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
            Mechanical Control
          </label>
          <textarea
            id="mechanicalControl"
            value={moldManagement.mechanicalControl}
            onChange={(e) => handleManagementChange('mechanicalControl', e.target.value)}
            rows={4}
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
            placeholder="Describe mechanical control methods..."
          />
        </div>

        {/* Cultural Control */}
        <div>
          <label htmlFor="culturalControl" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
            Cultural Control
          </label>
          <textarea
            id="culturalControl"
            value={moldManagement.culturalControl}
            onChange={(e) => handleManagementChange('culturalControl', e.target.value)}
            rows={4}
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
            placeholder="Describe cultural control methods..."
          />
        </div>

        {/* Biological Control */}
        <div>
          <label htmlFor="biologicalControl" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
            Biological Control
          </label>
          <textarea
            id="biologicalControl"
            value={moldManagement.biologicalControl}
            onChange={(e) => handleManagementChange('biologicalControl', e.target.value)}
            rows={4}
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
            placeholder="Describe biological control methods..."
          />
        </div>

        {/* Chemical Control */}
        <div>
          <label htmlFor="chemicalControl" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm font-medium mb-2">
            Chemical Control
          </label>
          <textarea
            id="chemicalControl"
            value={moldManagement.chemicalControl}
            onChange={(e) => handleManagementChange('chemicalControl', e.target.value)}
            rows={4}
            className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
            placeholder="Describe chemical control methods..."
          />
        </div>
      </div>
    );

    const tabs = [
      {
        label: "General Information",
        icon: faInfoCircle,
        content: generalInfoContent,
      },
      {
        label: "Mold Management",
        icon: faLeaf,
        content: moldManagementContent,
      },
    ];

    return (
        <main className="relative flex flex-col xl:py-2 py-10 w-full">
            {/* Header Section */}
            <div className="flex flex-row justify-between items-start">
                <div className="flex flex-col">
                    <Breadcrumbs role={userRole} skipSegments={['tab-content', 'mold-info']} />
                    <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
                        CONTENT MANAGEMENT
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                      <BackButton />
                      <span className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-2xl">
                        {moldInfo.moldName || moldInfo.taxonomy.genus || 'Mold Information'}
                      </span>
                    </div>
                </div>
            </div>

            {isLoading && <p className="mt-6 text-[var(--moldify-grey)] text-sm">Loading mold data...</p>}
            {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

            {/* Form */}
            {!isLoading && (
            <form onSubmit={handleSubmit} className="mt-8">
              {/* Mold Name Input */}
              <div className="mb-6">
                <label htmlFor="moldName" className="block font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)] text-sm font-semibold mb-2">
                  Mold Name
                </label>
                <input
                  id="moldName"
                  type="text"
                  value={moldInfo.moldName}
                  onChange={(e) => setMoldInfo({ ...moldInfo, moldName: e.target.value })}
                  className="w-full font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-sm bg-[var(--taupe)] py-3 px-4 rounded-lg focus:outline-none"
                  placeholder="Enter mold common name"
                  required
                />
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <TabBar tabs={tabs} initialIndex={0} />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] font-semibold px-8 py-3 rounded-lg hover:bg-[var(--hover-primary)] transition-colors cursor-pointer text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : moldId ? 'Update Information' : 'Publish Information'}
                </button>
              </div>
            </form>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
              isOpen={showConfirmModal}
              title={moldId ? 'Update Mold Information' : 'Publish Mold Information'}
              subtitle="Are you sure you want to save this mold information? This will make it available to all users."
              cancelText="Cancel"
              confirmText={moldId ? 'Update' : 'Publish'}
              onCancel={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmPublish}
            />
        </main>
    );
}
