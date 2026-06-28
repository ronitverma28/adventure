import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedTreks } from '@/components/home/FeaturedTreks';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PopularDestinations } from '@/components/home/PopularDestinations';
import { CustomerStories } from '@/components/home/CustomerStories';
import { GallerySection } from '@/components/home/GallerySection';
import { CommunitySection } from '@/components/home/CommunitySection';
import { FAQSection } from '@/components/home/FAQSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedTreks />
      <WhyChooseUs />
      <HowItWorks />
      <PopularDestinations />
      <CustomerStories />
      <GallerySection />
      <CommunitySection />
      <FAQSection />
    </>
  );
}
