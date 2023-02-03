import { getDb } from "./libraryGetters";

export const getMeeting = async (meetingId: string) => {
  return getMeetingRef(meetingId).get();
};

const getMeetingRef = (meetingId: string) =>
  getDb().doc(getMeetingPath(meetingId));

const getMeetingPath = (meetingId: string) => `meetings/${meetingId}`;
