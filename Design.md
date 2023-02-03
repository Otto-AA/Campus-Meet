# Design document

This document outlines how the project is structured and how to develop it.

# Setup

## Firebase local emulator

We use firebase as a backend. Locally this can be emulated, as shown by this guide: https://firebase.google.com/docs/emulator-suite/connect_and_prototype

In short, you will need to go to the firebase folder. First install the node modules (`npm install`). Then run `firebase emulators:start --project demo-campus-meet`. Then you can open the emulator UIs locally to e.g. inspect locally registered users.

## Campus Meet app

The [campus-meet](./campus-meet/) folder contains the mobile application. Go to the folder and run `npm install` to get the dependencies.

### Running the app

There are different ways to run the app:

- `npm start` (development config, firebase emulated locally)
- `npm run android` (development config, starting android emulator if installed, firebase emulated locally)
- `npx expo start --no-dev` (production config, local emulator, firebase emulated locally)
- `FIREBASE_USE_EMULATOR=FALSE npx expo start` (development config, using real firebase. NOTE: setting environment variable may be different on windows)

To build APKs you can use:

- `npm run build:prod` (development, firebase emulated locally)
- `npm run build:prev` (preview, using real firebase)

# Sign in

We use an email-only sign in, with explicit registration and password. This means the user enters their email, receives an email with a sign-in link, clicks this link and gets redirected to the app.

If firebase is emulated, no real email is sent, but the link is logged in the console where firebase was started.

# Notifications

Notifications are handled by the NotificationReceiverContext. Other components can use this context to subscribe to incoming push notifications.

# Syncing messages

Messages need to be synced in following cases
- the app is started
- the user joins a new meeting
- the app receives a new message notification
- the user sends a new message

For syncing, an API request is performed which only fetches new messages. The new message are then added to the local database.