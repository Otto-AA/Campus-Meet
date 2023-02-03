import { mockedFunctionType } from "../types/mockedType";
import { getAddressFromCoordinates } from "./getAddressFromCoordinates";

jest.mock("expo-constants", () => ({
  manifest: {
    extra: {
      googleMapsApiKey: "test-api-key",
    },
  },
}));

global.fetch = jest.fn();
const fetchSpy = mockedFunctionType(global.fetch);
const givenAddressResponse = (response: any) => {
  fetchSpy.mockResolvedValue({
    json: () => Promise.resolve(response),
  } as any);
};
type IMockComponent = {
  types: string[];
  long_name: string;
};
const givenComponents = (components: IMockComponent[]) => {
  givenAddressResponse({
    results: [
      {
        address_components: components,
      },
    ],
  });
};
const sampleCoordinates = {
  latitude: 37.4219999,
  longitude: -122.0840575,
};
const sampleRouteComponent = {
  types: ["route"],
  long_name: "Some street",
};
const sampleStreetNumberComponent = {
  types: ["street_number"],
  long_name: "15",
};

describe("getAddressFromCoordinates", () => {
  beforeAll(() => {
    fetchSpy.mockReset();
  });

  it("returns street with number if available", async () => {
    givenComponents([sampleRouteComponent, sampleStreetNumberComponent]);

    const address = await getAddressFromCoordinates(sampleCoordinates);

    expect(address).toBe("Some street 15");
  });

  it("returns only street name if no street number is available", async () => {
    givenComponents([sampleRouteComponent]);

    const address = await getAddressFromCoordinates(sampleCoordinates);

    expect(address).toBe("Some street");
  });

  it("returns locality if no route is available", async () => {
    givenComponents([
      sampleStreetNumberComponent,
      {
        types: ["locality"],
        long_name: "Citta studi",
      },
    ]);

    const address = await getAddressFromCoordinates(sampleCoordinates);

    expect(address).toBe("Citta studi");
  });

  it("returns administrativeAreaLevel1 if nothing better is available", async () => {
    givenComponents([
      {
        types: ["administrative_area_level_1"],
        long_name: "Administrative area",
      },
    ]);

    const address = await getAddressFromCoordinates(sampleCoordinates);

    expect(address).toBe("Administrative area");
  });

  it("returns administrativeAreaLevel2 if nothing better is available", async () => {
    givenComponents([
      {
        types: ["administrative_area_level_2"],
        long_name: "Administrative area",
      },
    ]);

    const address = await getAddressFromCoordinates(sampleCoordinates);

    expect(address).toBe("Administrative area");
  });

  it("returns Unknown address if no component is useful", async () => {
    givenComponents([]);

    const address = await getAddressFromCoordinates(sampleCoordinates);

    expect(address).toBe("Unknown address");
  });

  it("returns 'Unknown address' if the network request fails", async () => {
    fetchSpy.mockRejectedValue(new Error("network error"));

    const address = await getAddressFromCoordinates(sampleCoordinates);

    expect(address).toBe("Unknown address");
  });
});
