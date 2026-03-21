/**
 * SWR hooks — Mold Cases
 *
 * Covers: mold-case listing, mold-case by report ID, case metadata counts.
 */

'use client';

import useSWR from 'swr';
import { apiUrl, type ApiResponse } from '@/lib/api';
import type { PaginatedResponse } from './types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CultivationLog {
  id?: string;
  type?: string;
  created_at?: { _seconds: number } | string;
  metadata?: { created_at?: { _seconds: number } | string };
  image_url?: string;
  image_urls?: string[];
  microscopic_image_url?: string;
  macroscopic_image_url?: string;
  characteristics?: {
    size?: string;
    color?: string;
    texture?: string;
    confidence?: string | number;
    identified_mold?: string;
    identifiedMold?: string;
    microscopic_identification?: string;
    microscopic_image_url?: string;
    macroscopic_image_url?: string;
    macro_color?: string;
    macroColor?: string;
    macro_texture?: string;
    macroTexture?: string;
    macro_symptoms?: string | string[];
    macroSymptoms?: string | string[];
    macro_characteristics?: string | string[];
    macroCharacteristics?: string | string[];
    symptoms?: string | string[];
    characteristics?: string | string[];
  };
  additional_info?: string;
}

export interface CultivationLogsPage {
  snapshot: CultivationLog[];
  nextPageToken?: string | null;
}

export interface MoldCase {
  id?: string;
  priority?: string;
  mycologist_id?: string;
  mycologist_name?: string;
  is_archived?: boolean;
  start_date?: string | { _seconds: number };
  cultivation_details?: {
    growth_medium?: string;
    in_vitro_details?: {
      growth_medium?: string;
      incubation_temperature?: string;
      growthMedium?: string;
      incubationTemperature?: string;
    };
    in_vivo_details?: {
      environmental_temperature?: string;
      environmentalTemperature?: string;
    };
    specimen_types?: string[];
    specimen_quantities?: string[];
    initial_symptoms?: string[];
    initial_characteristics?: string[];
    location_gathered?: string;
    initial_microscopic?: string;
    initial_macroscopic?: string;
    initial_microscopic_color?: string;
    initial_microscopic_texture?: string;
    initial_macroscopic_color?: string;
    initial_macroscopic_texture?: string;
    initial_macroscopic_symptoms?: string | string[];
    initial_macroscopic_characteristics?: string | string[];
    initial_microscopic_image_url?: string;
    initial_macroscopic_image_url?: string;
    date_observation?: string;
    microscopic_ai_snapshot?: {
      confidence?: string | number;
      [key: string]: unknown;
    };
    scanned_microscopic_ids?: string[];
    scanned_macroscopic_ids?: string[];
    initial_observations?: {
      microscopic_image_path?: string;
      macroscopic_image_path?: string;
      microscopic_image_url?: string;
      macroscopic_image_url?: string;
      identified_mold?: string;
      identifiedMold?: string;
      confidence?: string | number;
      macro_color?: string;
      macroColor?: string;
      macro_texture?: string;
      macroTexture?: string;
      macro_symptoms?: string | string[];
      macroSymptoms?: string | string[];
      macro_characteristics?: string | string[];
      macroCharacteristics?: string | string[];
      initial_symptoms?: string[];
      initial_characteristics?: string[];
      initial_microscopic?: string;
      initial_macroscopic?: string;
      initial_microscopic_image_url?: string;
      initial_macroscopic_image_url?: string;
      initial_macroscopic_color?: string;
      initial_macroscopic_texture?: string;
      initial_macroscopic_symptoms?: string | string[];
      initial_macroscopic_characteristics?: string | string[];
      microscopic_ai_snapshot?: {
        confidence?: string | number;
        [key: string]: unknown;
      };
    };
  };
  cultivation_logs?: CultivationLog[];
}

export interface MoldCaseMetadata {
  count: number;
  createdAt?: unknown;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

/** Fetch a mold case by its parent report ID. */
export function useMoldCaseByReport(reportId: string | undefined) {
  return useSWR<ApiResponse<MoldCase>>(
    reportId ? `/api/v1/mold-cases/by-report/${reportId}` : null,
  );
}

/** Fetch cultivation logs for a mold case by case ID. */
export function useMoldCaseLogs(caseId: string | undefined, limit = 100, enabled = true) {
  return useSWR<ApiResponse<CultivationLogsPage>>(
    enabled && caseId ? apiUrl(`/api/v1/mold-cases/${caseId}/logs`, { limit }) : null,
  );
}

/** Fetch mold-case metadata counts. */
export function useMoldCaseCountsMetadata(enabled = true) {
  return useSWR<ApiResponse<MoldCaseMetadata>>(
    enabled ? '/api/v1/mold-cases/counts/metadata' : null,
  );
}

/** Fetch all mold cases (used by assign modal for case-count). */
export function useMoldCases(limit?: number, enabled = true) {
  return useSWR<ApiResponse<PaginatedResponse<MoldCase>>>(
    enabled ? apiUrl('/api/v1/mold-cases', { limit }) : null,
  );
}
