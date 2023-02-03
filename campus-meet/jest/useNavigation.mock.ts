import { useNavigation } from "@react-navigation/native";

import { mockedFunctionType } from "../utils/types/mockedType";

jest.mock("@react-navigation/native");
const mockedUseNavigation = mockedFunctionType(useNavigation);
const _mockedNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};
mockedUseNavigation.mockReturnValue(_mockedNavigation);

export const mockedNavigate = _mockedNavigation.navigate;
export const mockedSetOptions = _mockedNavigation.setOptions;
export const mockedNavigation = _mockedNavigation;
