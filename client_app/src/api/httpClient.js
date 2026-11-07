import { SERVER } from "../config";
import axios from "axios";
import { getGlobalLogout } from "../contexts/AuthContext";

let navigate = null;
export const setNavigateHttpClient = (navigateFunction) => {
  navigate = navigateFunction;
};

const httpClient = axios.create({
  baseURL: SERVER,
  timeout: 10000,
  withCredentials: true,
  headers: { "X-Volunteer-Session": "1" },
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        const logout = getGlobalLogout();
        if (logout) {
          logout().catch((logoutError) => console.error("Sign-out failed:", logoutError));
        }
        if (navigate) {
          navigate("/");
        }
      }
    }
    return Promise.reject(error);
  },
);

export default httpClient;
