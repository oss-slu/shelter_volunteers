import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

// temporary solution
// permanent solution is to add a /login endpoint to our server-side
// which authenticates through GetHelp

async function LoginUser(user, pass) {
  try {
    const response = await fetch('https://oauth-qa.gethelp.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(process.env.REACT_APP_GETHELP_AUTH_API_TOKEN)
      },
      body: new URLSearchParams({
        'grant_type': 'password',
        'username': user,
        'password': pass
      }).toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem('token', JSON.stringify(data.access_token));
    console.log('Set token to ' + data.access_token);
  } catch (error) {
    // Handle login error
    console.error('Login error', error);
  }
}


export default function Login() {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    await LoginUser(username, password);
    const mytoken = localStorage.getItem('token')
    console.log(mytoken);
    navigate("/dashboard")
  }
  //if user is already loggedin redirect to dashboard page
  if (token){
     return <Navigate to="/dashboard" />
  }


  return(
    <div>
      <h1>Please Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Sign In</button>
        </div>
      </form>
      <Link to="/signup">
        <button>Create an Account</button>
      </Link>
    </div>
  )
}

