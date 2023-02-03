import * as _admin from "firebase-admin";

const projectId = "demo-campus-meet";
// @ts-ignore
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
// @ts-ignore
process.env.FIRESTORE_EMULATOR_HOST = "localhost:4001";

_admin.initializeApp({ projectId });

export const auth = _admin.auth();
export const db = _admin.firestore();
