import React, { useState } from 'react';
import PropTypes from 'prop-types';

// temporary solution
// permanent solution is to add a /login endpoint to our server-side
// which authenticates through GetHelp
async function loginUser(user, pass, setToken) {
  console.log("user "+user);
  console.log("pass "+pass);
  fetch('https://oauth-qa.gethelp.com/api/oauth/token', {
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
  })
  .then(response => response.json())
  .then(data => {
    // Handle successful login
    setToken(data.access_token);
  })
  .catch(error => {
    // Handle login error
    console.error('Login error', error);
  });
}

export default function Login({ setToken }) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await loginUser(
      username,
      password,
      setToken
    );
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
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};
