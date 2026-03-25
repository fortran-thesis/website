import {describe, expect, it} from '@jest/globals';
import {
  buildCanonicalAdditionalInfo,
  normalizeInfoSections,
  unwrapMoldResponse,
} from '@/lib/mold-detail-normalizer';

describe('mold-detail normalizer', () => {
  it('prefers scalar fields over additional_info aliases', () => {
    const sections = normalizeInfoSections({
      overview: 'Canonical overview',
      additional_info: [{title: 'Overview', description: 'Legacy overview'}],
    });

    expect(sections.overview).toBe('Canonical overview');
  });

  it('falls back to additional_info aliases when scalar fields are missing', () => {
    const sections = normalizeInfoSections({
      additional_info: [
        {title: 'Symptoms & Signs', description: 'Lesions and yellowing'},
        {title: 'Affected Crops', description: 'Bulb crops'},
      ],
    });

    expect(sections.symptomsSigns).toBe('Lesions and yellowing');
    expect(sections.affectedHosts).toBe('Bulb crops');
  });

  it('builds canonical additional_info rows for submit payloads', () => {
    const rows = buildCanonicalAdditionalInfo({
      overview: 'Overview body',
      healthRisks: 'Risk body',
      affectedHosts: '',
      symptomsSigns: '',
      diseaseCycleImpact: '',
      preventionSummary: 'Prevention body',
    });

    expect(rows).toEqual([
      {title: 'Overview', description: 'Overview body'},
      {title: 'Health Risks', description: 'Risk body'},
      {title: 'Prevention Summary', description: 'Prevention body'},
    ]);
  });

  it('unwraps nested envelope responses', () => {
    const normalized = unwrapMoldResponse({
      data: {
        data: {
          id: 'mold-1',
          name: 'Aspergillus',
        },
      },
    });

    expect(normalized.id).toBe('mold-1');
    expect(normalized.name).toBe('Aspergillus');
  });
});
