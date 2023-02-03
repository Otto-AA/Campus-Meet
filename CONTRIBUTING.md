# Contributing

This document provides some tips to get started developing this project.

## Build

Before running the build, make sure that the environment variables in eas.json match the environment variables of .env.

For the build you will need to run `npm run build:prev` (or `:dev` or `:prod`). This will start a local build.

If the build is configured to produce an apk (dev and prev), you can install it on the android emulator by drag-n-dropping the .apk file on the phone screen.

## Tunneling

If the phone is connected to a different network than your computer, you will need to tunnel the network traffic. This is also useful if you want to test with both, the phone and the emulator at the same time.

### Tunneling the app

Run `npx expo start --tunnel`.

### Tunneling the firebase emulators

After starting the emulators, go to the `firebase` directory and run `ngrok start --config ./ngrok-conf.yml --all`. In app.config.js change the emulator domains and ports accordingly (ports are 80 for http). If it doesn't work, make sure the ports in `ngrok-conf.yml` match the ports in `firebase.json`


## Testing notifications

Push notifications only work on real devices, not on the emulator.

Go to https://expo.dev/notifications. As an expo push token, use the one logged to the console (looks similar to `ExponentPushToken[...]`). Keep in mind that we have two different handlers for receiving notifications while the app is in foreground and receiving notifications while the app is in background.

Also you can use the simulator in NotificationReceiverContext

# Writing tests

There are different kind of tests in this project. Currently all of these are based on [jest](https://jestjs.io/docs/getting-started). You can run them with `npm test`.

General tips:
- make many small tests, each testing one thing
- use jest to mock out functions that you are currently not testing (ie make an API request return sample data, instead of actually performing an http request)
- if you run `npm run test:ci` you will afterwards see which lines have been executed [in the coverage folder](./campus-meet/coverage/lcov-report/index.html)
- a usual test case consists of three steps: arrange, action, assert. The first one arranges the environment (sample data, mocking of functions, etc). The second one performs the action we want to test. The third one asserts the outcome of the action. Visually separating these makes it easier to read tests.

## Component tests

Here we use the [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) to render react components (things that include `<tags></tags>`).

Tips:
- use `render` to render a component. You can pass properties to it as you wish
- use `screen` to access the rendered component (e.g. `screen.getByText("Hi")` to find the `<Text>Hi</Text>` element)
- use `screen.debug()` to log the rendered component, in case you want to know how it looks like
- use `expect` from jest to verify your assumptions about elements

Example:
- ChatPreviews.spec.tsx

## Unit tests

Here we test a single function which does not need to render react components. For instance API functions and utility functions.

Tips:
- if you need to mock firestore (addDoc, etc), import `import mockedFirestore from "../../jest/firestore.mock";` **before** you import the functions you want to test
- if you need to mock the current user, import `import { mockedGetCurrentUserId } from "../../jest/currentUser.mock";` **before** you import the functions you want to test

Examples:
- messagesApi.spec.ts
- unique.spec.ts

## End to end tests

We use [Detox](https://wix.github.io/Detox/) to run tests in the android emulator itself. These execute the whole program and test if everything works well with each other, from the perspective of an end user.

### Setup

Create an emulator Pixel 3a with API 30 and name it "Pixel 3a API 30 x86". Then run `npx expo prebuild` in the campus-meet folder.

### Running tests

First create a build of your application with `npm run detox:build`. This will take some time. This also means that every time you change the application you need to build it again before running the detox tests again.

Then make sure the local firebase emulator is running.

Finally you can run the tests with `npm run detox`. This will open the emulator and run the tests inside it.

### Writing tests

First create seeds which are used to initialize the database before running the e2e test. Then before each test restart the application and create these seeds. Finally write the tests.

Examples:
- preview.seed.ts
- previews.test.js
- meetings.test.js