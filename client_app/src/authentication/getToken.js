export default function getToken() {
  const tokenString = localStorage.getItem("token");
  if (tokenString) {
    return JSON.parse(tokenString);
  }
}
