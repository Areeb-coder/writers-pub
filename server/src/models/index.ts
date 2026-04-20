import mongoose, { Schema, Types } from 'mongoose';

type PlainObject = Record<string, unknown>;

function toJSONTransform(_doc: any, ret: any) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

const commonSchemaOptions = {
  timestamps: true,
  toJSON: { transform: toJSONTransform },
  toObject: { transform: toJSONTransform },
};

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, default: null },
    display_name: { type: String, required: true, trim: true, maxlength: 100 },
    avatar_url: { type: String, default: null },
    bio: { type: String, default: null },
    role: { type: String, enum: ['writer', 'editor', 'reader', 'admin'], default: 'writer' },
    genres: { type: [String], default: [] },
    trust_score: { type: Number, default: 50 },
    streak_days: { type: Number, default: 0 },
    streak_last: { type: Date, default: null },
    is_verified: { type: Boolean, default: false },
    oauth_provider: { type: String, default: null },
    oauth_id: { type: String, default: null },
    refresh_token: { type: String, default: null },
  },
  commonSchemaOptions
);

const DraftSchema = new Schema(
  {
    author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 500 },
    content: { type: Schema.Types.Mixed, default: {} },
    content_text: { type: String, default: '' },
    genre: { type: String, default: null },
    status: {
      type: String,
      enum: ['draft', 'shared', 'under_review', 'accepted', 'published'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'editors_only', 'public'],
      default: 'private',
      index: true,
    },
    ai_critique: { type: Schema.Types.Mixed, default: null },
    word_count: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    tags: { type: [String], default: [] },
    plagiarism_score: { type: Number, default: 0 },
    last_plagiarism_check: { type: Date, default: null },
  },
  commonSchemaOptions
);

const DraftVersionSchema = new Schema(
  {
    draft_id: { type: Schema.Types.ObjectId, ref: 'Draft', required: true, index: true },
    content: { type: Schema.Types.Mixed, required: true },
    content_text: { type: String, default: '' },
    word_count: { type: Number, default: 0 },
    version_number: { type: Number, required: true },
  },
  commonSchemaOptions
);

const FeedbackSchema = new Schema(
  {
    draft_id: { type: Schema.Types.ObjectId, ref: 'Draft', required: true, index: true },
    reviewer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scores: {
      plot: { type: Number, required: true },
      pacing: { type: Number, required: true },
      character: { type: Number, required: true },
      grammar: { type: Number, default: null },
    },
    written_feedback: { type: String, default: null },
    helpfulness_score: { type: Number, default: 0 },
    is_anonymous: { type: Boolean, default: false },
  },
  commonSchemaOptions
);
FeedbackSchema.index({ draft_id: 1, reviewer_id: 1 }, { unique: true });

const InlineCommentSchema = new Schema(
  {
    draft_id: { type: Schema.Types.ObjectId, ref: 'Draft', required: true, index: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    anchor_from: { type: Number, required: true },
    anchor_to: { type: Number, required: true },
    comment_text: { type: String, required: true },
    is_resolved: { type: Boolean, default: false },
    parent_id: { type: Schema.Types.ObjectId, ref: 'InlineComment', default: null },
  },
  commonSchemaOptions
);

const OpportunitySchema = new Schema(
  {
    publisher_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 300 },
    description: { type: String, default: null },
    genres: { type: [String], default: [] },
    deadline: { type: Date, default: null },
    word_limit_max: { type: Number, default: null },
    is_paid: { type: Boolean, default: false },
    payment_details: { type: String, default: null },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  commonSchemaOptions
);

const SubmissionSchema = new Schema(
  {
    draft_id: { type: Schema.Types.ObjectId, ref: 'Draft', required: true },
    opportunity_id: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    submitter_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'],
      default: 'submitted',
      index: true,
    },
    editor_feedback: { type: String, default: null },
    reviewed_at: { type: Date, default: null },
  },
  commonSchemaOptions
);
SubmissionSchema.index({ draft_id: 1, opportunity_id: 1 }, { unique: true });

const NotificationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['feedback_received', 'submission_update', 'ai_ready', 'achievement_unlocked', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    is_read: { type: Boolean, default: false },
  },
  commonSchemaOptions
);

const AchievementSchema = new Schema(
  {
    key: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    icon: { type: String, required: true },
    requirement_value: { type: Number, required: true, default: 1 },
  },
  commonSchemaOptions
);

const UserAchievementSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievement_id: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true, index: true },
    progress: { type: Number, default: 0 },
    earned: { type: Boolean, default: false },
    earned_at: { type: Date, default: null },
  },
  commonSchemaOptions
);
UserAchievementSchema.index({ user_id: 1, achievement_id: 1 }, { unique: true });

const WritingSessionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    draft_id: { type: Schema.Types.ObjectId, ref: 'Draft', default: null },
    started_at: { type: Date, default: () => new Date() },
    ended_at: { type: Date, default: null },
    words_written: { type: Number, default: 0 },
  },
  commonSchemaOptions
);

const AIEmbeddingSchema = new Schema(
  {
    entity_type: { type: String, required: true },
    entity_id: { type: Schema.Types.ObjectId, required: true },
    embedding: { type: [Number], default: [] },
    updated_at: { type: Date, default: () => new Date() },
  },
  commonSchemaOptions
);
AIEmbeddingSchema.index({ entity_type: 1, entity_id: 1 }, { unique: true });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const DraftModel = mongoose.models.Draft || mongoose.model('Draft', DraftSchema);
export const DraftVersionModel = mongoose.models.DraftVersion || mongoose.model('DraftVersion', DraftVersionSchema);
export const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
export const InlineCommentModel = mongoose.models.InlineComment || mongoose.model('InlineComment', InlineCommentSchema);
export const OpportunityModel = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);
export const SubmissionModel = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const AchievementModel = mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);
export const UserAchievementModel = mongoose.models.UserAchievement || mongoose.model('UserAchievement', UserAchievementSchema);
export const WritingSessionModel = mongoose.models.WritingSession || mongoose.model('WritingSession', WritingSessionSchema);
export const AIEmbeddingModel = mongoose.models.AIEmbedding || mongoose.model('AIEmbedding', AIEmbeddingSchema);

export function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id);
}

export function toObjectId(id: string) {
  return new Types.ObjectId(id);
}

export function normalize(doc: any) {
  if (!doc) return doc;
  if (typeof doc.toJSON === 'function') return doc.toJSON();
  return doc;
}

export function ensureObjectId(id: string, fieldName: string) {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

export function averageFeedbackScore(scores: { plot: number; pacing: number; character: number }) {
  return (scores.plot + scores.pacing + scores.character) / 3;
}

export type MongoMetadata = PlainObject;
