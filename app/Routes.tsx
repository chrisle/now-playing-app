/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ProLinkPage from './containers/ProLinkPage';
import RekordBoxPage from './containers/RekordBoxPage';
import TraktorPage from './containers/TraktorPage';
import SeratoPage from './containers/SeratoPage';
// import StagelinQPage from './containers/StagelinQPage';
import { getStartScreen } from './utils/settings';


export default function Routes() {
  const startup = getStartScreen();
  console.log(`Default mode: ${startup}`);
  let rootPath: any = HomePage;
  if (startup === 'Pro-DJ Link') rootPath = ProLinkPage;
  if (startup === 'Rekordbox') rootPath = RekordBoxPage;
  if (startup === 'Traktor') rootPath = TraktorPage;
  if (startup === 'Serato DJ Pro') rootPath = SeratoPage;

  return (
    <App>
      <Switch>
        <Route path="/prolink" component={ProLinkPage} />
        <Route path="/rekordbox" component={RekordBoxPage} />
        <Route path="/traktor" component={TraktorPage} />
        <Route path="/serato" component={SeratoPage} />
        {/* <Route path="/stagelinq" component={StagelinQPage} /> */}
        <Route path="/" component={rootPath} />
      </Switch>
    </App>
  );
}
