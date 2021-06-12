import { SeratoDj } from '../lib/SeratoDj';
import Container from 'react-bootstrap/Container';
import ModeTitle from '../components/ModeTitle';
import NowPlaying from '../components/NowPlaying';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Status from '../components/Status';
import WebSocketStatus from '../components/WebSocketStatus';


class SeratoPage extends React.Component {

  serato: SeratoDj;

  constructor(props: any) {
    super(props);
    this.serato = new SeratoDj();
  }

  componentDidMount() {
    this.serato.watch();
  }

  componentWillUnmount() {
    this.serato.unwatch();
  }

  render() {
    return (
      <main id="main" className="flex-grow-1 py-5 pt-md-20 pb-md-30 d-flex align-items-center1">
        <Container className="w-100 pt-20">
          <ModeTitle title="Serato Mode" img="images/serato-3.png" />
          <div className="fz-18 blue-bell text-capitalize">Connections</div>
          <Row className="row-cols-2 row-cols-sm-5 row-cols-lg-5 mb-15">
            <WebSocketStatus pingEventName="ping" title="Overlay" />
          </Row>
          <ul className="list-unstyled fz-18">
            <NowPlaying />
            <Status />
          </ul>
        </Container>
      </main>
    );
  }

}

export default SeratoPage;