import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGlobalLogout } from "../../contexts/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const logout = getGlobalLogout();
  const [error, setError] = useState("");
  useEffect(() => {
    logout().then(() => navigate("/")).catch((failure) => {
      setError(failure.message);
    });
  }, [logout, navigate]);
  return error ? <p role="alert">{error}</p> : <p>Signing out...</p>;
}
