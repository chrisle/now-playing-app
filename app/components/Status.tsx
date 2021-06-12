import React from 'react';
import { TrackData } from '../utils/trackdata';
// import { Link } from 'react-router-dom';
// import { shell } from 'electron';

import { AppBus } from '../utils/appbus';
const appBus = AppBus.instance;

type State = {
  msgs: string[];
}

class Status extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      msgs: ['Waiting to connect'],
    }
  }

  componentDidMount() {
    appBus.eventEmitter.on('status', this.addMsg.bind(this));
    appBus.eventEmitter.on('track-update', this.trackUpdate.bind(this));
  }

  componentWillUnmount() {
    appBus.eventEmitter.removeListener('status', this.addMsg.bind(this));
    appBus.eventEmitter.removeListener('track-update', this.trackUpdate.bind(this));
  }

  trackUpdate(track: TrackData) {
    // Thank users for playing one of my songs. :)
    if (/triode/i.test(track.artist!) || /triode/i.test(track.title!)) {
      this.addMsg('Thanks for supporting a Triode song :)');
    }
  }

  addMsg(msg: string) {
    const msgs = this.state.msgs;
    if (msgs.length === 1) msgs.shift();
    console.log(`[STATUS] ${msg}`);
    msgs.push(msg);

    const getWsError = localStorage.getItem('ws-error');
    if (getWsError) {
      this.setState({ msgs: [getWsError] });
    } else {
      this.setState({ msgs: msgs });
    }
  }

  render() {
    const status = this.state.msgs.join('\n');
    return (
      <>
        <li className="mb-30 pb-4">
          <div className="text-capitalize blue-bell mb-4">Status</div>
          <div className="action position-relative text-decoration-none d-inline-block align-top">
            <span className="icon position-absolute">
              <img src="images/info.svg" alt="play" width="16" height="16" />
            </span>
            { status }
          </div>
        </li>
      </>
    )
  }

}

export default Status;
