export function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
  console.log("saved user to localStorage:", user);
}

export function getUser() {
  const userString = localStorage.getItem("user");
  if (userString) {
    return JSON.parse(userString);
  }
}

export function removeUser() {
  console.log("removing user from localStorage");
  localStorage.removeItem("user");
}