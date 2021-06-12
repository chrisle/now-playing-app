import React from 'react';
import { getTheme, setTheme, getAvailableThemes, themePath } from '../utils/settings';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { shell } from 'electron';

type State = {
  currentTheme: string;
}

class ThemeSelector extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = { currentTheme: getTheme() }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: any) {
    setTheme(event.target.value);
    this.setState({ currentTheme: event.target.value });
  }

  render() {
    const { currentTheme } = this.state;
    const availableThemes = getAvailableThemes().map(t =>
      <option key={t} value={t}>{t}</option>
    );
    return (
      <Form.Group as={ Row } controlId="formTheme">
        <Form.Label column sm="4">
          <strong>Theme</strong>&nbsp;

        </Form.Label>
        <Col sm="5">
          <Form.Control as="select" value={ currentTheme } onChange={ this.handleChange }>
            {availableThemes}
          </Form.Control>
        </Col>
        <Col sm="1">
          <Button size="sm" variant="secondary" onClick={() => { shell.openExternal('http://localhost:9000'); }}>Preview</Button>
        </Col>
        <Col sm="1">
          <Button size="sm" variant="secondary" onClick={() => { shell.showItemInFolder(themePath()); }}>Open</Button>
        </Col>
      </Form.Group>
    )
  }

}

export default ThemeSelector;