import { DateTime } from "luxon";

import { db } from "./admin";

export interface ISeedMeeting {
  title: string;
  notes?: string;
  date: Date;
  durationMinutes: number;
  creator: string;
  members: string[];
  location: {
    longitude: number;
    latitude: number;
  };
  address: string;
}

export const addMeeting = async (meeting: ISeedMeeting) => {
  const end = addMinutes(meeting.date, meeting.durationMinutes);
  const ref = await db.collection("meetings").add({
    ...meeting,
    end,
  });

  return ref.id;
};

// return an array of generated meeting ids
export const addMeetings = async (meetings: ISeedMeeting[]) =>
  Promise.all(meetings.map(addMeeting));

const addMinutes = (date: Date, minutes: number) =>
  DateTime.fromJSDate(date).plus({ minutes }).toJSDate();
