import { setToken } from "../../authentication/getToken";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from '@react-oauth/google';
import { loginAPI } from '../../api/login';

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
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
        />
      );
}

export default Login;