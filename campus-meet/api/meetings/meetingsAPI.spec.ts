import { mockedGetCurrentUserId } from "../../jest/currentUser.mock";
import mockedFirestore from "../../jest/firestore.mock";
import {
  createMeeting,
  IMeetingCreationDto,
  fetchCurrentMeetings,
  getMeetingDoc,
  deleteMeeting,
  joinMeeting,
  leaveMeeting,
  mapDataToMeeting,
  updateMeeting,
} from "./meetingsApi";

const meeting: IMeetingCreationDto = {
  title: "Team Meeting",
  notes: "Discuss project progress",
  date: new Date("2022-01-01T10:00:00.000Z"),
  durationMinutes: 60,
  location: {
    latitude: 37.785834,
    longitude: -122.400903,
  },
  address: "123 Main St, San Francisco, CA",
};

const CURRENT_DATE = new Date();

describe("meetingsAPI", () => {
  beforeEach(() => {
    jest.useFakeTimers({
      doNotFake: ["nextTick"],
      now: CURRENT_DATE,
    });
    jest.resetModules();
  });

  it("should add a new meeting to the database", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    const meetingRef = await createMeeting(meeting);
    expect(meetingRef).toBeDefined();
  });

  it("should add a new meeting to the database", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    await createMeeting(meeting);

    expect(mockedFirestore.addDoc).toHaveBeenCalledWith(undefined, {
      title: meeting.title,
      notes: meeting.notes,
      date: meeting.date,
      end: new Date(
        meeting.date.valueOf() + 1000 * 60 * meeting.durationMinutes
      ),
      location: meeting.location,
      address: meeting.address,
      creator: "current-user",
      members: ["current-user"],
    });
  });

  it('should call firestore().collection("profiles") and return the doc with the correct id', () => {
    const meetingId = "1234";
    getMeetingDoc(meetingId);
    expect(mockedFirestore.collection).toHaveBeenCalledWith(
      undefined,
      "meetings"
    );
    expect(mockedFirestore.doc).toHaveBeenCalledWith(undefined, meetingId);
  });

  it("fetchCurrentMeetings query by date", async () => {
    mockedFirestore.getDocs.mockResolvedValue({ docs: [] } as any);

    await fetchCurrentMeetings();

    expect(mockedFirestore.where).toHaveBeenCalledWith("end", ">=", new Date());
  });

  it("deleteMeeting calls deleteDoc with the correct parameters", async () => {
    const mockId = "meeting1";
    await deleteMeeting(mockId);
    expect(mockedFirestore.doc).toHaveBeenCalledWith(undefined, mockId);
    expect(mockedFirestore.deleteDoc).toHaveBeenCalled();
  });

  it("should call getMeetingDoc with the correct parameter", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    const mockMeetingId = "meeting1";
    await joinMeeting(mockMeetingId);

    expect(mockedFirestore.collection).toHaveBeenCalledWith(
      undefined,
      "meetings"
    );

    expect(mockedFirestore.doc).toHaveBeenCalledWith(undefined, mockMeetingId);
  });

  it("should call updateDoc with the correct parameters", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    const mockMeetingId = "meeting1";
    await joinMeeting(mockMeetingId);

    expect(mockedFirestore.updateDoc).toHaveBeenCalledWith(undefined, {
      members: undefined,
    });
  });

  it("should call updateDoc with the correct parameters", async () => {
    // Arrange
    mockedGetCurrentUserId.mockReturnValue("current-user");
    const mockMeetingId = "meeting1";

    // Act
    await joinMeeting(mockMeetingId);

    // Assert
    expect(mockedFirestore.updateDoc).toHaveBeenCalledWith(undefined, {
      members: undefined,
    });
  });

  it("should call getMeetingDoc with the correct parameter", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    const mockMeetingId = "meeting1";
    await leaveMeeting(mockMeetingId);

    expect(mockedFirestore.collection).toHaveBeenCalledWith(
      undefined,
      "meetings"
    );

    expect(mockedFirestore.doc).toHaveBeenCalledWith(undefined, mockMeetingId);
  });

  it("should call updateDoc with the correct parameters", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    const mockMeetingId = "meeting1";
    await leaveMeeting(mockMeetingId);

    expect(mockedFirestore.updateDoc).toHaveBeenCalledWith(undefined, {
      members: undefined,
    });
  });

  it("mapDataToMeeting should correctly map data to IMeeting object", () => {
    const id = "meeting1";
    const data = {
      creator: "user1",
      date: { toDate: () => new Date() },
      end: { toDate: () => new Date(Date.now() + 1000 * 60 * 60) },
      location: { latitude: 1, longitude: 2 },
      address: "123 Main St",
      title: "Meeting Title",
      notes: "Meeting notes",
      members: ["user1", "user2"],
    };

    const mappedMeeting = mapDataToMeeting(id, data);

    expect(mappedMeeting).toEqual({
      id,
      creator: data.creator,
      date: data.date.toDate(),
      end: data.end.toDate(),
      durationMinutes: 60,
      location: data.location,
      address: data.address,
      title: data.title,
      notes: data.notes,
      members: data.members,
    });
  });

  it("should call getMeetingDoc with the correct parameter", async () => {
    const mockMeetingId = "meeting1";
    const mockMeeting: IMeetingCreationDto = {
      title: "Meeting Title",
      notes: "Meeting notes",
      date: new Date(),
      durationMinutes: 20,
      address: "123 Main St",
      location: {
        latitude: 1,
        longitude: 2,
      },
    };
    await updateMeeting(mockMeetingId, mockMeeting);

    expect(mockedFirestore.collection).toHaveBeenCalledWith(
      undefined,
      "meetings"
    );

    expect(mockedFirestore.doc).toHaveBeenCalledWith(undefined, mockMeetingId);
  });
});
