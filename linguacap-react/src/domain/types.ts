export type Role = 'learner' | 'teacher' | 'admin';
export type Level = 'A1' | 'A2';
export type Pace = 'Standard' | 'Intensif';
export type Skill = 'Lecture' | 'Écoute' | 'Expression écrite' | 'Expression orale' | 'Vocabulaire';
export type StudentStatus = 'on-track' | 'at-risk' | 'review';

export interface Goal {
  level: Level;
  title: string;
  targetDate: string;
  pace: Pace;
  days: number[];
  sessionsPerDay: number;
  minutesPerSession: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  level: Level;
  teacher: string | null;
  progress: number;
  status: StudentStatus;
  lastActivity: string;
  targetDate: string;
}

export interface Question {
  prompt: string;
  choices: string[];
  correct: number;
  feedback: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  kind: 'image' | 'audio';
  src: string;
  alt?: string;
  transcript?: string;
  credit?: string;
}

export interface Lesson {
  id: string;
  title: string;
  skill: Skill;
  summary: string;
  phrases: { german: string; french: string }[];
  question: Question;
  mediaIds: string[];
}

export interface Session {
  id: string;
  lessonId: string;
  day: number;
  minutes: number;
  completed: boolean;
  score?: number;
}

export interface Assessment {
  id: string;
  title: string;
  level: Level;
  type: 'Diagnostic' | 'Bilan' | 'Examen blanc';
  learnerId: string;
  dueDate: string;
  status: 'ready' | 'submitted' | 'reviewed';
  score?: number;
  writing?: string;
  audioName?: string;
  audioSrc?: string;
  feedback?: string;
}

export interface Encouragement {
  id: string;
  learnerId: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Invitation {
  id: string;
  name: string;
  email: string;
  role: Role;
  teacher: string | null;
  status: 'pending' | 'cancelled';
  createdAt: string;
}

export interface CatalogEntry {
  id: string;
  level: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  mediaIds: string[];
}

export interface DemoState {
  goal: Goal;
  students: Student[];
  sessions: Session[];
  assessments: Assessment[];
  messages: Encouragement[];
  invitations: Invitation[];
  catalog: CatalogEntry[];
  media: MediaAsset[];
}
