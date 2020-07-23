import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import React from "react";

const TopNavbar = () => {
  return (
    <Navbar fixed="top" bg="primary" variant="dark" expand="lg">
      <Navbar.Brand href="#">Arb Community Points</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link target="_blank" href="https://qqq.com">
            Block Explorer
          </Nav.Link>
          <Nav.Link target="_blank" href="https://qqq.com">
            Arbiswap
          </Nav.Link>
          <Nav.Link href="#about">About</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default TopNavbar;
