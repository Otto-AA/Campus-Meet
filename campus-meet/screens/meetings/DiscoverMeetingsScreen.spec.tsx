import { NavigationContext } from "@react-navigation/native";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";

// eslint-disable-next-line import/order
import { mockedUseCurrentLocation } from "../../jest/useCurrentLocation.mock";
// eslint-disable-next-line import/order
import mockedAuth from "../../jest/auth.mock";

import { fetchCurrentMeetings, IMeeting } from "../../api/meetings/meetingsApi";
import { Coordinates } from "../../hooks/useCurrentLocation";
import { mockedFunctionType } from "../../utils/types/mockedType";
import DiscoverMeetingsScreen from "./DiscoverMeetingsScreen";

jest.mock("../../api/meetings/meetingsApi");
const mockedFetchCurrentMeetings = mockedFunctionType(fetchCurrentMeetings);
const givenCurrentMeetings = (meetings: IMeeting[]) => {
  mockedFetchCurrentMeetings.mockResolvedValue(meetings);
};

const MockView = View;

jest.mock("react-native-paper", () => {
  const RealModule = jest.requireActual("react-native-paper");
  const MockedModule = {
    ...RealModule,
    Portal: ({ children }: any) => <MockView>{children}</MockView>,
  };
  return MockedModule;
});

const mockedNavigationContext = {
  isFocused: () => true,
  addListener: jest.fn(() => jest.fn()),
};

const customRender = async (element: JSX.Element) => {
  render(
    <NavigationContext.Provider value={mockedNavigationContext as any}>
      {element}
    </NavigationContext.Provider>
  );
  await screen.findByTestId("screen-discover-meetings");
};

const renderDiscoverMeetingsScreen = async () => {
  await customRender(
    <DiscoverMeetingsScreen navigation={null as any} route={null as any} />
  );
};

const givenCurrentLocation = (coords: Coordinates) => {
  mockedUseCurrentLocation.mockReturnValue([coords, jest.fn()]);
};

const sampleMeetings: IMeeting[] = [
  {
    id: "1",
    title: "Meeting 1",
    date: new Date(),
    end: new Date(Date.now() + 1000 * 60 * 60),
    durationMinutes: 60,
    location: { latitude: 0, longitude: 0 },
    address: "address",
    creator: "creator",
    members: [],
  },
  {
    id: "2",
    title: "Meeting 2",
    date: new Date(),
    end: new Date(Date.now() + 1000 * 60 * 60),
    durationMinutes: 60,
    location: { latitude: 0, longitude: 0 },
    address: "address",
    creator: "creator",
    members: [],
  },
  {
    id: "3",
    title: "Meeting 3",
    date: new Date(),
    end: new Date(Date.now() + 1000 * 60 * 60),
    durationMinutes: 60,
    location: { latitude: 0, longitude: 0 },
    address: "address",
    creator: "creator",
    members: [],
  },
];

const originalWarn = console.warn.bind(console.warn);
describe("DiscoverMeetingsScreen", () => {
  beforeAll(() => {
    console.warn = (msg) =>
      !msg.toString().includes("useNativeDriver") && originalWarn(msg);
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.getAuth.mockReturnValue({ uid: "test-user" } as any);
    givenCurrentLocation({ latitude: 0, longitude: 0 });
  });

  it("should render without errors", async () => {
    await renderDiscoverMeetingsScreen();
  });

  it("should fetch meetings on mount", async () => {
    await renderDiscoverMeetingsScreen();

    expect(mockedFetchCurrentMeetings).toHaveBeenCalled();
  });

  it("should display meetings when they are fetched", async () => {
    givenCurrentMeetings(sampleMeetings);

    await renderDiscoverMeetingsScreen();

    expect(screen.getAllByText(/Meeting/)).toHaveLength(3);
    expect(screen.getByText(/Meeting 1/i)).toBeDefined();
    expect(screen.getByText(/Meeting 2/i)).toBeDefined();
    expect(screen.getByText(/Meeting 3/i)).toBeDefined();
  });

  it("should sort meetings by date", async () => {
    givenCurrentMeetings(sampleMeetings);

    await renderDiscoverMeetingsScreen();

    expect(screen.getByText("Meeting 1")).toBeDefined();
    expect(screen.getByText("Meeting 2")).toBeDefined();
    expect(screen.getByText("Meeting 3")).toBeDefined();
  });

  it("should not show meetings when far away", async () => {
    givenCurrentLocation({
      longitude: 50,
      latitude: -50,
    });

    await renderDiscoverMeetingsScreen();

    expect(screen.queryAllByText(/Meeting/)).toHaveLength(0);
  });

  afterAll(() => {
    console.warn = originalWarn;
  });
});
