import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Form, Alert, Button, Container, Card, FloatingLabel } from "react-bootstrap";
import { loginAPI } from "../../api/login";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [provider, setProvider] = useState("local");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = provider === "local"
        ? await loginAPI.loginWithLocalAdmin(email, password)
        : await loginAPI.loginWithPassword(email, password);
      login(data.access_token, data.user);
      navigate("/home");
    } catch (error) {
      console.error("Admin sign-in error", error);
      setError(error.message || "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="admin-login-page">
      <Container className="admin-login-container">
        <Link className="admin-login-back" to="/home">← Back to Volunteer Connect</Link>
        <Card className="admin-login-card">
          <Card.Body>
            <p className="landing-card-eyebrow">Admin access</p>
            <h1>Admin sign in</h1>
            <p className="admin-login-description">
              Use your system or shelter admin credentials, or an existing GetHelp account.
            </p>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="adminProvider">
                <Form.Label>Account type</Form.Label>
                <Form.Select value={provider} onChange={(event) => {
                  setProvider(event.target.value);
                  setError("");
                }}>
                  <option value="local">Local admin account</option>
                  <option value="gethelp">GetHelp account</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel controlId="adminEmail" label="Email address" className="mb-3">
                <Form.Control
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="name@example.com"
                />
              </FloatingLabel>
              <FloatingLabel controlId="adminPassword" label="Password" className="mb-3">
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Password"
                />
              </FloatingLabel>
              {error && <Alert variant="danger" role="alert">{error}</Alert>}
              <Button className="admin-login-submit" type="submit" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </Form>
            <p className="admin-login-google">
              Or <Link to="/home#sign-in">sign in with Google</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}
