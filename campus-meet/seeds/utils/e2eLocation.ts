import { Coordinates } from "../../hooks/useCurrentLocation";

// the device.setLocation(latitude, longitude) often did not work
// therefore we just test with the default location of detox
export const emulatorDefaultLocation: Coordinates = {
  latitude: 32.0853,
  longitude: 34.7818,
};
