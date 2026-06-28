export const TREK_EXTRA: Record<string, {
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  fitnessRequirements: { level: string; activities: string[]; tips: string[] };
  safetyInfo: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  guide: { name: string; photo: string; experience: number; languages: string[]; certifications: string[]; bio: string; rating: number; totalTreks: number };
  galleryImages: { url: string; caption: string }[];
  meetingPoint: string;
  nearestAirport: string;
  nearestRailway: string;
  latitude: number;
  longitude: number;
}> = {
  'kedarkantha-trek': {
    inclusions: [
      'All meals from Day 1 dinner to Day 6 breakfast',
      'Accommodation (guesthouse + camping)',
      'Experienced certified trek leader',
      'All camping equipment (tents, sleeping bags, mats)',
      'First aid kit and oxygen cylinder',
      'Forest permit and entry fees',
      'Transport from Dehradun to Sankri and back',
    ],
    exclusions: [
      'Travel to/from Dehradun',
      'Personal trekking gear (shoes, jacket, etc.)',
      'Travel insurance',
      'Any expenses of personal nature',
      'Anything not mentioned in inclusions',
    ],
    thingsToCarry: [
      'Trekking shoes (ankle support, waterproof)',
      'Warm layers (fleece + down jacket)',
      'Waterproof jacket and pants',
      'Woollen cap, gloves, and neck gaiter',
      'Sunglasses (UV protection)',
      'Sunscreen SPF 50+',
      'Personal first aid kit',
      'Water bottles (2L capacity)',
      'Energy bars and dry fruits',
      'Headlamp with extra batteries',
      'Trekking poles (recommended)',
      'Backpack (40-50L)',
    ],
    fitnessRequirements: {
      level: 'Beginner to Intermediate',
      activities: [
        'Walk 5km daily for 4 weeks before the trek',
        'Stair climbing for 30 minutes daily',
        'Light jogging 3 times a week',
        'Yoga or stretching for flexibility',
      ],
      tips: [
        'Start training at least 4 weeks before',
        'Stay hydrated — drink 3-4L water daily on trek',
        'Avoid alcohol 48 hours before and during trek',
        'Acclimatize properly — do not rush ascent',
      ],
    },
    safetyInfo: [
      { title: 'Altitude Sickness', description: 'Kedarkantha reaches 3810m. Symptoms include headache, nausea, and dizziness. Descend immediately if symptoms worsen. Our guides carry Diamox and oxygen.' },
      { title: 'Weather Conditions', description: 'Winter temperatures can drop to -15°C at night. Always carry adequate warm clothing. Blizzards can occur — follow guide instructions strictly.' },
      { title: 'Emergency Protocol', description: 'We have satellite phones and a direct line to Uttarkashi rescue teams. Helicopter evacuation can be arranged within 2 hours from any campsite.' },
      { title: 'Wildlife', description: 'The forest has leopards and bears. Never trek alone, make noise while walking, and follow guide instructions. Do not leave food outside tents.' },
    ],
    faqs: [
      { question: 'Is Kedarkantha suitable for first-time trekkers?', answer: 'Yes! Kedarkantha is one of the best treks for beginners. The trails are well-marked, the altitude gain is gradual, and our guides are trained to support first-timers.' },
      { question: 'What is the best time to do Kedarkantha?', answer: 'December to April for snow. The summit offers a 360° panorama of snow-capped peaks. April-May has clear skies and green meadows. Avoid monsoon (July-September).' },
      { question: 'How cold does it get?', answer: 'Daytime: 5-10°C. Nighttime at camp: -5 to -15°C in winter. Carry a good down jacket, thermal layers, and a sleeping bag rated to -10°C.' },
      { question: 'Is there mobile network on the trek?', answer: 'BSNL has patchy coverage at Sankri and Juda Ka Talab. There is no network at higher camps. Inform family before you start.' },
      { question: 'What happens if I cannot complete the trek?', answer: 'Our guides will escort you back to the nearest road head. We have a support team at base. Your safety is our top priority — there is no shame in turning back.' },
    ],
    guide: {
      name: 'Ramesh Negi',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      experience: 12,
      languages: ['Hindi', 'English', 'Garhwali'],
      certifications: ['NIM Basic Mountaineering', 'Wilderness First Responder', 'NOLS Certified'],
      bio: 'Ramesh has led over 400 treks in the Garhwal Himalayas over 12 years. Born in Sankri village, he knows every trail, every campsite, and every weather pattern intimately. His calm demeanor and encyclopedic knowledge of the mountains make him the most requested guide on our platform.',
      rating: 4.97,
      totalTreks: 412,
    },
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', caption: 'Summit view at sunrise' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', caption: 'Snow-covered trail to base camp' },
      { url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80', caption: 'Juda Ka Talab frozen lake' },
      { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', caption: 'Campfire at base camp' },
      { url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80', caption: 'Trekkers on the ridge' },
      { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', caption: 'Oak forest trail' },
    ],
    meetingPoint: 'ISBT Dehradun Bus Stand, Gate 3 — 5:30 AM',
    nearestAirport: 'Jolly Grant Airport, Dehradun (220km)',
    nearestRailway: 'Dehradun Railway Station (220km)',
    latitude: 31.0167,
    longitude: 78.2333,
  },
};

export const DEFAULT_TREK_EXTRA = TREK_EXTRA['kedarkantha-trek'];
