import { useState } from 'react';
import getToken from './getToken';

// custom hook to get and save authentication token
export default function useToken() {
  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    localStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token
  }
}
