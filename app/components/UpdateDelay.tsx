import React from 'react';
import { getDelay, setDelay } from '../utils/settings';
import { Form, Row, Col } from 'react-bootstrap';


type State = {
  delay: string;
};


class UpdateDelay extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    let delay = getDelay();
    this.state = { delay: delay }
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: any) {
    const delay = event.target.value;
    if (parseInt(delay) < 0) return;
    this.setState({ delay: delay });
    setDelay(delay);
  }

  render() {
    const delay = this.state.delay;
    return (
      <Form.Group as={ Row } controlId="formDelay">
        <Form.Label column sm="4"><strong>Delay</strong></Form.Label>
        <Col sm="2">
          <Form.Control value={ delay } type="number" onChange={ this.onChange } />
        </Col>
        <Col sm="6">
          <Form.Text id="formDelayHelp" muted>
            Delay tracks being updated by number of seconds. (Must be greater than 0)
          </Form.Text>
        </Col>
      </Form.Group>
    );
  }
}

export default UpdateDelay;