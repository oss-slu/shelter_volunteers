import { getToken } from "./getToken";

export default function getAuthHeader() {
  const token = getToken();
  if (token) {
    return {
      "Content-Type": "application/json",
      Authorization: token,
    };
  }
}
