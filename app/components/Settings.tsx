import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import ExportTracklist from './ExportTracklist';
import ForceOnAir from './ForceOnAir';
import HideIds from './HideIds';
import HideNotes from './HideNotes';
import StartScreenSelector from './StartScreenSelector';
import ThemeSelector from './ThemeSelector';
import UpdateDelay from './UpdateDelay';

type State = {
  show: boolean;
}


class Settings extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = { show: false };
  }

  render() {
    const show = this.state.show;
    return (
      <>
        <svg
          onClick={ () => this.setState({ show: true }) }
          data-toggle="modal"
          data-target="#modal"
          style={{
            cursor: 'pointer'
          }}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24" >
          <g className="nc-icon-wrapper" fill="#111111" >
            <path d="M20.872,13.453A9.033,9.033,0,0,0,21,12a9.033,9.033,0,0,0-.128-1.453l2.1-2.029A1,1,0,0,0,23.143,7.3l-1.5-2.6A1.009,1.009,0,0,0,20.5,4.239l-2.8.8a9.017,9.017,0,0,0-2.527-1.451L14.47.758A1,1,0,0,0,13.5,0h-3a1,1,0,0,0-.97.758l-.707,2.83A9.017,9.017,0,0,0,6.3,5.039l-2.8-.8A1.01,1.01,0,0,0,2.357,4.7L.857,7.3a1,1,0,0,0,.171,1.219l2.1,2.029A9.033,9.033,0,0,0,3,12a9.033,9.033,0,0,0,.128,1.453l-2.1,2.029A1,1,0,0,0,.857,16.7l1.5,2.6a1,1,0,0,0,.867.5,1.048,1.048,0,0,0,.275-.038l2.8-.8a9.017,9.017,0,0,0,2.527,1.451l.707,2.83A1,1,0,0,0,10.5,24h3a1,1,0,0,0,.97-.758l.707-2.83A9.017,9.017,0,0,0,17.7,18.961l2.8.8a1.048,1.048,0,0,0,.275.038,1,1,0,0,0,.867-.5l1.5-2.6a1,1,0,0,0-.171-1.219ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" fill="#007bff"/>
          </g>
        </svg>
        <Modal show={ show } size="lg" centered>
          <Modal.Header>
            <h2>Settings</h2>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <StartScreenSelector />
              <ThemeSelector />
              <UpdateDelay />
              <ForceOnAir />
              <HideIds />
              <HideNotes />
              <ExportTracklist />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={ () => { this.setState({ show: false }) } }>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default Settings;