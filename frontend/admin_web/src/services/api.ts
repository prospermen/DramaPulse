import axios from 'axios';
import type { ApiResponse, Drama, Episode, EpisodeTimelineItem, Highlight, HighlightStats, Overview } from '../types/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'X-Admin-Token': import.meta.env.VITE_ADMIN_TOKEN ?? 'demo-admin-token',
  },
});

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  return response.data.data;
}

export const adminApi = {
  seedDemo: () => unwrap<{ drama_id: number; episode_id: number }>(api.post('/api/demo/seed')),
  listDramas: () => unwrap<Drama[]>(api.get('/api/dramas')),
  createDrama: (payload: Pick<Drama, 'title' | 'description' | 'cover_url'>) =>
    unwrap<Drama>(api.post('/api/dramas', payload)),
  listEpisodes: () => unwrap<Episode[]>(api.get('/api/episodes')),
  createEpisode: (payload: Omit<Episode, 'id' | 'analyze_status' | 'analyze_error'>) =>
    unwrap<Episode>(api.post('/api/episodes', payload)),
  analyzeEpisode: (episodeId: number) =>
    unwrap<{ highlight_count: number; provider: string; llm_error?: string }>(
      api.post(`/api/episodes/${episodeId}/analyze`, { force_reanalyze: true }),
    ),
  listHighlights: (episodeId: number) => unwrap<Highlight[]>(api.get(`/api/episodes/${episodeId}/highlights`)),
  publishHighlights: (episodeId: number) =>
    unwrap<{ published_count: number }>(api.post(`/api/episodes/${episodeId}/highlights/publish`)),
  bulkHighlightStatus: (episodeId: number, highlightIds: number[] | null, status: string) =>
    unwrap<{ updated_count: number; status: string }>(
      api.post(`/api/episodes/${episodeId}/highlights/bulk-status`, {
        highlight_ids: highlightIds,
        status,
      }),
    ),
  updateHighlight: (highlightId: number, payload: Partial<Highlight>) =>
    unwrap<Highlight>(api.put(`/api/highlights/${highlightId}`, payload)),
  archiveHighlight: (highlightId: number) => unwrap<Highlight>(api.delete(`/api/highlights/${highlightId}`)),
  overview: () => unwrap<Overview>(api.get('/api/analytics/overview')),
  highlightRanking: (limit = 20) => unwrap<HighlightStats[]>(api.get('/api/analytics/highlight-ranking', { params: { limit } })),
  episodeTimeline: (episodeId: number) =>
    unwrap<EpisodeTimelineItem[]>(api.get(`/api/analytics/episodes/${episodeId}/timeline`)),
  highlightStats: (highlightId: number) => unwrap<HighlightStats>(api.get(`/api/analytics/highlights/${highlightId}`)),
};
