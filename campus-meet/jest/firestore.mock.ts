import * as firestore from "firebase/firestore";

// replaces functions from firestore with jest mocks
jest.mock("firebase/firestore");

export default firestore as any as jest.Mocked<typeof firestore>;
