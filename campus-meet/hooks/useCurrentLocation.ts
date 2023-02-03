import * as Location from "expo-location";
import { useEffect, useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const getApproximateLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      console.warn("Permission to access location was denied");
      return null;
    }

    console.log("loading last location...");
    const currentLocation = await Location.getLastKnownPositionAsync().catch(
      (err) => {
        console.error("Could not retrieve last known location", err);
        throw err;
      }
    );
    if (currentLocation !== null) return currentLocation;

    console.log("loading current location...");
    return await Location.getCurrentPositionAsync();
  } catch (error) {
    console.error("Could not retrieve location", error);
    throw error;
  }
};

export function useCurrentLocation() {
  const [location, setLocation] = useState<Coordinates>();

  useEffect(() => {
    (async () => {
      const location = await getApproximateLocation();
      console.log("received current location", location);
      if (location)
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
    })();
  }, []);

  return [location, setLocation] as const;
}
