import { fetchClient } from "./fetchClient";
export const loginAPI = {
  login: async (token) => fetchClient("/login", {
    method: "POST",
    body: JSON.stringify({ idToken: token }),
  }),
  loginWithPassword: async (email, password) => fetchClient("/login/password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),
  loginWithLocalAdmin: async (email, password) => fetchClient("/login/local-admin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),
}
