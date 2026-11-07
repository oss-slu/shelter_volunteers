import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import { loginAPI } from "../../api/login";
import { useAuth } from "../../contexts/AuthContext";

jest.mock("../../api/login", () => ({
  loginAPI: {
    loginWithLocalAdmin: jest.fn(),
    loginWithPassword: jest.fn(),
  },
}));
jest.mock("../../contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("react-router-dom", () => ({
  Link: ({ children }) => <span>{children}</span>,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ isAuthenticated: false, login: jest.fn() });
});

test.each([
  ["local", "loginWithLocalAdmin"],
  ["gethelp", "loginWithPassword"],
])("submits credentials to the selected %s provider", async (provider, method) => {
  const user = { email: "admin@example.com" };
  loginAPI[method].mockResolvedValue({ access_token: "app-token", user });
  render(<Login />);
  fireEvent.change(screen.getByLabelText("Account type"), { target: { value: provider } });
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: user.email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await waitFor(() => {
    expect(loginAPI[method]).toHaveBeenCalledWith(user.email, "test-password");
    expect(useAuth().login).toHaveBeenCalledWith("app-token", user);
  });
});
