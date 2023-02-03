import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { mockedFunctionType } from "../utils/types/mockedType";

jest.mock("../hooks/useCurrentLocation", () => ({
  useCurrentLocation: jest.fn(),
}));

export const mockedUseCurrentLocation = mockedFunctionType(useCurrentLocation);
