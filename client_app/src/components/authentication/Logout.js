import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getGlobalLogout } from "../../contexts/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const logout = getGlobalLogout();
  useEffect(() => {
    logout();
    navigate("/");
  }, []);
}
