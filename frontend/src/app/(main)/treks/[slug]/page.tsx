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
    try {
      const { MOCK_TREKS } = await import('@/lib/data/mock-treks');
      const mockTrek = MOCK_TREKS.find((t) => t.slug === slug);
      if (mockTrek) {
        return {
          ...mockTrek,
          overview: mockTrek.shortDescription,
          longDescription: mockTrek.shortDescription + " Let's explore the scenic landscapes, high mountains, and beautiful trails on this amazing adventure trek.",
          metaTitle: `${mockTrek.title} | Adventure`,
          metaDescription: mockTrek.shortDescription,
          itinerary: mockTrek.itinerary || [],
          upcomingBatches: mockTrek.upcomingBatches?.map((b) => ({
            id: b.id,
            startDate: b.startDate,
            endDate: b.endDate,
            availableSeats: b.availableSeats,
            totalSeats: b.totalSeats,
            price: mockTrek.pricePerPerson,
          })) || [],
          thingsToCarry: [
            'Warm clothes (jacket, fleece, thermals)',
            'Trekking shoes with good grip',
            'Water bottle & hydration pack',
            'Personal medical kit',
            'Headlamp or flashlight with extra batteries',
          ],
          inclusions: [
            'Professional guide and support staff',
            'All meals during the trek (veg)',
            'Forest permits and camping charges',
            'High-quality camping tents and sleeping bags',
          ],
          exclusions: [
            'Personal trekking gear',
            'Insurance of any kind',
            'Tips for guides or support staff',
            'Anything not mentioned in inclusions',
          ],
        } as any;
      }
    } catch (e) {
      console.error('Failed to load mock trek details:', e);
    }
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
