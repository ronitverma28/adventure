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
  metadataBase: new URL("https://himyatraa.com"),

  title: {
    default:
      "Himyatraa | Uttarakhand Trek & Tour Booking | Valley of Flowers & Hemkund Sahib",
    template: "%s | Himyatraa",
  },

  description:
    "Book Uttarakhand trekking packages with Himyatraa. Explore Valley of Flowers, Hemkund Sahib, Kedarnath, Chopta, Kuari Pass, Har Ki Dun, Dayara Bugyal, Kedarkantha and more with experienced local guides.",

  keywords: [
    "Himyatraa",
    "Uttarakhand Trek",
    "Valley of Flowers Trek",
    "Valley of Flowers Package",
    "Hemkund Sahib Trek",
    "Hemkund Sahib Yatra",
    "Kedarnath Tour Package",
    "Char Dham Yatra",
    "Chopta Tungnath Trek",
    "Kuari Pass Trek",
    "Har Ki Dun Trek",
    "Dayara Bugyal Trek",
    "Nag Tibba Trek",
    "Kedarkantha Trek",
    "Adventure Tours Uttarakhand",
    "Best Trek Company Uttarakhand",
    "Trek Booking India",
    "Himalayan Treks",
    "Travel Uttarakhand",
    "Trekking India"
  ],

  authors: [
    {
      name: "Himyatraa",
      url: "https://himyatraa.com",
    },
  ],

  creator: "Himyatraa",

  publisher: "Himyatraa",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  verification: {
    google: "koLnDB1FT3Mr0pEZH2-Aw6iBgexfjsOoaQYgLsBqNKE",
  },

  alternates: {
    canonical: "https://www.himyatraa.com",
  },

  icons: {
    icon: [
      {
        url: "images/favicon.ico",
      },
      {
        url: "images/app-logo.png",
        type: "image/png",
      },
    ],
    shortcut: "images/favicon.ico",
    apple: "images/app-logo.png",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.himyatraa.com",

    title:
      "Himyatraa | Uttarakhand Trek Booking",

    description:
      "Book Valley of Flowers, Hemkund Sahib, Kedarnath and Uttarakhand trekking packages.",

    siteName: "Himyatraa",

    images: [
      {
        url: "/images/app-logo.png",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Himyatraa | Uttarakhand Trek Booking",

    description:
      "Premium trekking platform for Uttarakhand.",

    images: ["/images/app-logo.png"],
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
