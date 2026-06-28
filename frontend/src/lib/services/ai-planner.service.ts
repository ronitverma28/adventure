import type {
  PlannerInput, PlannerResult, TrekRecommendation,
  PreparationPlan, PackingCategory,
} from '@/types/planner.types';
import type { Trek, DifficultyLevel } from '@/types/trek.types';

// ─── Difficulty maps ──────────────────────────────────────────────────────────

const DIFFICULTY_SCORE: Record<DifficultyLevel, number> = {
  EASY: 1, MODERATE: 2, DIFFICULT: 3, EXTREME: 4,
};

const EXPERIENCE_MAX_DIFFICULTY: Record<string, number> = {
  BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 4,
};

const FITNESS_MAX_DIFFICULTY: Record<string, number> = {
  LOW: 1, MODERATE: 2, HIGH: 3, ATHLETE: 4,
};

// ─── Scoring engine ───────────────────────────────────────────────────────────

function scoreTrek(trek: Trek, input: PlannerInput): number {
  let score = 50; // base

  const diffScore = DIFFICULTY_SCORE[trek.difficulty];
  const expMax    = EXPERIENCE_MAX_DIFFICULTY[input.experience];
  const fitMax    = FITNESS_MAX_DIFFICULTY[input.fitnessLevel];
  const maxAllowed = Math.min(expMax, fitMax);

  // Difficulty fit (±30 pts)
  if (diffScore <= maxAllowed) {
    score += (maxAllowed - diffScore + 1) * 8; // easier than max = bonus
  } else {
    score -= (diffScore - maxAllowed) * 20;    // harder than allowed = penalty
  }

  // Budget fit (±20 pts)
  if (trek.pricePerPerson <= input.budget) {
    const ratio = trek.pricePerPerson / input.budget;
    score += ratio >= 0.6 ? 20 : 10; // sweet spot: 60–100% of budget
  } else {
    score -= Math.min(30, Math.round(((trek.pricePerPerson - input.budget) / input.budget) * 40));
  }

  // Duration fit (±15 pts)
  if (trek.durationDays <= input.availableDays) {
    const slack = input.availableDays - trek.durationDays;
    score += slack <= 2 ? 15 : slack <= 5 ? 10 : 5;
  } else {
    score -= (trek.durationDays - input.availableDays) * 8;
  }

  // Season fit (±15 pts)
  if (trek.bestSeason?.includes(input.month)) {
    score += 15;
  } else {
    score -= 10;
  }

  // Location preference (±10 pts)
  if (input.locationPreference !== 'Any') {
    if (trek.state === input.locationPreference) score += 10;
    else score -= 5;
  }

  // Popularity bonus (up to +5)
  score += Math.min(5, Math.round(trek.avgRating - 4) * 5);

  return Math.max(0, Math.min(100, score));
}

// ─── Reason generator ─────────────────────────────────────────────────────────

function buildReasons(trek: Trek, input: PlannerInput, score: number): string[] {
  const reasons: string[] = [];
  const diffScore = DIFFICULTY_SCORE[trek.difficulty];
  const expMax    = EXPERIENCE_MAX_DIFFICULTY[input.experience];
  const fitMax    = FITNESS_MAX_DIFFICULTY[input.fitnessLevel];

  if (diffScore <= Math.min(expMax, fitMax)) {
    reasons.push(`Difficulty (${trek.difficulty.toLowerCase()}) matches your ${input.experience.toLowerCase()} experience level`);
  }
  if (trek.pricePerPerson <= input.budget) {
    reasons.push(`Price of ₹${trek.pricePerPerson.toLocaleString('en-IN')} fits within your ₹${input.budget.toLocaleString('en-IN')} budget`);
  }
  if (trek.durationDays <= input.availableDays) {
    reasons.push(`${trek.durationDays}-day duration fits your ${input.availableDays} available days`);
  }
  if (trek.bestSeason?.includes(input.month)) {
    reasons.push(`${input.month} is an ideal season for this trek`);
  }
  if (input.locationPreference !== 'Any' && trek.state === input.locationPreference) {
    reasons.push(`Located in your preferred region: ${trek.state}`);
  }
  if (trek.avgRating >= 4.8) {
    reasons.push(`Highly rated by trekkers (${trek.avgRating}/5 from ${trek.totalReviews.toLocaleString()} reviews)`);
  }
  if (trek.isBestseller) {
    reasons.push('One of our bestselling treks — consistently loved by adventurers');
  }
  if (score >= 80) {
    reasons.push('Excellent overall match for your profile');
  }
  return reasons.slice(0, 4);
}

function buildWarnings(trek: Trek, input: PlannerInput): string[] {
  const warnings: string[] = [];
  const diffScore = DIFFICULTY_SCORE[trek.difficulty];
  const expMax    = EXPERIENCE_MAX_DIFFICULTY[input.experience];
  const fitMax    = FITNESS_MAX_DIFFICULTY[input.fitnessLevel];

  if (diffScore > Math.min(expMax, fitMax)) {
    warnings.push(`This trek is rated ${trek.difficulty.toLowerCase()} — consider building more experience first`);
  }
  if (trek.pricePerPerson > input.budget) {
    warnings.push(`Price exceeds your budget by ₹${(trek.pricePerPerson - input.budget).toLocaleString('en-IN')}`);
  }
  if (trek.durationDays > input.availableDays) {
    warnings.push(`Requires ${trek.durationDays} days but you have ${input.availableDays} — plan extra buffer days`);
  }
  if (!trek.bestSeason?.includes(input.month)) {
    warnings.push(`${input.month} is not the ideal season — weather may be unpredictable`);
  }
  if (trek.altitudeMax && trek.altitudeMax > 4500) {
    warnings.push(`High altitude (${trek.altitudeMax}m) — acclimatisation is critical`);
  }
  return warnings;
}

// ─── Preparation plan generator ───────────────────────────────────────────────

function buildPreparationPlan(trek: Trek, input: PlannerInput): PreparationPlan {
  const diffScore = DIFFICULTY_SCORE[trek.difficulty];
  const weeksNeeded = diffScore === 1 ? 4 : diffScore === 2 ? 6 : diffScore === 3 ? 8 : 12;

  const phases = [
    {
      week: `Week 1–${Math.ceil(weeksNeeded / 3)}`,
      title: 'Base Fitness',
      tasks: [
        'Start 30-minute daily walks, gradually increasing to 60 minutes',
        'Begin stair climbing (10 floors/day) to build leg strength',
        'Hydration habit: drink 3 litres of water daily',
        'Sleep 7–8 hours consistently to aid recovery',
      ],
    },
    {
      week: `Week ${Math.ceil(weeksNeeded / 3) + 1}–${Math.ceil(weeksNeeded * 2 / 3)}`,
      title: 'Endurance Building',
      tasks: [
        'Introduce 5km jogs 3× per week',
        'Add squats, lunges, and calf raises (3 sets × 20 reps)',
        'Weekend hike with a 5–8kg loaded backpack',
        diffScore >= 3
          ? 'Begin altitude awareness training — research AMS symptoms'
          : 'Practice breathing exercises for high-altitude readiness',
        'Reduce processed food; increase protein and complex carbs',
      ],
    },
    {
      week: `Week ${Math.ceil(weeksNeeded * 2 / 3) + 1}–${weeksNeeded - 1}`,
      title: 'Trek-Specific Training',
      tasks: [
        `Simulate ${trek.durationDays}-day trek with back-to-back hikes`,
        'Increase backpack weight to 10–12kg on practice hikes',
        diffScore >= 3
          ? 'Practice on steep terrain — elevation gain of 600m+ per day'
          : 'Focus on sustained pace over 4–6 hours',
        'Break in your trekking boots completely',
        'Test all gear: rain jacket, layers, headlamp, poles',
      ],
    },
    {
      week: `Week ${weeksNeeded} (Final Week)`,
      title: 'Pre-Trek Preparation',
      tasks: [
        'Taper training — light walks only, no strenuous exercise',
        'Medical check-up and fitness clearance from doctor',
        'Pack all gear and do a final checklist review',
        'Confirm booking, emergency contacts, and travel insurance',
        'Research the trek route, weather forecast, and nearest hospital',
        trek.altitudeMax && trek.altitudeMax > 3500
          ? 'Consult doctor about Diamox (altitude sickness medication)'
          : 'Carry basic first-aid kit and personal medications',
      ],
    },
  ];

  return { weeksNeeded, phases };
}

// ─── Packing list generator ────────────────────────────────────────────────────

function buildPackingList(trek: Trek, input: PlannerInput): PackingCategory[] {
  const isWinter  = ['December', 'January', 'February', 'March'].includes(input.month);
  const isHighAlt = (trek.altitudeMax ?? 0) > 4000;
  const isExtreme = trek.difficulty === 'EXTREME';

  return [
    {
      category: 'Clothing',
      items: [
        { name: 'Moisture-wicking base layer (2 sets)', essential: true },
        { name: 'Fleece jacket / mid layer', essential: true },
        { name: 'Waterproof rain jacket', essential: true },
        { name: 'Trek pants (2 pairs)', essential: true },
        { name: 'Thermal innerwear', essential: isWinter, note: isWinter ? 'Essential for winter treks' : 'Optional in summer' },
        { name: 'Warm gloves', essential: isWinter || isHighAlt },
        { name: 'Woollen beanie / balaclava', essential: isWinter || isHighAlt },
        { name: 'Woollen socks (3 pairs)', essential: true },
        { name: 'Gaiters', essential: isWinter, note: 'For snow treks' },
        { name: 'Sun hat / cap', essential: !isWinter },
      ],
    },
    {
      category: 'Footwear',
      items: [
        { name: 'Waterproof trekking boots (broken-in)', essential: true, note: 'Must be worn for 2+ weeks before trek' },
        { name: 'Camp sandals / flip-flops', essential: false },
        { name: isWinter ? 'Microspikes / crampons' : 'Trekking sandals', essential: isWinter },
      ],
    },
    {
      category: 'Gear & Equipment',
      items: [
        { name: '50–60L trekking backpack with rain cover', essential: true },
        { name: `Sleeping bag (rated ${isWinter || isHighAlt ? '-15°C' : '-5°C'})`, essential: true },
        { name: 'Trekking poles (pair)', essential: trek.difficulty !== 'EASY' },
        { name: 'Headlamp + extra batteries', essential: true },
        { name: 'UV-protection sunglasses', essential: true },
        { name: 'Trekking towel (quick-dry)', essential: false },
        { name: 'Dry bags / zip-lock bags', essential: true, note: 'Keep electronics and documents dry' },
      ],
    },
    {
      category: 'Safety & Medical',
      items: [
        { name: 'Personal first-aid kit', essential: true },
        { name: isHighAlt ? 'Diamox (altitude sickness medication)' : 'Paracetamol / pain relief', essential: isHighAlt },
        { name: 'ORS sachets (oral rehydration)', essential: true },
        { name: 'SPF 50+ sunscreen', essential: true },
        { name: 'Lip balm with SPF', essential: true },
        { name: 'Water bottle (1L) + purification tablets', essential: true },
        { name: 'Emergency whistle', essential: isExtreme || isHighAlt },
        { name: 'Blister plasters / moleskin', essential: true },
      ],
    },
    {
      category: 'Documents & Essentials',
      items: [
        { name: 'Government ID (Aadhaar / Passport)', essential: true },
        { name: 'Printed booking ticket', essential: true },
        { name: 'Travel insurance documents', essential: isExtreme || isHighAlt },
        { name: 'Cash (ATMs unavailable on trail)', essential: true },
        { name: 'Power bank (20,000 mAh)', essential: true },
        { name: 'Offline maps downloaded', essential: true, note: 'No mobile signal on trail' },
        { name: 'Emergency contact list (printed)', essential: true },
      ],
    },
    {
      category: 'Food & Nutrition',
      items: [
        { name: 'Energy bars / trail mix (5–7 days supply)', essential: true },
        { name: 'Electrolyte powder sachets', essential: true },
        { name: 'Dark chocolate (quick energy)', essential: false },
        { name: 'Instant oats / protein bars', essential: false },
        { name: 'Dry fruits and nuts', essential: true },
      ],
    },
  ];
}

// ─── Main planner function ────────────────────────────────────────────────────

export function generateTrekPlan(treks: Trek[], input: PlannerInput): PlannerResult {
  const scored = treks
    .filter((t) => t.status === 'ACTIVE')
    .map((trek) => ({
      trek,
      score: scoreTrek(trek, input),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // top 5

  const recommendations: TrekRecommendation[] = scored.map(({ trek, score }) => ({
    trek,
    score,
    matchReasons: buildReasons(trek, input, score),
    warnings: buildWarnings(trek, input),
    preparationPlan: buildPreparationPlan(trek, input),
    packingList: buildPackingList(trek, input),
  }));

  return {
    input,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}
