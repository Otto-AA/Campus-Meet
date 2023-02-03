import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { NetworkRequestFailedException } from "../exceptions/exceptions";
import { sendSignInEmail } from "../utils/auth/signIn";
import { mockedFunctionType } from "../utils/types/mockedType";
import SignInScreen from "./SignInScreen";

jest.mock("../utils/auth/signIn");
const mockedSendSignInEmail = mockedFunctionType(sendSignInEmail);

const submitEmailAddress = (email: string) => {
  act(() => {
    fireEvent.changeText(screen.getByTestId("email-input"), email);
  });
  act(() => {
    fireEvent.press(screen.getByTestId("signInButton"));
  });
};

const originalWarn = console.warn.bind(console.warn);
const originalError = console.error.bind(console.error);
describe("SignInScreen", () => {
  beforeAll(() => {
    // hide warnings that occur because of paper TextInput
    console.warn = (msg) =>
      !msg.toString().includes("useNativeDriver") && originalWarn(msg);
    console.error = (msg) =>
      !msg.toString().includes("test error") &&
      !(msg instanceof NetworkRequestFailedException) &&
      originalError(msg);
  });

  beforeEach(() => {
    mockedSendSignInEmail.mockReset();
  });

  it("displays title", () => {
    render(<SignInScreen />);

    expect(screen.getByText("Campus Meet")).toBeVisible();
  });

  it("calls sendSignInEmail when entering mail", async () => {
    render(<SignInScreen />);

    submitEmailAddress("test@example.org");
    await waitFor(() =>
      expect(screen.getByTestId("email-sent-message")).toBeVisible()
    );

    expect(mockedSendSignInEmail).toHaveBeenCalledWith("test@example.org");
  });

  it("displays error message for invalid email", async () => {
    render(<SignInScreen />);

    submitEmailAddress("invalid.com");

    await waitFor(() =>
      expect(screen.getByTestId("email-error")).toBeVisible()
    );
  });

  it("displays error message when sending email fails", async () => {
    mockedSendSignInEmail.mockRejectedValue(new Error("test error"));
    render(<SignInScreen />);

    submitEmailAddress("test@example.org");
    await waitFor(() =>
      expect(screen.getByTestId("sending-error")).toHaveTextContent(
        "test error"
      )
    );
  });

  it("displays network error message on network failure", async () => {
    mockedSendSignInEmail.mockRejectedValue(
      new NetworkRequestFailedException()
    );
    render(<SignInScreen />);

    submitEmailAddress("test@example.org");
    await waitFor(() =>
      expect(screen.getByTestId("sending-error")).toHaveTextContent(
        "Could not connect to the server. Please check your network connection."
      )
    );
  });

  afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });
});
