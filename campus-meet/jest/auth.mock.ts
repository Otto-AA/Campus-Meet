import * as auth from "firebase/auth";

jest.mock("firebase/auth");

export default auth as any as jest.Mocked<typeof auth>;
