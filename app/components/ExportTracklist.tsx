import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import {
  getAutoPlaylist,
  setAutoPlaylist,
  getTracklistDir,
  setTracklistDir
} from '../utils/settings';
import { remote } from 'electron';

type State = {
  checked: boolean;
  tracklistDir: string;
}

class ExportTracklist extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      checked: getAutoPlaylist(),
      tracklistDir: getTracklistDir()
    };
    this.onChange = this.onChange.bind(this);
    this.onChangeTracklistDir = this.onChangeTracklistDir.bind(this);
  }

  onChange(event: any) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ checked: value });
    setAutoPlaylist(value);
  }

  onChangeTracklistDir() {
    console.log('changing save dir');
    remote.dialog.showOpenDialog({
      title: 'Where',
      defaultPath: this.state.tracklistDir,
      buttonLabel: 'Save Tracklists Here',
      properties: ['openDirectory', 'createDirectory']
    }).then(result => {
      if (result.filePaths && result.filePaths.length) {
        const path = result.filePaths[0];
        this.setState({ tracklistDir: path });
        setTracklistDir(path);
      }
    }).catch(err => {
      console.error(err);
    })
  }

  render() {
    const { checked, tracklistDir } = this.state;
    return (
      <>
        <Form.Group as={ Row } controlId="formTracklist">
          <Form.Label column sm="4"><strong>Save Tracklist</strong></Form.Label>
          <Col sm="1">
            <Form.Check
              type="checkbox"
              checked={ checked }
              onChange={ this.onChange }
              />
          </Col>
          <Col sm="5">
            <Form.Text id="formTracklistInline" muted>
              Saves trackists to: { tracklistDir }
            </Form.Text>
          </Col>
          <Col sm="1">
            <Button size="sm" variant="secondary" onClick={this.onChangeTracklistDir}>Change</Button>
          </Col>
        </Form.Group>
      </>
    );
    // TODO: Add another row here for the directory to which to save the tracklist
  }
}

export default ExportTracklist;