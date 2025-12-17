export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  title: string;
  coins: number;
  streak: number;
  lastActiveDate: string;
}

export interface Tree {
  id: string;
  type: 'oak' | 'pine' | 'cherry' | 'golden';
  date: string;
  duration: number;
}

export interface Session {
  id: string;
  date: string;
  duration: number; // in minutes
  subject: string;
  rating?: number;
  reflection?: string;
}

export interface Doubt {
  id: string;
  question: string;
  subject: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'Solved';
  image?: string; // Base64
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  lastUpdated: string;
}

export interface VoiceNote {
  id: string;
  url: string; // Blob URL
  date: string;
  duration: string;
}

export interface AppSettings {
  background: string; // URL or preset name
  timerDuration: number;
  breakDuration: number;
  theme: 'glass' | 'matrix';
  volume: number;
  timerSound?: string; // DataURL for custom sound
  xpMultiplier: number;
}

export type ViewState = 'home' | 'dashboard' | 'learn' | 'doubts' | 'calendar' | 'settings';

export interface Task {
  id: string;
  title: string;
  category: 'School' | 'Homework' | 'Exams' | 'Projects';
  status: 'todo' | 'doing' | 'done';
}