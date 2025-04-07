import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { removeToken } from "../../authentication/getToken";
export default function Logout({setAuth}) {
  const navigate = useNavigate();
  useEffect(() => {
    removeToken();
    setAuth(false);
    navigate("/");
  }, []);
}
