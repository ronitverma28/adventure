import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { trekApi } from '@/lib/api/treks';
import { TrekDetailPage } from '@/components/trek/detail/TrekDetailPage';
import type { TrekDetail } from '@/types/trek.types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getTrek(slug: string): Promise<TrekDetail | null> {
  try {
    const trekResponse = await trekApi.getBySlug(slug);
    const trek = trekResponse.data.data;
    const availabilityResponse = await trekApi.getAvailability(trek.id);
    return {
      ...trek,
      upcomingBatches: availabilityResponse.data.data.map((batch) => ({
        id: batch.batchId,
        startDate: batch.startDate,
        endDate: batch.endDate,
        availableSeats: batch.availableSlots,
        totalSeats: batch.totalSlots,
        price: batch.pricePerPerson,
      })),
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trek = await getTrek(slug);
  if (!trek) return { title: 'Trek Not Found' };

  return {
    title: trek.metaTitle || `${trek.title} | Adventure`,
    description: trek.metaDescription || trek.shortDescription,
    openGraph: {
      title: trek.title,
      description: trek.shortDescription,
      images: trek.coverImageUrl ? [{ url: trek.coverImageUrl, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function TrekPage({ params }: Props) {
  const { slug } = await params;
  const trek = await getTrek(slug);
  if (!trek) notFound();
  return <TrekDetailPage trek={trek} />;
}
