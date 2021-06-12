import React from 'react';
import { AppBus } from '../utils/appbus';
import Connection from './Connection';

const appBus = AppBus.instance;

type State = {
  connected: boolean;
}

type Props = {
  pingEventName: string;
  title: string;
}

class WebSocketStatus extends React.Component<Props, State> {

  constructor(props: any) {
    super(props);
    this.state = { connected: false };
  }

  componentDidMount() {
    appBus.eventEmitter.on(this.props.pingEventName, this.ping.bind(this));
  }

  componentWillUnmount() {
    appBus.eventEmitter.removeListener(this.props.pingEventName, this.ping.bind(this));
  }

  ping() {
    this.setState({ connected: true });
  }

  render() {
    const { connected } = this.state;
    const { title } = this.props;
    return (
      <>
        <Connection
          name={ title }
          iconBaseFilename="obs"
          ext="svg"
          onlineStatus="Online"
          offlineStatus="Refresh needed"
          status={ connected } />
      </>
    )
  }

}

export default WebSocketStatus;