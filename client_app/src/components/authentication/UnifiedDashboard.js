import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER } from "../../config";
import { Container, Button, Row, Col, Card } from "react-bootstrap";

const UnifiedDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [shelterIds, setShelterIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${SERVER}/user_permission`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        });
        const data = await response.json();

        setRoles(data.full_access.map(r => r.resource_type));
        const shelterEntry = data.full_access.find(r => r.resource_type === "shelter");
        if (shelterEntry) {
          setShelterIds(shelterEntry.resource_ids);
        }

      } catch (err) {
        console.error("Permission fetch error:", err);
      }
    };

    fetchPermissions();
  }, []);

  return (
    <Container className="my-4">
      <h2>Welcome! Select a dashboard</h2>
      <Row>
        {roles.includes("system") && (
          <Col md={4}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>System Admin</Card.Title>
                <Button onClick={() => navigate("/admin-dashboard")}>Go to Admin Dashboard</Button>
              </Card.Body>
            </Card>
          </Col>
        )}
        {roles.includes("shelter") && shelterIds.map((id) => (
          <Col md={4} key={id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Shelter Admin</Card.Title>
                <Button onClick={() => navigate("/shelter-dashboard", { state: { shelterId: id } })}>
                  Manage Shelter {id}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Volunteer</Card.Title>
              <Button onClick={() => navigate("/volunteer-dashboard")}>Go to Volunteer Dashboard</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UnifiedDashboard;
