import React from 'react';
import { getStartScreen, setStartScreen } from '../utils/settings';
import { Form, Row, Col } from 'react-bootstrap';

type State = {
  startScreen: string;
}

const SCREENS = [
  'None',
  'Pro-DJ Link',
  'Rekordbox',
  'Traktor',
  'Serato DJ Pro'
]

class StartScreenSelector extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = { startScreen: getStartScreen() }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: any) {
    setStartScreen(event.target.value);
    this.setState({ startScreen: event.target.value });
  }

  render() {
    const { startScreen } = this.state;
    const availableScreens = SCREENS.map(t =>
      <option key={t} value={t}>{t}</option>
    );
    return (
      <Form.Group as={ Row } controlId="formTheme">
        <Form.Label column sm="4">
          <strong>Default mode</strong>&nbsp;
        </Form.Label>
        <Col sm="6">
          <Form.Control as="select" value={ startScreen } onChange={ this.handleChange }>
            { availableScreens }
          </Form.Control>
        </Col>
      </Form.Group>
    )
  }

}

export default StartScreenSelector;