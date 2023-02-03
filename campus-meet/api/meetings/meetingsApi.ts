import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { DateTime } from "luxon";

import { MeetingNotFoundExcxeption } from "../../exceptions/exceptions";
import { Coordinates } from "../../hooks/useCurrentLocation";
import { getCurrentUserId } from "../../utils/auth/currentUser";
import { getDb } from "../../utils/database/firestore";

export interface IMeetingCreationDto {
  title: string;
  notes?: string;
  date: Date;
  durationMinutes: number;
  location: Coordinates;
  address: string;
}

export interface IMeeting {
  id: string;
  title: string;
  notes?: string;
  location: Coordinates;
  address: string;
  creator: string;
  members: string[];
  date: Date;
  durationMinutes: number;
  end: Date;
}

export const getMeetingsCollection = () => collection(getDb(), "meetings");
export const getMeetingDoc = (meetingId: string) =>
  doc(getMeetingsCollection(), meetingId);

export const createMeeting = async (meeting: IMeetingCreationDto) => {
  const currentUserId = getCurrentUserId();
  const meetingRef = await addDoc(getMeetingsCollection(), {
    title: meeting.title,
    notes: meeting.notes,
    date: meeting.date,
    end: addMinutes(meeting.date, meeting.durationMinutes),
    location: {
      latitude: meeting.location.latitude,
      longitude: meeting.location.longitude,
    },
    address: meeting.address,
    members: [currentUserId],
    creator: currentUserId,
  });
  return meetingRef;
};

export const fetchCurrentMeetings = async (): Promise<IMeeting[]> => {
  const q = query(getMeetingsCollection(), where("end", ">=", new Date()));
  const querySnapshot = await getDocs(q);
  const meetings: IMeeting[] = querySnapshot.docs.map((doc) =>
    mapDataToMeeting(doc.id, doc.data())
  );
  return meetings;
};

export const fetchMeeting = async (id: string): Promise<IMeeting> => {
  const ref = getMeetingDoc(id);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();
  if (!data) {
    throw new MeetingNotFoundExcxeption(`Could not find meeting with id ${id}`);
  }
  return mapDataToMeeting(snapshot.id, data);
};

export const deleteMeeting = async (id: string): Promise<void> => {
  const meetingDoc = getMeetingDoc(id);
  await deleteDoc(meetingDoc);
};

export const joinMeeting = async (meetingId: string): Promise<void> => {
  const currentUserId = getCurrentUserId();
  const meetingDoc = getMeetingDoc(meetingId);
  await updateDoc(meetingDoc, {
    members: arrayUnion(currentUserId),
  });
};

export const leaveMeeting = async (meetingId: string): Promise<void> => {
  const currentUserId = getCurrentUserId();
  const meetingDoc = getMeetingDoc(meetingId);
  await updateDoc(meetingDoc, {
    members: arrayRemove(currentUserId),
  });
};

export const updateMeeting = async (
  meetingId: string,
  meeting: IMeetingCreationDto
) => {
  const meetingDoc = getMeetingDoc(meetingId);

  await updateDoc(meetingDoc, {
    title: meeting.title,
    notes: meeting.notes,
    date: meeting.date,
    end: addMinutes(meeting.date, meeting.durationMinutes),
    address: meeting.address,
    location: {
      latitude: meeting.location.latitude,
      longitude: meeting.location.longitude,
    },
  });
};

export const mapDataToMeeting = (id: string, data: DocumentData): IMeeting => {
  const date = (data.date as Timestamp).toDate();
  const end = (data.end as Timestamp).toDate();
  const durationMinutes = DateTime.fromJSDate(end).diff(
    DateTime.fromJSDate(date),
    "minutes"
  ).minutes;
  return {
    id,
    creator: data.creator,
    date,
    end,
    durationMinutes,
    location: data.location,
    address: data.address,
    title: data.title,
    notes: data.notes,
    members: data.members,
  };
};

const addMinutes = (date: Date, minutes: number) =>
  DateTime.fromJSDate(date).plus({ minutes }).toJSDate();
