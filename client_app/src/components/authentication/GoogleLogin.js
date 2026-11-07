import { GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';
import { loginAPI } from '../../api/login';
import "../../styles/Login.css";
import { jwtDecode } from "jwt-decode";
import {useAuth } from "../../contexts/AuthContext";
import ShelterMap from "../ShelterMap";

function Login() {
  const { login } = useAuth();
  const onSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const user = {
      name: decoded.name || decoded.given_name || decoded.email,
      email: decoded.email,
      picture: decoded.picture || decoded.profile_picture || "",
    }
    loginAPI.login(credentialResponse.credential)
      .then(response => {
        login(response.access_token, user);
      })
      .catch(error => {
        console.error('API Error:', error);
      });
  };
    
    const onError = () => {
      console.log('Login Failed');
    };
  
    return (
      <div className="home-container landing-page" id="top">
        <header className="landing-nav">
          <a className="landing-brand" href="#top" aria-label="Volunteer Connect home">
            <span className="landing-brand-mark" aria-hidden="true">VC</span>
            <span>Volunteer Connect</span>
          </a>
          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#shelters">Shelters</a>
            <a href="#how-it-works">How it works</a>
            <a className="landing-nav-cta" href="#sign-in">Sign in</a>
          </nav>
        </header>
        <main className="landing-main">
          <section className="landing-hero" aria-labelledby="landing-title">
            <div className="landing-copy">
              <p className="landing-eyebrow">
                <span className="landing-eyebrow-dot" aria-hidden="true" />
                Neighbors helping neighbors
              </p>
              <h1 id="landing-title">
                Good things happen when <span>communities show up.</span>
              </h1>
              <p className="landing-description">
                Volunteer Connect brings shelters and volunteers together to make
                local support easier to find, organize, and deliver.
              </p>
              <div className="landing-actions">
                <a className="landing-primary-cta" href="#sign-in">
                  Get started <span aria-hidden="true">→</span>
                </a>
                <a className="landing-text-cta" href="#how-it-works">
                  Explore how it works
                </a>
              </div>
              <p className="landing-reassurance">
                One sign-in connects you to the tools available for your role.
              </p>
            </div>
            <aside className="landing-signin" id="sign-in" aria-labelledby="signin-title">
              <div className="landing-signin-icon" aria-hidden="true">↗</div>
              <p className="landing-card-eyebrow">Welcome to the community</p>
              <h2 id="signin-title">Make a difference, together.</h2>
              <p className="landing-signin-description">
                Sign in to continue to your volunteer, shelter, or admin workspace.
              </p>
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={onError}
                  theme="filled_blue"
                  type="standard"
                  shape="rectangular"
                  size="large"
                />
              </div>
              <p className="landing-signin-note">
                Secure sign-in powered by Google
              </p>
              <p className="landing-admin-signin">
                Admin? <Link to="/admin-login">Sign in with email and password</Link>
              </p>
            </aside>
          </section>
          <ShelterMap />
          <section className="landing-process" id="how-it-works" aria-labelledby="process-title">
            <div className="landing-process-heading">
              <p className="landing-eyebrow">One connected effort</p>
              <h2 id="process-title">Support moves forward, together.</h2>
              <p>
                Each part of the community has a clear role in getting help where
                it is needed.
              </p>
            </div>
            <div className="landing-role-grid">
              <article className="landing-role-card landing-role-admin">
                <span className="landing-role-number">01</span>
                <p className="landing-role-label">Admin team</p>
                <h3>Build a trusted network</h3>
                <p>
                  Review and approve shelters, and manage access to the platform.
                </p>
              </article>
              <article className="landing-role-card landing-role-shelter">
                <span className="landing-role-number">02</span>
                <p className="landing-role-label">Shelter operators</p>
                <h3>Share where help is needed</h3>
                <p>
                  Publish open status and volunteer positions so the community
                  knows when support is needed.
                </p>
              </article>
              <article className="landing-role-card landing-role-volunteer">
                <span className="landing-role-number">03</span>
                <p className="landing-role-label">Volunteers</p>
                <h3>Turn intention into action</h3>
                <p>
                  Discover open opportunities and apply for a position that fits.
                </p>
              </article>
            </div>
          </section>
          <footer className="landing-footer">
            <span className="landing-brand-mark" aria-hidden="true">VC</span>
            <p>Volunteer Connect · Stronger communities start together.</p>
            <a href="#top">Back to top ↑</a>
          </footer>
        </main>
      </div>
    );
}
export default Login;