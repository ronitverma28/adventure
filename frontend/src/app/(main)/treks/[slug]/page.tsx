import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOCK_TREKS } from '@/lib/data/mock-treks';
import { TrekDetailPage } from '@/components/trek/detail/TrekDetailPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trek = MOCK_TREKS.find((t) => t.slug === slug);
  if (!trek) return { title: 'Trek Not Found' };
  return {
    title: `${trek.title} | ${trek.durationDays}D/${trek.durationNights}N | Adventure`,
    description: trek.shortDescription,
    openGraph: {
      title: trek.title,
      description: trek.shortDescription,
      images: [{ url: trek.coverImageUrl || '', width: 1200, height: 630 }],
    },
  };
}

export async function generateStaticParams() {
  return MOCK_TREKS.map((t) => ({ slug: t.slug }));
}

export default async function TrekPage({ params }: Props) {
  const { slug } = await params;
  const trek = MOCK_TREKS.find((t) => t.slug === slug);
  if (!trek) notFound();
  return <TrekDetailPage trek={trek} />;
}
