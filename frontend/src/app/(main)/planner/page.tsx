import type { Metadata } from 'next';
import PlannerClient from './PlannerClient';

export const metadata: Metadata = {
  title: 'AI Trek Planner | Personalized Himalayan Expeditions',
  description:
    'Use our advanced AI Trek Planner to find your ideal Himalayan trek. Get personalized recommendations, preparation guidelines, and packing checklists matched to your experience, budget, and fitness level.',
  keywords: [
    'AI trek planner',
    'plan Himalayan trek',
    'trek matching tool',
    'trek fitness guidelines',
    'packing list generator',
  ],
  alternates: {
    canonical: 'https://adventure.com/planner',
  },
};

export default function PlannerPage() {
  return <PlannerClient />;
}
