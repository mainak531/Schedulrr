import { getEventAvailability, getEventDetails } from "@/actions/events";

import { notFound } from "next/navigation";
import EventDetails from "./_components/event-details";
import BookingForm from "./_components/booking-form";
import { Suspense } from "react";

export const generateMetadata = async ({ params }) => {
  const { eventId, username } = await params;
  
  const event = await getEventDetails(username, eventId);

  if (!event) {
    return {
      title: "Event not found",
    };
  }

  return {
    title: `Book ${event.title} with ${event.user.name} | Schedulrr`,
    description: `Schedule a ${event.duration}-minute ${event.title} even with ${event.user.name}`,
  };
};

const EventPage = async ({ params }) => {
  const { eventId, username } = await params;

  const event = await getEventDetails(username, eventId);
  const availability = await getEventAvailability(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
};

export default EventPage;
