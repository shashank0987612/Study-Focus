import { UserProfile } from './types';

export const LEVEL_THRESHOLDS = {
  NOVICE: 0,
  LEARNER: 100,
  FOCUSED: 500,
  VETERAN: 1500,
  TIME_LORD: 5000,
};

export const INITIAL_PROFILE: UserProfile = {
  name: 'Student',
  level: 0,
  xp: 0,
  title: 'Novice',
  coins: 0,
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

export const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Focus on being productive instead of busy.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your future is created by what you do today, not tomorrow.",
  "Don't watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it is done.",
  "Success is the sum of small efforts, repeated day in and day out."
];

export const AMBIENT_SOUNDS = [
  { name: 'Lofi Beats', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3' },
  { name: 'Rain', url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=rain-and-thunder-16705.mp3' },
  { name: 'Piano', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_27c8a41766.mp3?filename=piano-moment-11394.mp3' }
];

export const PRESET_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop', // Nature
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1974&auto=format&fit=crop', // Foggy Forest
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop', // Mountains
  'https://images.unsplash.com/photo-1534274988754-87a9e9923055?q=80&w=2070&auto=format&fit=crop'  // Rain window
];