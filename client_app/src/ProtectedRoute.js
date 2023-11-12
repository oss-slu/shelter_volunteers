import { Navigate } from "react-router-dom";
import useToken from "./authentication/useToken";

export const ProtectedRoute = ({ children }) => {
  const { token } = useToken();
  if (!token) {
    // user is not authenticated
    return <Navigate to="/" />;
  }
  return children;
};
