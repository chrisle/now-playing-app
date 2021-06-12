import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeWebServer } from '../lib/ThemeWebServer';
import { WebSocketServer } from '../lib/WebSocketServer';
import { OoTracklists } from '../lib/OoTracklists';
import { shell } from 'electron';
import { migrate } from '../utils/migrate';

type Props = {
  children: ReactNode;
};

type State = {
  currentVer: string;
  latestVer: string;
}

class App extends React.Component<Props, State> {

  webServer: ThemeWebServer;
  obsWs: WebSocketServer;
  ooTracklists: OoTracklists;

  constructor(props: any) {
    super(props);
    this.webServer = ThemeWebServer.instance;
    this.obsWs = WebSocketServer.instance;
    this.ooTracklists = OoTracklists.instance;
    const v = require('../package.json').version;

    this.state = {
      currentVer: v,
      latestVer: v
    };

    migrate();
  }

  openTriode() {
    shell.openExternal('https://linktr.ee/triodeofficial');
  }

  openTip() {
    shell.openExternal('https://streamelements.com/triodeofficial/tip');
  }

  openUpdate() {
    shell.openExternal('https://nowplayingapp.com');
  }

  componentDidMount() {
    this.getLatestVersion();
  }

  getLatestVersion() {
    (async () => {
      try {
        const headers = new Headers();
        headers.append('pragma', 'no-cache');
        headers.append('cache-control', 'no-cache');

        console.log('[App] Checking latest version ...');
        const response = await fetch('https://nowplayingapp.com/ver.json', {
          method: 'GET',
          headers: headers
        });

        const data = JSON.parse(await response.text());
        const version = data['version'];
        console.log(`[App] Latest version: ${version}`);
        this.setState({ latestVer: version });
      } catch(e) {
        console.log('[App] Could not get latest version');
      }
    })();
  }

  isNewVersionAvailable() {
    if (this.state.currentVer.replace(/-.*/, '') < this.state.latestVer) {
      return <>
        &nbsp;|&nbsp;(Update <Link to="#" onClick={this.openUpdate}>v{this.state.latestVer}</Link> available)
      </>
    }
    return <>
      &nbsp;|&nbsp;<Link to="#" onClick={this.openTip}>(Donate to support development)</Link>
    </>;
  }

  render() {
    const { children } = this.props;
    const version = this.state.currentVer;
    const custom = require('../custom.json').custom;

    let title = `Now Playing v${version}`;
    if (custom) title += ` (Custom build: ${custom})`;
    const updateAvailable = this.isNewVersionAvailable();

    return (
      <>
        <div id="wrapper" className="w-100 overflow-hidden position-relative d-flex">
          <div className="d-flex flex-column w-100 min-vh-100">
            {children}
            <footer id="footer" className="text-center text-secondary fz-13">
              <div className="container">
                {title} by <Link to="#" onClick={this.openTriode}>TRIODE</Link>
                 {updateAvailable}
              </div>
            </footer>
          </div>
        </div>
      </>
    );
  }
}

export default App;