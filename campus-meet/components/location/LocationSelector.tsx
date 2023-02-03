import { useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";

import { Coordinates } from "../../hooks/useCurrentLocation";

export interface ILocationSelectorProps {
  initialLocation: Coordinates;
  onLocationChange(newLocation: Coordinates): void;
}

export default function LocationSelector({
  initialLocation,
  onLocationChange,
}: ILocationSelectorProps) {
  const [location, setLocation] = useState(initialLocation);

  const changeLocation = async (newLocation: Coordinates) => {
    setLocation(newLocation);
    onLocationChange(newLocation);
  };

  const handleMapPress = (event: MapPressEvent) => {
    changeLocation(event.nativeEvent.coordinate as any);
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          testID="map-view"
          style={styles.map}
          showsUserLocation
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
        >
          <Marker testID="marker" coordinate={location} />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
