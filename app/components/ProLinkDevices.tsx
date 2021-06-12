import React from 'react';
import { Device } from 'prolink-connect/lib/types';

import Connection from './Connection';


import { AppBus } from '../utils/appbus';
const appBus = AppBus.instance;

type State = {
  connected: boolean;
  name: string;
  model: string;
}

type Props = {
  deviceId: number;
}

class ProLinkDevices extends React.Component<Props, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      connected: false,
      name: `Player ${props.deviceId}`,
      model: ''
    };
  }

  componentDidMount() {
    appBus.eventEmitter.on('new-device', this.addDevice.bind(this));
  }

  componentWillUnmount() {
    appBus.eventEmitter.removeListener('new-device', this.addDevice.bind(this));
  }

  addDevice(device: Device) {
    if (device.id === this.props.deviceId) {
      this.setState({
        connected: true,
        model: device.name
      });
    }
  }

  render() {
    const { connected, name, model } = this.state;
    return (
      <>
        <Connection
          name={name}
          iconBaseFilename="cdj"
          ext="svg"
          onlineStatus={model}
          offlineStatus="Offline"
          status={connected} />
      </>
    )
  }

}

export default ProLinkDevices;
