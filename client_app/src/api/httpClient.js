import { SERVER } from "../config";
import { getToken } from "../authentication/getToken";
import axios from "axios";
import { getGlobalLogout } from "../contexts/AuthContext";

let navigate = null;
export const setNavigateHttpClient = (navigateFunction) => {
  navigate = navigateFunction;
};

const httpClient = axios.create({ baseURL: SERVER, timeout: 10000 });

httpClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        const logout = getGlobalLogout();
        if (logout) {
          logout();
        }
        if (navigate) {
          navigate("/home");
        }
      }
    }
    return Promise.reject(error);
  },
);

export default httpClient;
