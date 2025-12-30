import { notFound } from 'next/navigation';
import { getEventById, getUpcomingEvents } from '@/lib/api/events';
import { EventDetailClient } from '@/components/events/EventDetailClient';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const event = await getEventById(id);
    const similarEvents = await getUpcomingEvents(3);

    if (!event) {
      notFound();
    }

    return <EventDetailClient event={event} similarEvents={similarEvents} />;
  } catch (error) {
    console.error('Error fetching event:', error);
    notFound();
  }
}
