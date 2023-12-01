import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    confirmPass: '',
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
      const response = await fetch('https://oauth-qa.gethelp.com/api/accounts/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Registration was successful
        setShowSuccessModal(true);
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          confirmPass: '',
          phone: ''
        })
      } else {
        // Handle registration errors
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowErrorModal(true);
    }
  };

  return (
    <>
      {showSuccessModal && (
        <Alert variant="success">Account created! <Link to="/login">Sign In</Link></Alert>
      )}
      {showErrorModal && (
        <Alert variant="danger" onClose={() => setShowErrorModal(false)} dismissible>Error creating an accout!, Please try again </Alert>
      )}
      <Container>
        <br>
        </br>
        <Row>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Sign up</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPass"
                      value={formData.confirmPass}
                      onChange={handleChange}
                      required
                    />
                    {!isPasswordSame && (
                      <Form.Text className="text-muted">
                        Passwords do not match
                      </Form.Text>
                    )}
                    
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <br>
                  </br>
                  <Button variant="dark" type="submit">
                    Register
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <div> <h2>About</h2> </div>
          </Col>
        </Row>

      </Container>
    </>
  );
}

export default RegistrationForm;

