
export type Locale = 'ko' | 'en' | 'zh';

export interface UserInput {
  name: string;
  dob: string;
  tob?: string;
  facePhoto?: File;
}

export interface FortuneResult {
  category: string;
  summary: string;
  details: string;
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type CategoryKey = 'four_pillars' | 'personality' | 'overall' | 'life_stages' | 'wealth' | 'career' | 'love' | 'health';

export interface ProgressState {
  completedCount: number;
  status: Record<CategoryKey, { status: AnalysisStatus; message: string }>;
}