import { AppBus } from '../utils/appbus';
import { TrackData } from '../utils/trackdata';
import React from 'react';


const appBus = AppBus.instance;

type State = {
  title: string;
  artist: string;
}

class NowPlaying extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      title: 'No title Loaded',
      artist: 'No artist loaded'
    }
  }

  componentDidMount() {
    appBus.eventEmitter.on('track-update', this.updateTrack.bind(this));
  }

  componentWillUnmount() {
    appBus.eventEmitter.removeListener('track-update', this.updateTrack.bind(this));
  }

  updateTrack(track: TrackData) {
    console.log('Recieved track update', track);
    this.setState({
      title: (track.title) ? track.title : '',
      artist: (track.artist) ? track.artist : ''
    });
  }

  render() {
    const { title, artist } = this.state;
    return (
      <>
        <li className="mb-30 pb-4">
          <div className="text-capitalize blue-bell mb-4">now playing</div>
          <div className="action position-relative text-decoration-none d-inline-block align-top">
            <span className="icon position-absolute">
              <img src="images/play.svg" alt="play" width="13" height="16" />
            </span>
            { title }
            <span className="d-block blue-bell">{ artist }</span>
          </div>
        </li>
      </>
    )
  }

}

export default NowPlaying;