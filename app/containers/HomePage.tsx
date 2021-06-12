import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

function ModeSelection(props: any) {
  return (
    <div className="js-anim01 col-sm-3 d-flex flex-column mb-5 mb-md-25 pt-md-4">
      <Link to={props.to} className="box h-100 text-center text-capitalize d-flex flex-column mx-md-4 text-decoration-none position-relative">
        <div className="d-flex align-items-center icon-hold w-100 justify-content-center pt-3 px-3 px-md-30 pt-md-50">
          <img src={props.img} width="228" height="30" />
        </div>
        <div className="d-block p-3 py-md-30">{props.name}</div>
      </Link>
    </div>
  )
}

function Logo() {
  const logo = require('../custom.json').logo;
  if (logo) {
    return <img className="custom-logo" src={logo} height="100" />
  } else {
    return <>Choose Which Mode To Use</>
  }
}

export default function HomePage() {
  return (
    <main id="main" className="flex-grow-1 py-5 pt-md-50 pb-md-30 d-flex align-items-center">
      <Container className="w-100 pt-5 pt-sm-0">
        <h1 className="text-center mb-5 mb-md-50 display-1 font-weight-bold">
          <Logo />
        </h1>
        <Row>
          <ModeSelection to="/prolink" name="Pro-DJ Link" img="images/prodj-link.png" />
          <ModeSelection to="/rekordbox" name="Rekordbox" img="images/rekordbox.png" />
          <ModeSelection to="/traktor" name="Traktor DJ" img="images/traktor.png" />
          <ModeSelection to="/serato" name="Serato DJ Pro" img="images/serato-3.png" />
        </Row>
      </Container>
    </main>
  );
}
