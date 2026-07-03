import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | 24/7 Himalayan Expedition Support',
  description:
    'Have questions about a trek, batch availability, or bookings? Get in touch with our team. We are available via phone, email, and WhatsApp.',
  keywords: [
    'contact adventure treks',
    'trek booking support',
    'Rishikesh head office address',
    'Dehradun basecamp phone',
    'Himalayan trek guide contact',
  ],
  alternates: {
    canonical: 'https://adventure.com/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
