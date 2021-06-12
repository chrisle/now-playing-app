import React from 'react';
import { getHideNotes, setHideNotes } from '../utils/settings';
import { Form, Row, Col } from 'react-bootstrap';


type State = {
  hideIds: boolean;
}

class HideNotes extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = { hideIds: getHideNotes() };
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: any) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ hideIds: value });
    setHideNotes(value);
  }

  render() {
    const checked = this.state.hideIds;
    return (
      <Form.Group as={ Row } controlId="formHideNotes">
        <Form.Label column sm="4"><strong>Hide Notes</strong></Form.Label>
        <Col sm="1">
          <Form.Check
            type="checkbox"
            checked={ checked }
            onChange={ this.onChange } />
        </Col>
        <Col>
          <Form.Text id="formHideNotesInline" muted>
            Hide notes that are in square brackets from track title. <br/>
            Eg: Song (Extended Mix) [My notes]
          </Form.Text>
        </Col>
      </Form.Group>
    )
  }
}

export default HideNotes;