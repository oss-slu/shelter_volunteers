import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Form, Alert, Button, Container, Card, Col, Row, FloatingLabel } from "react-bootstrap";
import About from "../About";
import {loginAPI} from "../../api/login"

export default function Login({ setAuth }) {
  const token = localStorage.getItem("token");
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState(null); // State for error message

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const data = await loginAPI.login(username, password);
        localStorage.setItem("token", JSON.stringify(data.access_token));
        setAuth(true);
        window.location.href="/home";
        console.log('Navigation called');
    } catch (error) {
        // Handle login error
        console.error("Login error", error);
        setError("Login error");
    }
  };
  
  if (token) {
    return <Navigate to={"/home"} />;
  }  

  return (
    <Container>
      <br></br>
      <Row>
        <Col md={6} order={1} style={{ marginBottom: "2rem" }}>
          <Card>
            <Card.Header>{"Sign In"}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <FloatingLabel controlId="formBasicEmail" label="Email address" className="mb-2">
                  <Form.Control
                    type="text"
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Email Address"
                  />
                </FloatingLabel>
                <FloatingLabel controlId="formBasicPassword" label="Password" className="mb-2">
                  <Form.Control
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </FloatingLabel>
                <Button variant="dark" type="submit">
                  Login
                </Button>
                <div className="py-2">
                  Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>
              </Form>
              {error && <Alert variant="danger">{error}</Alert>} {/* Display error message */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} order={2}>
          <About />
        </Col>
      </Row>
    </Container>
  );
}
