"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/breadcrumbs_nav';
import BackButton from '@/components/buttons/back_button';
import TabBar from '@/components/tab_bar';
import ConfirmModal from '@/components/modals/confirmation_modal';
import { faInfoCircle, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useMoldById } from '@/hooks/swr';
import { apiMutate, ApiError } from '@/lib/api';

interface MoldInfoFormData {
  moldName: string;
  description: string;
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
    const userRole = "Mycologist";
    const searchParams = useSearchParams();
    const moldId = searchParams.get('id');

    // Form state for General Information tab
    const [moldInfo, setMoldInfo] = useState<MoldInfoFormData>({
      moldName: '',
      description: '',
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

    // SWR: fetch mold data
    const { data: moldSwr, isLoading } = useMoldById(moldId ?? undefined);

    // Sync SWR data → form state when data first arrives
    useEffect(() => {
      const mold = (moldSwr as any)?.data;
      if (!mold) return;
      const apiTax = mold.mold_details?.info?.taxonomy || {};
      setMoldInfo(prev => ({
        ...prev,
        moldName: mold.name || '',
        description: mold.mold_details?.info?.description || '',
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
        setMoldManagement(prev => ({
          ...prev,
          chemicalControl: (mold.mold_details.prevention.fungicide || []).join(', '),
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

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setShowConfirmModal(true);
    };

    // Handle confirmed publish
    const handleConfirmPublish = async () => {
      setShowConfirmModal(false);
      setIsSaving(true);
      setError(null);
      try {
        const payload = {
          moldName: moldInfo.moldName,
          details: {
            info: {
              description: moldInfo.description,
              taxonomy: moldInfo.taxonomy,
            },
            prevention: moldManagement,
          },
        };
        const method = moldId ? 'PATCH' : 'POST';
        const url = moldId ? `/api/v1/mold/${moldId}` : '/api/v1/mold';
        await apiMutate(url, { method: method as 'POST' | 'PATCH', body: payload });
        alert(moldId ? 'Mold information updated successfully!' : 'Mold information published successfully!');
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
