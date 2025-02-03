import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SERVER } from "../../config";
import { Form, Button, Container, Card, Col, Row, FloatingLabel } from "react-bootstrap";
import About from "../About";

async function LoginShelterAdmin(username, password) {
  try {
    const response = await fetch(`${SERVER}/shelter-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem("shelterToken", JSON.stringify(data.access_token));
  } catch (error) {
    console.error("Shelter Admin Login error", error);
  }
}

export default function ShelterLogin({ setAuth }) {
  const token = localStorage.getItem("shelterToken");
  const navigate = useNavigate();

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await LoginShelterAdmin(username, password);
    setAuth(true);
    navigate("/shelter-dashboard");
  };

  if (token) {
    return <Navigate to="/shelter-dashboard" />;
  }

  return (
    <Container>
      <br></br>
      <Row>
        <Col md={6} order={1} style={{ marginBottom: "2rem" }}>
          <Card>
            <Card.Header>Shelter Admin Sign In</Card.Header>
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

