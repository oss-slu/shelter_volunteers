import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SERVER } from "../../config";
import { Form, Button, Container, Card, Col, Row, FloatingLabel } from "react-bootstrap";
import About from "../About";

async function LoginUser(user, pass) {
  try {
    const response = await fetch(SERVER + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user,
        password: pass,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem("token", JSON.stringify(data.access_token));
  } catch (error) {
    // Handle login error
    console.error("Login error", error);
  }
}

export default function Login({ setAuth, userRole }) {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await LoginUser(username, password);
    setAuth(true);
    navigate(userRole === "shelter" ? "/shelter-dashboard/30207" : "/volunteer-dashboard");
  };  
  if (token) {
    return <Navigate to={userRole === "shelter" ? "/shelter-dashboard/30207" : "/volunteer-dashboard"} />;
  }  

  return (
    <Container>
      <br></br>
      <Row>
        <Col md={6} order={1} style={{ marginBottom: "2rem" }}>
          <Card>
            <Card.Header>{userRole === "shelter" ? "Shelter Admin Sign In" : "Volunteer Sign In"}</Card.Header>
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
              <div className="mt-3">
                {userRole === "shelter" ? (
                  <p>
                    Not a Shelter Admin? <Link to="/volunteer-login">Sign in as a volunteer HERE</Link>
                  </p>
                ) : (
                  <p>
                    Not a Volunteer? <Link to="/shelter-login">Sign in as a Shelter Admin HERE</Link>
                  </p>
                )}
              </div>
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
