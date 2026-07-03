import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedTreks } from '@/components/home/FeaturedTreks';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PopularDestinations } from '@/components/home/PopularDestinations';
import { CustomerStories } from '@/components/home/CustomerStories';
import { CommunitySection } from '@/components/home/CommunitySection';
import { FAQSection } from '@/components/home/FAQSection';

export const metadata: Metadata = {
  title: 'Adventure | Premium Himalayan Treks & Adventure Tours',
  description:
    'Discover and book premium Himalayan treks with expert guides. Plan your next adventure to Kedarkantha, Roopkund, Hampta Pass, or Valley of Flowers using our smart AI trek planner.',
  keywords: [
    'Himalayan trekking',
    'best treks in India',
    'mountain expeditions',
    'Kedarkantha trek booking',
    'Valley of Flowers pricing',
    'expert trekking guides',
    'AI trek planner',
  ],
  alternates: {
    canonical: 'https://adventure.com',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedTreks />
      <WhyChooseUs />
      <HowItWorks />
      <PopularDestinations />
      <CustomerStories />
      <CommunitySection />
      <FAQSection />
    </>
  );
}
