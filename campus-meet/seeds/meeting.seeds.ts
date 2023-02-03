import { DateTime } from "luxon";

import { ISeedUser } from "./utils/accounts";
import { emulatorDefaultLocation } from "./utils/e2eLocation";
import { ISeedMeeting } from "./utils/meetings";
import { seed } from "./utils/seed";

const users: ISeedUser[] = [
  {
    email: "test-meeting@mail.com",
    password: "123456",
    name: "Ada",
  },
  {
    email: "other@mail.com",
    password: "123456",
    name: "Other",
  },
];

const meetings: ISeedMeeting[] = [
  {
    title: "Lunch at Leo",
    notes: "Food and tea!",
    creator: "test-meeting@mail.com",
    date: DateTime.now().plus({ hours: 3 }).toJSDate(),
    durationMinutes: 45,
    members: ["test-meeting@mail.com"],
    location: emulatorDefaultLocation,
    address: "Piazza Leonardo",
  },
  {
    title: "Far far away",
    notes: "",
    creator: "test-meeting@mail.com",
    date: DateTime.now().plus({ hours: 3 }).toJSDate(),
    durationMinutes: 45,
    members: ["test-meeting@mail.com"],
    location: {
      latitude: 123,
      longitude: 123,
    },
    address: "washington street 1221",
  },
];

export const seedsMeeting = {
  users,
  meetings,
};

// seed if run via cli; don't seed if imported by other module
if (require.main === module) {
  seed(seedsMeeting);
}
