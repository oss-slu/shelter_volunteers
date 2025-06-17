import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { removeToken } from "../../authentication/getToken";
import { removeUser } from "../../authentication/user";
export default function Logout({setAuth}) {
  const navigate = useNavigate();
  useEffect(() => {
    removeToken();
    removeUser();
    setAuth(false);
    navigate("/");
  }, []);
}
