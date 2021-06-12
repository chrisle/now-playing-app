import React from 'react';
import { getForceOnAir, setForceOnAir } from '../utils/settings';
import { Form, Row, Col } from 'react-bootstrap';


type State = {
  forceOnAir: boolean;
}

class ForceOnAir extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = { forceOnAir: getForceOnAir() };
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: any) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ forceOnAir: value });
    setForceOnAir(value);
  }

  render() {
    const checked = this.state.forceOnAir;
    const hide = { display: 'none' };
    return (
      <div style={hide}>
        <Form.Group as={ Row } controlId="formForceOnAir">
          <Form.Label column sm="4"><strong>Force On-Air Mode</strong></Form.Label>
          <Col sm="1">
            <Form.Check
              type="checkbox"
              checked={ checked }
              onChange={ this.onChange } />
          </Col>
          <Col>
            <Form.Text id="formForceOnAirInline" muted>
              Force "on air" mode for non-Nexus Pioneer gear.
            </Form.Text>
          </Col>
        </Form.Group>
      </div>
    )
  }
}

export default ForceOnAir;
