import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SERVER } from "../../config";
import { Form, Button, Container, Card } from 'react-bootstrap';

async function LoginUser(user, pass) {
  try {
    const response = await fetch(SERVER + "/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'user': user,
        'password': pass
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem('token', JSON.stringify(data.access_token));
  } catch (error) {
    // Handle login error
    console.error('Login error', error);
  }
}


export default function Login({ setAuth }) {

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    await LoginUser(username, password);
    const mytoken = localStorage.getItem('token')
    setAuth(true);
    navigate("/dashboard")
  }
  //if user is already loggedin redirect to dashboard page
  if (token) {
    return <Navigate to="/dashboard" />
  }

  return (
    <Container>
      <br>
      </br>
      <Card>
        <Card.Body>
          <Card.Title>Sign in</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text"
                onChange={e => setUserName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password"
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Group>
            <br>
            </br>
            <Button variant="dark" type="submit">
              Login
            </Button>

            <div className="py-2">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

