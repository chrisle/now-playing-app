import { ProlinkDj } from '../lib/ProlinkDj';
import Container from 'react-bootstrap/Container';
import ModeTitle from '../components/ModeTitle';
import NowPlaying from '../components/NowPlaying';
import ProLinkDevices from '../components/ProLinkDevices';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Status from '../components/Status';
import WebSocketStatus from '../components/WebSocketStatus';

class ProLinkPage extends React.Component {

  prolink: ProlinkDj;

  constructor(props: any) {
    super(props);
    this.prolink = new ProlinkDj();
  }

  componentDidMount() {
    this.prolink.start();
  }

  componentWillUnmount() {
    this.prolink.network?.disconnect();
  }

  render() {
    return (
      <main id="main" className="flex-grow-1 py-5 pt-md-20 pb-md-30 d-flex align-items-center1">
        <Container className="w-100 pt-20">
          <ModeTitle title="Pro-DJ Link Mode" img="images/prodj-link.png" />
          <div className="fz-18 blue-bell text-capitalize">Connections</div>
          <Row className="row-cols-2 row-cols-sm-5 row-cols-lg-5 mb-15">
            <WebSocketStatus pingEventName="ping" title="Overlay" />
            <ProLinkDevices deviceId={1} />
            <ProLinkDevices deviceId={2} />
            <ProLinkDevices deviceId={3} />
            <ProLinkDevices deviceId={4} />
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

export default ProLinkPage;