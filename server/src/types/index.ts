// ─── User Types ───
export type UserRole = 'writer' | 'editor' | 'reader' | 'admin';

export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  genres: string[];
  trust_score: number;
  streak_days: number;
  streak_last: string | null;
  is_verified: boolean;
  oauth_provider: string | null;
  oauth_id: string | null;
  refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPublicProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  genres: string[];
  trust_score: number;
  streak_days: number;
  is_verified: boolean;
  created_at: string;
  stats: {
    reviews_given: number;
    feedback_received?: number;
    avg_rating?: number;
    drafts_published: number;
    total_words: number;
    rank: number;
    impact: number;
  };
}

// ─── Draft Types ───
export type DraftStatus = 'draft' | 'shared' | 'under_review' | 'accepted' | 'published';
export type DraftVisibility = 'private' | 'editors_only' | 'public';

export interface Draft {
  id: string;
  author_id: string;
  title: string;
  content: any; // JSONB — ProseMirror document
  content_text: string | null;
  genre: string | null;
  status: DraftStatus;
  visibility: DraftVisibility;
  ai_critique: AICritique | null;
  word_count: number;
  progress: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DraftVersion {
  id: string;
  draft_id: string;
  content: any;
  content_text: string | null;
  word_count: number;
  version_number: number;
  created_at: string;
}

// ─── AI Critique Types ───
export interface AICritique {
  scores: {
    plot: number;
    pacing: number;
    character: number;
  };
  suggestions: Array<{
    title: string;
    desc: string;
  }>;
  analyzed_at: string;
}

// ─── Feedback Types ───
export interface Feedback {
  id: string;
  draft_id: string;
  reviewer_id: string;
  scores: {
    plot: number;
    pacing: number;
    character: number;
    grammar: number;
  };
  written_feedback: string | null;
  helpfulness_score: number;
  is_anonymous: boolean;
  created_at: string;
}

export interface InlineComment {
  id: string;
  draft_id: string;
  user_id: string;
  anchor_from: number;
  anchor_to: number;
  comment_text: string;
  is_resolved: boolean;
  parent_id: string | null;
  created_at: string;
}

// ─── Opportunity Types ───
export interface Opportunity {
  id: string;
  publisher_id: string;
  title: string;
  description: string | null;
  genres: string[];
  deadline: string | null;
  word_limit_max: number | null;
  is_paid: boolean;
  payment_details: string | null;
  is_featured: boolean;
  is_active: boolean;
  submission_count: number;
  created_at: string;
}

// ─── Submission Types ───
export type SubmissionStatus = 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';

export interface Submission {
  id: string;
  draft_id: string;
  opportunity_id: string;
  submitter_id: string;
  status: SubmissionStatus;
  editor_feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ─── Notification Types ───
export type NotificationType = 'feedback_received' | 'submission_update' | 'ai_ready' | 'achievement_unlocked' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

// ─── Achievement Types ───
export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  requirement_value: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  earned: boolean;
  earned_at: string | null;
}

// ─── Writing Session Types ───
export interface WritingSession {
  id: string;
  user_id: string;
  draft_id: string | null;
  started_at: string;
  ended_at: string | null;
  words_written: number;
}

// ─── Auth Types ───
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── API Response Types ───
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

