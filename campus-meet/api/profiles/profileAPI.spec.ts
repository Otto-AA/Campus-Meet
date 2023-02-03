import { DocumentSnapshot } from "firebase/firestore";

import { mockedGetCurrentUserId } from "../../jest/currentUser.mock";
import mockedFirestore from "../../jest/firestore.mock";
import {
  createProfile,
  IProfileCreationDto,
  mapDataToProfile,
  getProfileDoc,
  getProfilesByUserIds,
  getProfilebyUserId,
  updateProfile,
} from "./profileAPI";

const profile: IProfileCreationDto = {
  name: "John Doe",
  studies: "Computer Science",
  languages: "English",
  about: "I am a software developer",
  imageUrl: "https://example.com/image.jpg",
};

jest.mock("firebase-admin", () => {
  const mockedAdmin = {
    storage: jest.fn().mockReturnThis(),
    bucket: jest.fn().mockReturnThis(),
    file: jest.fn().mockReturnThis(),
  };
  return mockedAdmin;
});

const sampleMessageSnapshot = {
  id: "message-id",
  data: () => profile,
} as DocumentSnapshot<typeof profile>;

describe("profilesAPI", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("CreateProfile calls addDoc with correct data", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    await createProfile(profile);

    expect(mockedFirestore.addDoc).toHaveBeenCalledWith(undefined, {
      name: profile.name,
      studies: profile.studies,
      languages: profile.languages,
      about: profile.about,
      imageUrl: profile.imageUrl,
      creator: "current-user",
    });
  });

  it("should add a new meeting to the database", async () => {
    mockedGetCurrentUserId.mockReturnValue("current-user");
    mockedFirestore.addDoc.mockResolvedValue({ id: "message-1" } as any);

    const profileRef = await createProfile(profile);
    expect(profileRef).toBeDefined();
  });

  it("handles errors", async () => {
    mockedFirestore.addDoc.mockImplementation(() => {
      throw new Error("Test error");
    });
    const profile: IProfileCreationDto = {
      name: "John Doe",
      studies: "Computer Science",
      languages: "English",
      about: "I am a software developer",
      imageUrl: "https://example.com/image.jpg",
    };
    try {
      await createProfile(profile);
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toBe("Test error");
      }
    }
  });

  it("maps data to a profile object", () => {
    const id = "123";
    const data = {
      creator: "456",
      name: "John Doe",
      studies: "Computer Science",
      languages: ["English", "Spanish"],
      about: "I am a software developer",
      imageUrl: "https://example.com/image.jpg",
    };
    const profile = mapDataToProfile(id, data);
    expect(profile).toEqual({
      id,
      creator: data.creator,
      name: data.name,
      studies: data.studies,
      languages: data.languages,
      about: data.about,
      imageUrl: data.imageUrl,
    });
  });

  it('should call firestore().collection("profiles") and return the doc with the correct id', () => {
    const profileId = "1234";
    getProfileDoc(profileId);
    expect(mockedFirestore.collection).toHaveBeenCalledWith(
      undefined,
      "profiles"
    );
    expect(mockedFirestore.doc).toHaveBeenCalledWith(undefined, profileId);
  });

  it("getProfilesByUserIds filters where member contains current user id", async () => {
    const ids = ["123", "452"];
    mockedFirestore.getDocs.mockResolvedValue({ docs: [] } as any);

    await getProfilesByUserIds(ids);

    expect(mockedFirestore.where).toHaveBeenCalledWith("creator", "in", ids);
  });

  it("getProfilesByUserIds formats", async () => {
    mockedFirestore.getDocs.mockResolvedValue({
      docs: [sampleMessageSnapshot],
    } as any);

    const res = await getProfilesByUserIds(["message-id"]);

    expect(res).toEqual([
      {
        id: sampleMessageSnapshot.id,
        name: profile.name,
        studies: profile.studies,
        languages: profile.languages,
        about: profile.about,
        imageUrl: profile.imageUrl,
      },
    ]);
  });

  it("should return the correct profile for the given user ID", async () => {
    mockedFirestore.getDocs.mockResolvedValue({
      docs: [sampleMessageSnapshot],
    } as any);

    const res = await getProfilebyUserId("message-id");

    expect(res).toEqual({
      id: sampleMessageSnapshot.id,
      name: profile.name,
      studies: profile.studies,
      languages: profile.languages,
      about: profile.about,
      imageUrl: profile.imageUrl,
    });
  });

  it("should throw an error if no profile is found for the given user ID", async () => {
    mockedFirestore.getDocs.mockResolvedValue({
      docs: [],
    } as any);

    await expect(getProfilebyUserId("message-id")).rejects.toThrowError(
      `Could not find profile with uid message-id`
    );
  });

  it("should call getProfileDoc with the correct parameter", async () => {
    const mockId = "user1";
    const mockProfile = {
      name: "John Doe",
      studies: "Computer Science",
      languages: "English",
      about: "I am a software developer",
      imageUrl: "https://example.com/image.jpg",
    };
    await updateProfile(mockId, mockProfile);

    expect(mockedFirestore.collection).toHaveBeenCalledWith(
      undefined,
      "profiles"
    );

    expect(mockedFirestore.doc).toHaveBeenCalledWith(undefined, mockId);
  });

  it("updateProfile updates doc for current user", async () => {
    await updateProfile("chat-1", profile);

    expect(mockedFirestore.updateDoc).toHaveBeenCalledWith(undefined, {
      name: profile.name,
      studies: profile.studies,
      languages: profile.languages,
      about: profile.about,
      imageUrl: profile.imageUrl,
    });
  });

  it("should call updateDoc with the correct parameters", async () => {
    const mockId = "user1";
    const mockProfile = {
      name: "John Doe",
      studies: "Computer Science",
      languages: "English",
      about: "I am a software developer",
      imageUrl: "https://example.com/image.jpg",
    };
    await updateProfile(mockId, mockProfile);

    expect(mockedFirestore.updateDoc).toHaveBeenCalledWith(
      undefined,
      mockProfile
    );
  });

  it("updateProfile handles errors", async () => {
    const profileId = "123";
    const updatedProfile = { name: "Jane Doe" };
    mockedFirestore.doc.mockImplementation(() => {
      throw new Error("Test error");
    });

    try {
      await updateProfile(profileId, updatedProfile);
    } catch (error) {
      expect(error.message).toBe("Test error");
    }
  });

  it("maps data to a profile object handles missing data", () => {
    const id = "123";
    const data = {
      creator: "456",
      name: "John Doe",
      studies: "Computer Science",
      languages: "English",
      imageUrl: "https://example.com/image.jpg",
      about: "",
    };
    const profile = mapDataToProfile(id, data);
    expect(profile).toEqual({
      id,
      creator: data.creator,
      name: data.name,
      studies: data.studies,
      languages: data.languages,
      about: "",
      imageUrl: data.imageUrl,
    });
  });

  
});
