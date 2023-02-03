import { render, screen, fireEvent } from "@testing-library/react-native";

import NotFoundScreen from "./NotFoundScreen";

describe("NotFoundScreen", () => {
  it("renders the title", () => {
    render(<NotFoundScreen />);
    expect(screen.getByText("This screen doesn't exist.")).toBeTruthy();
  });

  it("renders the link", () => {
    render(<NotFoundScreen />);
    expect(screen.getByText("Go to home screen!")).toBeTruthy();
  });

  it("displays the correct text and has a working button", () => {
    const navigation = { replace: jest.fn() };
    const { getByText } = render(<NotFoundScreen navigation={navigation} />);

    expect(getByText("This screen doesn't exist.")).toBeTruthy();
    expect(getByText("Go to home screen!")).toBeTruthy();

    fireEvent.press(getByText("Go to home screen!"));
    expect(navigation.replace).toHaveBeenCalledWith("Root");
  });

  it('renders the title "This screen doesn\'t exist."', () => {
    const { getByText } = render(<NotFoundScreen />);
    const title = getByText("This screen doesn't exist.");
    expect(title).toBeDefined();
  });

  it('renders the "Go to home screen!" button', () => {
    const { getByText } = render(<NotFoundScreen />);
    const button = getByText("Go to home screen!");
    expect(button).toBeDefined();
  });

  it('navigates to the home screen when the "Go to home screen!" button is pressed', () => {
    const navigation = { replace: jest.fn() };
    const { getByText } = render(<NotFoundScreen navigation={navigation} />);
    const button = getByText("Go to home screen!");
    fireEvent.press(button);
    expect(navigation.replace).toHaveBeenCalledWith("Root");
  });
});
