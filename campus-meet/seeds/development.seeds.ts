import { DateTime } from "luxon";

import { ISeedUser } from "./utils/accounts";
import { ISeedMeeting } from "./utils/meetings";
import { ISeedMessage } from "./utils/messages";
import { seed } from "./utils/seed";

const emulatorDefaultCoordinates = {
  latitude: 37.4220936,
  longitude: -122.083922,
};

const users: ISeedUser[] = [
  {
    email: "test-chat@mail.com",
    password: "123456",
    name: "Jacobo",
  },
  {
    email: "guest@mail.com",
    password: "123456",
    name: "Fernando",
  },
  {
    email: "study@mail.com",
    password: "123456",
    name: "Lilia",
  },
];

const meetings: ISeedMeeting[] = [
  {
    title: "Oldy",
    creator: "test-chat@mail.com",
    date: DateTime.now().minus({ days: 1 }).toJSDate(),
    durationMinutes: 80,
    members: ["test-chat@mail.com", "guest@mail.com"],
    location: {
      latitude: 12,
      longitude: 13.45,
    },
    address: "Bungalow 1",
  },
  {
    title: "Ping Pong",
    creator: "test-chat@mail.com",
    date: DateTime.now().minus({ minutes: 10 }).toJSDate(),
    durationMinutes: 40,
    members: ["test-chat@mail.com", "guest@mail.com"],
    location: emulatorDefaultCoordinates,
    address: "Lenoardo 1",
  },
  {
    title: "Study session",
    creator: "study@mail.com",
    date: DateTime.now().plus({ days: 1 }).toJSDate(),
    durationMinutes: 180,
    members: ["study@mail.com"],
    location: {
      latitude: emulatorDefaultCoordinates.latitude + 0.3,
      longitude: emulatorDefaultCoordinates.longitude + 0.2,
    },
    address: "Leonardo 1",
  },
  {
    title: "Woop",
    creator: "study@mail.com",
    date: DateTime.now().plus({ days: 1 }).toJSDate(),
    durationMinutes: 60,
    members: ["study@mail.com", "test-chat@mail.com"],
    location: {
      latitude: emulatorDefaultCoordinates.latitude + 0.1,
      longitude: emulatorDefaultCoordinates.longitude - 0.2,
    },
    address: "Leonardo 1",
  },
];

const messages: Record<string, ISeedMessage[]> = {
  "Study session": [
    {
      from: "study@mail.com",
      date: DateTime.now().toJSDate(),
      message: "Anyone out there?",
    },
  ],
  "Ping Pong": [
    {
      from: "test-chat@mail.com",
      date: DateTime.now().minus({ days: 2 }).toJSDate(),
      message: "Hey there",
    },
    {
      from: "guest@mail.com",
      date: DateTime.now().minus({ days: 1, hours: 3 }).toJSDate(),
      message: "Hi",
    },
    {
      from: "test-chat@mail.com",
      date: DateTime.now()
        .startOf("day")
        .plus({ hours: 7, minutes: 24 })
        .toJSDate(),
      message: "So today we go playing?",
    },
    {
      from: "guest@mail.com",
      date: DateTime.now()
        .startOf("day")
        .plus({ hours: 8, minutes: 20 })
        .toJSDate(),
      message: "YES!",
    },
    {
      from: "guest@mail.com",
      date: DateTime.now()
        .startOf("day")
        .plus({ hours: 8, minutes: 25 })
        .toJSDate(),
      message: "Do you have the rackets?",
    },
  ],
  Woop: [
    {
      from: "test-chat@mail.com",
      date: DateTime.now().minus({ days: 2, hours: 3 }).toJSDate(),
      message: "Hey there",
    },
    {
      from: "study@mail.com",
      date: DateTime.now().minus({ days: 1, hours: 3 }).toJSDate(),
      message: "Hi",
    },
  ],
};

export const seedsDevelopment = {
  users,
  meetings,
  messages,
};

// seed if run via cli; don't seed if imported by other module
if (require.main === module) {
  seed(seedsDevelopment);
}
