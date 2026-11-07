import { Navigate, useLocation } from "react-router-dom";

// The app used to be served under /shelter. Map /shelter, /shelter/home and
// /shelter/<path> to their root equivalents, keeping any query string and hash.
function LegacyShelterRedirect() {
  const { pathname, search, hash } = useLocation();
  let target = pathname.replace(/^\/shelter(?=\/|$)/, "") || "/";
  if (target === "/home") target = "/";
  return <Navigate to={`${target}${search}${hash}`} replace />;
}

export default LegacyShelterRedirect;
