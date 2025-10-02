export function getToken() {
  const tokenString = localStorage.getItem("token");
  if (tokenString) {
    return JSON.parse(tokenString);
  }
}

export function removeToken() {
  localStorage.removeItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", JSON.stringify(token));
}

export function haveToken() {
  const token = localStorage.getItem("token");
  return !!token;
}