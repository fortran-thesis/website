export type MoldSectionKey =
  | 'overview'
  | 'healthRisks'
  | 'affectedHosts'
  | 'symptomsSigns'
  | 'diseaseCycleImpact'
  | 'preventionSummary';

type SectionConfig = {
  title: string;
  apiKey: string;
  aliases: string[];
};

export const MOLD_SECTION_CONFIG: Record<MoldSectionKey, SectionConfig> = {
  overview: {
    title: 'Overview',
    apiKey: 'overview',
    aliases: ['overview'],
  },
  healthRisks: {
    title: 'Health Risks',
    apiKey: 'health_risks',
    aliases: ['health risks', 'health risk', 'risk'],
  },
  affectedHosts: {
    title: 'Affected Hosts',
    apiKey: 'affected_hosts',
    aliases: ['affected hosts', 'affected crops', 'hosts', 'host'],
  },
  symptomsSigns: {
    title: 'Symptoms and Signs',
    apiKey: 'symptoms_and_signs',
    aliases: [
      'symptoms and signs',
      'symptoms & signs',
      'symptoms signs',
      'symptoms',
      'signs',
    ],
  },
  diseaseCycleImpact: {
    title: 'Disease Cycle / Spread / Impact',
    apiKey: 'disease_cycle_spread_impact',
    aliases: [
      'disease cycle spread impact',
      'disease cycle spread',
      'disease cycle',
      'spread',
      'impact',
    ],
  },
  preventionSummary: {
    title: 'Prevention Summary',
    apiKey: 'prevention_summary',
    aliases: ['prevention summary', 'prevention'],
  },
};

export const normalizeLabel = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const unwrapMoldResponse = (payload: unknown): Record<string, any> => {
  if (!payload || typeof payload !== 'object') return {};

  const root = payload as Record<string, any>;
  const firstData = root.data;
  if (firstData && typeof firstData === 'object' && !Array.isArray(firstData)) {
    const nestedData = (firstData as Record<string, any>).data;
    if (nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)) {
      return nestedData as Record<string, any>;
    }
    return firstData as Record<string, any>;
  }

  return root;
};

export const readAdditionalInfoValue = (
  rows: Array<{title?: string; description?: string}> | undefined,
  aliases: string[]
): string => {
  if (!Array.isArray(rows)) return '';
  const normalizedAliases = aliases.map(normalizeLabel);

  for (const row of rows) {
    const normalizedTitle = normalizeLabel(String(row?.title ?? ''));
    const content = String(row?.description ?? '').trim();
    if (!normalizedTitle || !content) continue;

    for (const alias of normalizedAliases) {
      if (
        normalizedTitle === alias ||
        normalizedTitle.includes(alias) ||
        alias.includes(normalizedTitle)
      ) {
        return content;
      }
    }
  }

  return '';
};

export const normalizeInfoSections = (
  info: Record<string, any>
): Record<MoldSectionKey, string> => {
  const rows = Array.isArray(info.additional_info)
    ? info.additional_info.filter(
        (row: unknown) =>
          !!row &&
          typeof (row as any).title === 'string' &&
          typeof (row as any).description === 'string'
      )
    : [];

  return (Object.keys(MOLD_SECTION_CONFIG) as MoldSectionKey[]).reduce(
    (acc, key) => {
      const config = MOLD_SECTION_CONFIG[key];
      const scalar = String(info[config.apiKey] ?? '').trim();
      acc[key] = scalar || readAdditionalInfoValue(rows, config.aliases);
      return acc;
    },
    {
      overview: '',
      healthRisks: '',
      affectedHosts: '',
      symptomsSigns: '',
      diseaseCycleImpact: '',
      preventionSummary: '',
    } as Record<MoldSectionKey, string>
  );
};

export const buildCanonicalAdditionalInfo = (
  sections: Record<MoldSectionKey, string>
): Array<{title: string; description: string}> => {
  return (Object.keys(MOLD_SECTION_CONFIG) as MoldSectionKey[])
    .map((key) => {
      const config = MOLD_SECTION_CONFIG[key];
      return {
        title: config.title,
        description: String(sections[key] ?? '').trim(),
      };
    })
    .filter((entry) => entry.description.length > 0);
};
