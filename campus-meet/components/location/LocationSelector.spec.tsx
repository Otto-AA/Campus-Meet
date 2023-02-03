import { render, fireEvent, act } from "@testing-library/react-native";
import React from "react";

import LocationSelector from "./LocationSelector";

describe("LocationSelector", () => {
  it("renders correctly", () => {
    const { getByTestId } = render(
      <LocationSelector
        initialLocation={{ latitude: 0, longitude: 0 }}
        onLocationChange={() => {}}
      />
    );

    const mapView = getByTestId("map-view");

    expect(mapView).toBeDefined();
  });

  it("renders the MapView component with the correct initialRegion", () => {
    const initialLocation = { latitude: 37.78825, longitude: -122.4324 };
    const { getByTestId } = render(
      <LocationSelector
        initialLocation={initialLocation}
        onLocationChange={() => {}}
      />
    );

    const mapView = getByTestId("map-view");

    expect(mapView).toBeDefined();

    const initialRegion = mapView.props.initialRegion;

    expect(initialRegion.latitude).toEqual(initialLocation.latitude);
    expect(initialRegion.longitude).toEqual(initialLocation.longitude);
  });

  it("renders marker correctly", () => {
    const initialLocation = { latitude: 0, longitude: 0 };
    const { getByTestId } = render(
      <LocationSelector
        initialLocation={initialLocation}
        onLocationChange={() => {}}
      />
    );

    const marker = getByTestId("marker");

    expect(marker).toBeDefined();
    expect(marker.props.coordinate).toEqual(initialLocation);
  });

  it("handles map press event correctly", () => {
    const onLocationChange = jest.fn();
    const { getByTestId } = render(
      <LocationSelector
        initialLocation={{ latitude: 0, longitude: 0 }}
        onLocationChange={onLocationChange}
      />
    );

    const mapView = getByTestId("map-view");
    const coordinate = { latitude: 1, longitude: 1 };
    fireEvent.press(mapView, { nativeEvent: { coordinate } });

    expect(onLocationChange).toHaveBeenCalledWith(coordinate);
  });

  it("changes location state correctly", () => {
    const changeLocation = jest.fn();
    const { getByTestId } = render(
      <LocationSelector
        initialLocation={{ latitude: 0, longitude: 0 }}
        onLocationChange={changeLocation}
      />
    );

    const mapView = getByTestId("map-view");
    const fakeCoordinate = { latitude: 37.78825, longitude: -122.4324 };

    fireEvent.press(mapView, {
      nativeEvent: {
        coordinate: fakeCoordinate,
      },
    });

    expect(changeLocation).toHaveBeenCalledWith(fakeCoordinate);
  });
});
