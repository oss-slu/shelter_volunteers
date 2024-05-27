import { Card, Col, ListGroup, Row } from "react-bootstrap";
import Image from "react-bootstrap/Image";

function About() {
  return (
    <>
      <Card>
        <Card.Header>About this application</Card.Header>
        <Card.Body>
          <Card.Text style={{ textAlign: "justify" }}>
            Homeless shelters rely on volunteers' help. When inclement weather strikes, homeless
            shelters get filled with people that need a place to stay, and volunteers' help becomes
            even more important. There are many people like you who are willing to volunteer, but
            knowing which shelter lacks help is a challenge. This application simplifies the process
            of scheduling work shifts for volunteers, and to give homeless shelters visibility into
            their upcoming staffing. The application allows volunteers to select shelters and times
            when they want to work, see which shelters (and which times) urgently need help, and
            cancel/reschedule their shifts. The application will also allow shelter staff to see who
            is scheduled to help at their shelter on different dates and different times, and issue
            a 'call for help' when help is needed urgently.
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>
            <Row>
              <Col xs={2} md={2} order={1} className="d-flex align-items-center">
                <Image src="gethelplogoorig.png" fluid rounded />
              </Col>
              <Col xs={10} md={10} order={2}>
                We use <Card.Link href="https://gethelp.com/">GetHelp</Card.Link> API to get shelter
                information and volunteer opportunities.
              </Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col xs={2} md={2} order={1} className="d-flex align-items-center">
                <Image src="githublogo.png" fluid />
              </Col>
              <Col xs={10} md={10} order={2}>
                This website is an open-source project. You can contribute to our
                <Card.Link href="https://github.com/oss-slu/shelter_volunteers">GitHub</Card.Link>
                repository to make this application better.
              </Col>
            </Row>
          </ListGroup.Item>
        </ListGroup>
      </Card>
      <div></div>
    </>
  );
}

export default About;
