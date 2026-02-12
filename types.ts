
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  nextReview?: string;
  interval?: number;
  easeFactor?: number;
  repetitions?: number;
}

export interface Deck {
  id: string;
  name: string;
  category: string;
  cardCount: number;
  lastStudied: string;
  cards: Flashcard[];
  color: string;
}

export type TabType = 'library' | 'ai-generator' | 'statistics' | 'subscription' | 'study';

export interface UserStats {
  cardsStudied: number;
  retentionRate: number;
  streakDays: number;
  studyTimeHours: number;
}
