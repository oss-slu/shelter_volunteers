let currentUser;

export function setUser(user) {
  currentUser = user;
}

export function getUser() {
  return currentUser;
}

export function removeUser() {
  currentUser = undefined;
}
