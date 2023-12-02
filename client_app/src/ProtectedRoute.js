import {Navigate, Outlet} from 'react-router-dom'

const isLoggedIn = () => {
  const token = localStorage.getItem('token')
  if(token){
    return true
  } else {
    return false
  }
}

const ProtectedRoute = () => {
    const auth = isLoggedIn()

    return auth ? <Outlet/> : <Navigate to="/" />
}

export default ProtectedRoute
