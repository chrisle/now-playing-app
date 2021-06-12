import { AppBus } from '../utils/appbus';
import { IcecastServer } from '../lib/IcecastServer';
import Container from 'react-bootstrap/Container';
import ModeTitle from '../components/ModeTitle';
import NowPlaying from '../components/NowPlaying';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Status from '../components/Status';
import WebSocketStatus from '../components/WebSocketStatus';
import Connection from '../components/Connection';


const appBus = AppBus.instance;

type State = {
  isConnected: boolean;
};

class TraktorPage extends React.Component<{}, State> {

  icecastServer: IcecastServer;

  constructor(props: any) {
    super(props);
    this.icecastServer = new IcecastServer();
    this.state = {
      isConnected: false
    }
    this.connected = this.connected.bind(this);
  }

  connected() {
    appBus.eventEmitter.emit('status', 'Connected to Traktor.');
    this.setState({ isConnected: true });
  }

  componentDidMount() {
    appBus.eventEmitter.on('traktor-connected', this.connected);
  }

  componentWillUnmount() {
    appBus.eventEmitter.removeListener('traktor-connected', this.connected);
  }

  render() {
    const isConnected = this.state.isConnected;
    return (
      <main id="main" className="flex-grow-1 py-5 pt-md-20 pb-md-30 d-flex align-items-center1">
        <Container className="w-100 pt-20">
          <ModeTitle title="Traktor DJ Mode" img="images/traktor.png" />
          <div className="fz-18 blue-bell text-capitalize">Connections</div>
          <Row className="row-cols-2 row-cols-sm-5 row-cols-lg-5 mb-15">
            <WebSocketStatus pingEventName="ping" title="Overlay" />
            <Connection
              name="Traktor DJ"
              iconBaseFilename="traktor"
              ext="svg"
              onlineStatus="Connected"
              offlineStatus="Disconnected"
              status={isConnected} />
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

export default TraktorPage;