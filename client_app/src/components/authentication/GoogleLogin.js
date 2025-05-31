import { setToken } from "../../authentication/getToken";
import { GoogleLogin } from '@react-oauth/google';
import { loginAPI } from '../../api/login';
import "../../styles/Login.css";

function Login({ setAuth }) {
    const onSuccess = (credentialResponse) => {
        // TODO: Use decoded credentials to get user's iname and store
        // the name in the session storage 
        //const decoded = jwtDecode(credentialResponse.credential);
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
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onError}
              theme="filled_blue"
              type="standard"
              shape="rectangular"
              size="large"
            />
            <p className="login-subtitle">
              Sign in to get started with your personalized experience
            </p>
          </div>
        </div>        

      );
}
export default Login;