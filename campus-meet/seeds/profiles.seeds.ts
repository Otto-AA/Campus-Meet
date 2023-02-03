import { ISeedAccount, ISeedUser } from "./utils/accounts";
import { seed } from "./utils/seed";

const accounts: ISeedAccount[] = [
  {
    email: "no-profile@mail.com",
    password: "123456",
  },
];

const users: ISeedUser[] = [
  {
    email: "with-profile@mail.com",
    password: "123456",
    name: "Jacobo",
  },
];

export const seedsProfiles = {
  accounts,
  users,
};

// seed if run via cli; don't seed if imported by other module
if (require.main === module) {
  seed(seedsProfiles);
}
