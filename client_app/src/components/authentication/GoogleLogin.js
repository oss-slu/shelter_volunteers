import { setToken } from "../../authentication/getToken";
import { GoogleLogin } from '@react-oauth/google';
import { loginAPI } from '../../api/login';
import "../../styles/Login.css";
import { jwtDecode } from "jwt-decode";

function Login({ setAuth, setCurrentUser }) {
    const onSuccess = (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        const user = {
          name: decoded.name || decoded.given_name || decoded.email,
          email: decoded.email,
          picture: decoded.picture || decoded.profile_picture || "",
        }
        setCurrentUser(user);
        setToken(credentialResponse.credential);
        loginAPI.login(credentialResponse.credential)
          .then(response => {
            setToken(response.access_token);
            setAuth(true);
          })
          .catch(error => {
            console.error('API Error:', error);
          });
      };
    
      const onError = () => {
        console.log('Login Failed');
      };
    
      return (
        <div className="home-container">
          <div className="content-wrapper">
            <h2 className="title">
              Welcome to <span className="app-name">Volunteer Connect</span>
            </h2>
            <p className="tagline">
              Connecting volunteers with emergency shelters to make a difference!
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
            <p className="login-subtitle">
              Sign in to get started with your personalized experience
            </p>
          </div>
        </div>        

      );
}
export default Login;