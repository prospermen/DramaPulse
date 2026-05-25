export interface Drama {
  id: number;
  title: string;
  description: string;
  cover_url: string;
  status: string;
}

export interface Episode {
  id: number;
  drama_id: number;
  episode_no: number;
  title: string;
  video_url: string;
  subtitle_url: string;
  subtitle_content: string;
  duration: number;
  analyze_status: string;
  analyze_error: string;
}

export interface Highlight {
  id: number;
  episode_id: number;
  start_time: number;
  end_time: number;
  highlight_type: string;
  emotion: string;
  intensity: number;
  confidence: number;
  trigger_score: number;
  reason: string;
  button_text: string;
  effect: string;
  status: string;
}

export interface HighlightStats {
  highlight_id: number;
  episode_id: number;
  start_time: number;
  end_time: number;
  highlight_type: string;
  button_text: string;
  status: string;
  impression_count: number;
  click_count: number;
  ignore_count: number;
  click_rate: number;
}

export type EpisodeTimelineItem = HighlightStats;

export interface Overview {
  drama_count: number;
  episode_count: number;
  highlight_count: number;
  published_highlight_count: number;
  interaction_count: number;
  click_count: number;
  ignore_count: number;
  avg_click_rate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
