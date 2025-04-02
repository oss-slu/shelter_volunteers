import getToken from "./getToken";

export default function getAuthHeader() {
  const token = getToken();
  if (!token) return undefined;

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${JSON.parse(token)}`, //  Cleaned format
  };
}
