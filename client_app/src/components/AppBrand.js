import { Link } from "react-router-dom";

/**
 * Volunteer Connect logo. Links to `to` (the current dashboard's home).
 */
function AppBrand({ to = "/" }) {
  return (
    <Link className="app-brand" to={to} aria-label="Volunteer Connect — go to dashboard home">
      <span className="app-brand-mark" aria-hidden="true">VC</span>
      <span className="app-brand-name">Volunteer Connect</span>
    </Link>
  );
}

export default AppBrand;
