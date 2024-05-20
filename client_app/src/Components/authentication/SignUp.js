import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Alert, Card, Container, Row, Col } from "react-bootstrap";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import About from "../About";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
    confirmPass: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isPasswordSame, setIsPasswordSame] = useState(false);
  useEffect(() => {
    if (formData.password === formData.confirmPass) {
      setIsPasswordSame(true);
    } else {
      setIsPasswordSame(false);
    }
  }, [formData.password, formData.confirmPass]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform the registration API request here
    try {
      const response = await fetch("https://oauth-qa.gethelp.com/api/accounts/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Registration was successful
        setShowSuccessModal(true);
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          password: "",
          confirmPass: "",
          phone: "",
        });
      } else {
        // Handle registration errors
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setShowErrorModal(true);
    }
  };

  return (
    <>
      {showSuccessModal && (
        <Alert variant="success">
          Account created! <Link to="/">Sign In</Link>
        </Alert>
      )}
      {showErrorModal && (
        <Alert variant="danger" onClose={() => setShowErrorModal(false)} dismissible>
          Error creating an accout!, Please try again
        </Alert>
      )}
      <Container>
        <br></br>
        <Row>
          <Col md={6} style={{ marginBottom: "2rem" }}>
            <Card>
              <Card.Header>Sign up</Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <FloatingLabel controlId="email" label="Email address" className="mb-2">
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@example.com"
                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="firstName" label="First Name" className="mb-2">
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="First Name"
                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="lastName" label="Last Name" className="mb-2">
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Last Name"
                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="password" label="Password" className="mb-2">
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="confirmPass" label="Confirm Password" className="mb-2">
                    <Form.Control
                      type="password"
                      name="confirmPass"
                      value={formData.confirmPass}
                      onChange={handleChange}
                      required
                      placeholder="Re-type Password"
                    />
                    {!isPasswordSame && (
                      <Form.Text className="text-muted">Passwords do not match</Form.Text>
                    )}
                  </FloatingLabel>
                  <FloatingLabel controlId="phone" label="Phone number" className="mb-2">
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="3141231234"
                    />
                  </FloatingLabel>
                  <Button
                    variant="dark"
                    type="submit"
                    disabled={formData.password !== formData.confirmPass}>
                    Register
                  </Button>
                </Form>
              </Card.Body>
              <Card.Footer>
                Already have an account? <Link to="/">Sign in</Link>
              </Card.Footer>
            </Card>
          </Col>
          <Col md={6}>
            <About />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default RegistrationForm;
