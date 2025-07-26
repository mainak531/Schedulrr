"use server";

import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

export const createBooking = async (bookingData) => {
  try {
    const event = await db.event.findUnique({
      where: {
        id: bookingData.eventId,
      },
      include: {
        user: true,
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // use google claendar api to generate meet link and add to calendar

    const client = await clerkClient();
    const { data } = await client.users.getUserOauthAccessToken(
      event.user.clerkUserId,
      "oauth_google"
    );

    const token = data[0]?.token;

    if (!token) {
      throw new Error("Event creator has not connected Google Calendar");
    }

    //  Set up Google OAuth client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const meetResponse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `${bookingData.name} - ${event.title}`,
        description: bookingData.additionalInfo,
        start: { dateTime: bookingData.startTime },
        end: { dateTime: bookingData.endTime },
        attendees: [{ email: bookingData.email }, { email: event.user.email }],
        conferenceData: {
          createRequest: {
            requestId: `${event.id}-${Date.now()}`,
          },
        },
      },
    });

    const meetLink = meetResponse.data.hangoutLink;
    const googleEventId = meetResponse.data.id;

    // Create booking in the database
    const booking = await db.booking.create({
      data: {
        eventId: event.id,
        userId: event.user.id,
        name: bookingData.name,
        email: bookingData.email,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        additionalInfo: bookingData.additionalInfo,
        meetLink,
        googleEventId,
      },
    });
    
    return { success: true, booking, meetLink };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
};
