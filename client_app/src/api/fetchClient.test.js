import { fetchClient, setNavigate } from "./fetchClient";
import { getGlobalLogout } from "../contexts/AuthContext";

jest.mock("../contexts/AuthContext", () => ({ getGlobalLogout: jest.fn() }));

beforeEach(() => {
  getGlobalLogout.mockReset();
  setNavigate(null);
  window.fetch = jest.fn();
});

afterEach(() => {
  delete window.fetch;
});

test.each([
  ['{"message":"Invalid email or password"}', 403, "Invalid email or password"],
  ['{"error":"Invalid token"}', 400, "Invalid token"],
  ["Proxy error: server unavailable", 500, "Proxy error: server unavailable"],
  ["<html>Internal server error</html>", 500, "Request failed (HTTP 500)"],
  ["", 503, "Request failed (HTTP 503)"],
])("reports an HTTP error after reading the body once", async (body, status, expected) => {
  const text = jest.fn().mockResolvedValue(body);
  window.fetch.mockResolvedValue({ ok: false, status, text });
  await expect(fetchClient("/login/local-admin")).rejects.toThrow(expected);
  expect(text).toHaveBeenCalledTimes(1);
});

test("logs out on an expired session", async () => {
  const logout = jest.fn().mockResolvedValue();
  const navigate = jest.fn();
  getGlobalLogout.mockReturnValue(logout);
  setNavigate(navigate);
  window.fetch.mockResolvedValue({ ok: false, status: 401 });

  await expect(fetchClient("/protected")).rejects.toThrow("Authentication failed");
  expect(logout).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith("/");
});

test("sends browser-session credentials and returns JSON", async () => {
  const data = { user: { email: "admin@example.com" } };
  window.fetch.mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue(data) });
  await expect(fetchClient("/login/local-admin")).resolves.toEqual(data);
  expect(window.fetch).toHaveBeenCalledWith(
    "/login/local-admin",
    expect.objectContaining({
      credentials: "include",
      headers: expect.objectContaining({ "X-Volunteer-Session": "1" }),
    })
  );
});
