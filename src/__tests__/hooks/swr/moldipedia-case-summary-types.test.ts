import {describe, it, expect} from '@jest/globals';
import type {MoldCaseSummary} from '@/hooks/swr/use-moldipedia';

describe('MoldCaseSummary Type (Website)', () => {
  it('accepts enriched evidence_summary payload', () => {
    const entry: MoldCaseSummary = {
      id: 'case-001',
      name: 'Sample Case',
      cultivation_details: {
        initial_symptoms: ['Leaf spot'],
        initial_characteristics: ['Powdery'],
      },
      cultivation_logs: [
        {
          type: 'vivo',
          characteristics: {
            lesion_color: 'brown',
            lesion_size: 2,
          },
        },
      ],
      evidence_summary: {
        initial: {
          microscopic: 'Septate hyphae observed',
          symptoms: ['Leaf spot'],
        },
        in_vivo: {
          characteristics: {
            lesion_color: 'brown',
          },
        },
        in_vitro: {
          characteristics: {
            colony_color: 'olive',
          },
        },
        threshold: {
          type: 'global',
          value: 70,
        },
      },
      final_verdict: {
        moldName: 'Alternaria',
        confidence: '82',
        mycologist_notes: 'Matched morphology and culture behavior.',
      },
    };

    expect(entry.evidence_summary?.threshold?.value).toBe(70);
    expect(entry.final_verdict?.confidence).toBe('82');
    expect(entry.cultivation_logs?.[0].type).toBe('vivo');
  });
});
