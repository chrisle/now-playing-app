import React from 'react';
import { getHideIds, setHideIds } from '../utils/settings';
import { Form, Row, Col } from 'react-bootstrap';


type State = {
  hideIds: boolean;
}

class HideIds extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = { hideIds: getHideIds() };
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: any) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ hideIds: value });
    setHideIds(value);
  }

  render() {
    const checked = this.state.hideIds;
    return (
      <Form.Group as={ Row } controlId="formHideIds">
        <Form.Label column sm="4"><strong>Hide IDs</strong></Form.Label>
        <Col sm="1">
          <Form.Check
            type="checkbox"
            checked={ checked }
            onChange={ this.onChange } />
        </Col>
        <Col>
          <Form.Text id="formTracklistInline" muted>
            Hide IDs from from being displayed. <br/>
            Note: To hide a track add [ID] to the track's title.
          </Form.Text>
        </Col>
      </Form.Group>
    )
  }
}

export default HideIds;