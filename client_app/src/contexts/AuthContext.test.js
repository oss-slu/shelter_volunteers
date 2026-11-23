import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { getUser } from "../authentication/user";

function SessionControls() {
  const { isAuthenticated, loading, login, logout } = useAuth();
  return (
    <>
      <span>{loading ? "loading" : isAuthenticated ? "signed in" : "signed out"}</span>
      <button onClick={() => login({ email: "admin@example.com" })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </>
  );
}

afterEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

test("restores a cookie session and clears legacy browser storage", async () => {
  window.localStorage.setItem("token", "legacy-token");
  window.localStorage.setItem("user", "legacy-user");
  window.fetch = jest.fn().mockResolvedValue({
    ok: true, json: async () => ({ user: { email: "admin@example.com" } }),
  });
  render(<AuthProvider><SessionControls /></AuthProvider>);
  expect(await screen.findByText("signed in")).toBeInTheDocument();
  expect(getUser()).toEqual({ email: "admin@example.com" });
  expect(window.localStorage.getItem("token")).toBeNull();
  expect(window.localStorage.getItem("user")).toBeNull();
  expect(window.fetch).toHaveBeenCalledWith(
    "/session", expect.objectContaining({ credentials: "include" })
  );
});

test("keeps login data out of storage and signs out through the server", async () => {
  window.fetch = jest.fn()
    .mockResolvedValueOnce({ status: 401 })
    .mockResolvedValueOnce({ ok: true });
  render(<AuthProvider><SessionControls /></AuthProvider>);
  await screen.findByText("signed out");
  fireEvent.click(screen.getByText("Login"));
  expect(screen.getByText("signed in")).toBeInTheDocument();
  expect(window.localStorage.getItem("user")).toBeNull();
  fireEvent.click(screen.getByText("Logout"));
  await waitFor(() => expect(screen.getByText("signed out")).toBeInTheDocument());
  expect(getUser()).toBeUndefined();
  expect(window.fetch).toHaveBeenLastCalledWith(
    "/session", expect.objectContaining({ method: "DELETE", credentials: "include" })
  );
});
