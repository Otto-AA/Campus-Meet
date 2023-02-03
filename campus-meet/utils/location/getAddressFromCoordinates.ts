import Constants from "expo-constants";

import { Coordinates } from "../../hooks/useCurrentLocation";

const GOOGLE_API_KEY = Constants.manifest?.extra?.googleMapsApiKey as string;

interface AddressResponse {
  results: AddressResult[];
}

interface AddressResult {
  address_components: AddressComponent[];
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: AddressComponentType[];
}

type AddressComponentType =
  | "street_number"
  | "route"
  | "locality"
  | "administrative_area_level_1"
  | "administrative_area_level_2";

const getComponent = (
  result: AddressResult,
  type: AddressComponentType
): AddressComponent | undefined => {
  if (!result) return;

  return result.address_components.find((component) =>
    component.types.includes(type)
  );
};

export const getAddressFromCoordinates = async ({
  latitude,
  longitude,
}: Coordinates) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${GOOGLE_API_KEY}`;

  let res;
  try {
    res = await fetch(url);
  } catch (error) {
    console.log(`Could not fetch address: ${(error as Error).message}`);
    return "Unknown address";
  }

  const json: AddressResponse = await res.json();
  if (!json.results.length) return "Unknown address";
  const firstResult = json.results[0];

  const routeComponent = getComponent(firstResult, "route");
  const streetNumberComponent = getComponent(firstResult, "street_number");
  const localityComponent = getComponent(firstResult, "locality");
  const administrativeAreaLevel1Component = getComponent(
    firstResult,
    "administrative_area_level_1"
  );
  const administrativeAreaLevel2Component = getComponent(
    firstResult,
    "administrative_area_level_2"
  );

  const route = routeComponent?.long_name;
  const streetNumber = streetNumberComponent?.long_name;
  const locality = localityComponent?.long_name;
  const administrativeAreaLevel1 = administrativeAreaLevel1Component?.long_name;
  const administrativeAreaLevel2 = administrativeAreaLevel2Component?.long_name;

  return route && streetNumber
    ? `${route} ${streetNumber}`
    : route ??
        locality ??
        administrativeAreaLevel1 ??
        administrativeAreaLevel2 ??
        "Unknown address";
};
