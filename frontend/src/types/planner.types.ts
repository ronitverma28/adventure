import type { Trek } from '@/types/trek.types';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type FitnessLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'ATHLETE';

export interface PlannerInput {
  experience: ExperienceLevel;
  budget: number;           // INR per person
  availableDays: number;
  month: string;            // e.g. 'January'
  fitnessLevel: FitnessLevel;
  locationPreference: string; // state name or 'Any'
}

export interface TrekRecommendation {
  trek: Trek;
  score: number;            // 0–100
  matchReasons: string[];   // why this trek was recommended
  warnings: string[];       // things to be aware of
  preparationPlan: PreparationPlan;
  packingList: PackingCategory[];
}

export interface PreparationPlan {
  weeksNeeded: number;
  phases: PreparationPhase[];
}

export interface PreparationPhase {
  week: string;             // e.g. 'Week 1–2'
  title: string;
  tasks: string[];
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface PackingItem {
  name: string;
  essential: boolean;
  note?: string;
}

export interface PlannerResult {
  input: PlannerInput;
  recommendations: TrekRecommendation[];
  generatedAt: string;
}
