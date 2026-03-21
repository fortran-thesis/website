import {describe, it, expect} from '@jest/globals';
import type {MoldCase} from '@/hooks/swr/use-mold-cases';

describe('MoldCase Type (Website)', () => {
  describe('CultivationDetails fields', () => {
    it('should accept basic cultivation_details structure', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {
          in_vitro_details: {
            growthMedium: 'PDA',
            incubationTemperature: '28',
          },
        },
      };

      expect(moldCase.cultivation_details?.in_vitro_details?.growthMedium).toBe(
        'PDA'
      );
    });

    it('should accept specimen_types and specimen_quantities', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {
          specimen_types: ['Leaf', 'Stem', 'Root'],
          specimen_quantities: ['5', '3', '2'],
        },
      };

      expect(moldCase.cultivation_details?.specimen_types).toEqual([
        'Leaf',
        'Stem',
        'Root',
      ]);
      expect(moldCase.cultivation_details?.specimen_quantities).toEqual([
        '5',
        '3',
        '2',
      ]);
    });

    it('should accept initial_symptoms and initial_characteristics', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {
          initial_symptoms: ['Leaf spots', 'Wilting'],
          initial_characteristics: ['Cottony', 'Powdery'],
        },
      };

      expect(moldCase.cultivation_details?.initial_symptoms).toEqual([
        'Leaf spots',
        'Wilting',
      ]);
      expect(
        moldCase.cultivation_details?.initial_characteristics
      ).toEqual(['Cottony', 'Powdery']);
    });

    it('should accept location_gathered', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {
          location_gathered: 'Northwest field',
        },
      };

      expect(moldCase.cultivation_details?.location_gathered).toBe(
        'Northwest field'
      );
    });

    it('should accept all new fields together', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        priority: 'high',
        mycologist_id: 'myco-456',
        start_date: new Date().toISOString(),
        cultivation_details: {
          specimen_types: ['Leaf', 'Stem'],
          specimen_quantities: ['5', '3'],
          initial_symptoms: ['Leaf spots'],
          initial_characteristics: ['Cottony'],
          location_gathered: 'Farm A',
          in_vitro_details: {
            growthMedium: 'PDA',
            incubationTemperature: '28',
          },
          in_vivo_details: {
            environmentalTemperature: '25',
          },
        },
      };

      const cultDetails = moldCase.cultivation_details;
      expect(cultDetails?.specimen_types).toHaveLength(2);
      expect(cultDetails?.specimen_quantities).toHaveLength(2);
      expect(cultDetails?.initial_symptoms).toHaveLength(1);
      expect(cultDetails?.initial_characteristics).toHaveLength(1);
      expect(cultDetails?.location_gathered).toBeDefined();
    });

    it('should work with optional fields omitted', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {
          in_vitro_details: {
            growthMedium: 'PDA',
          },
        },
      };

      expect(moldCase.cultivation_details?.specimen_types).toBeUndefined();
      expect(moldCase.cultivation_details?.initial_symptoms).toBeUndefined();
    });

    it('should maintain backward compatibility with old API responses', () => {
      // Old API response without new fields
      const oldResponse: MoldCase = {
        id: 'case-123',
        cultivation_details: {
          in_vitro_details: {
            growthMedium: 'PDA',
            incubationTemperature: '28',
          },
          in_vivo_details: {
            environmentalTemperature: '25',
          },
        },
      };

      // Should still be valid type-wise
      expect(oldResponse.cultivation_details?.in_vitro_details).toBeDefined();
      expect(
        oldResponse.cultivation_details?.specimen_types
      ).toBeUndefined();
    });

    it('should accept empty cultivation_details', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {},
      };

      expect(moldCase.cultivation_details).toBeDefined();
      expect(Object.keys(moldCase.cultivation_details!)).toHaveLength(0);
    });

    it('should allow null cultivation_details', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: null,
      };

      expect(moldCase.cultivation_details).toBeNull();
    });

    it('should work without cultivation_details at all', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        priority: 'high',
      };

      expect(moldCase.cultivation_details).toBeUndefined();
    });
  });

  describe('Type guards and narrowing', () => {
    it('should allow safe optional chaining on specimen arrays', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {
          specimen_types: ['Leaf', 'Stem'],
        },
      };

      const specimenCount = moldCase.cultivation_details?.specimen_types?.length;
      expect(specimenCount).toBe(2);
    });

    it('should work with optional chaining on symptoms', () => {
      const moldCase: MoldCase = {
        id: 'case-123',
        cultivation_details: {},
      };

      const hasSymptoms =
        (moldCase.cultivation_details?.initial_symptoms?.length ?? 0) > 0;
      expect(hasSymptoms).toBe(false);
    });
  });
});
