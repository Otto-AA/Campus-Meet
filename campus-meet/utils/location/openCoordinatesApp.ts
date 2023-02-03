import * as Linking from "expo-linking";
import { Platform } from "react-native";

import { Coordinates } from "../../hooks/useCurrentLocation";

export const openCoordinatesInMap = (
  { latitude, longitude }: Coordinates,
  label = "Open in map"
) => {
  const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
  const latLng = `${latitude},${longitude}`;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });

  Linking.openURL(url!);
};
