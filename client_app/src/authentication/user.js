export function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser() {
  const userString = localStorage.getItem("user");
  if (userString) {
    return JSON.parse(userString);
  }
}