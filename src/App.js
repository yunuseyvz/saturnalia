import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { get, isNil } from 'lodash';
import myLogo from './logo.svg';

import Lobby from './containers/Lobby';
import Game from './containers/Game';
import './App.css';
import ReactPWAInstallProvider, { useReactPWAInstall } from "react-pwa-install";

function App() {
  const [auth, setAuth] = useState({
    playerID: null,
    credentials: null,
    roomID: null,
  });

  const { pwaInstall, supported, isInstalled } = useReactPWAInstall();

  const handleClick = () => {
    pwaInstall({
      title: "Install Web App",
      logo: myLogo,
      features: (
        <ul>
          <li>Cool feature 1</li>
          <li>Cool feature 2</li>
          <li>Even cooler feature</li>
          <li>Works offline</li>
        </ul>
      ),
      description: "This is a very good app that does a lot of useful stuff. ",
    })
      .then(() => alert("App installed successfully or instructions for install shown"))
      .catch(() => alert("User opted out from installing"));
  };

  return (
    <div className="App">
      <Router>
        {supported() && !isInstalled() && (
          <button type="button" onClick={handleClick}>
            Install App
          </button>
        )}
        <Switch>
          <Route
            path="/:id"
            render={({ location, match }) => {
              const roomID = get(match, 'params.id');
              // redirect if the roomID in auth doesn't match, or no credentials
              return roomID &&
                auth.roomID === roomID &&
                !isNil(auth.credentials) &&
                !isNil(auth.playerID) ? (
                <Game auth={auth} setAuth={setAuth} />
              ) : (
                <Redirect
                  to={{
                    pathname: '/',
                    state: { from: location, roomID },
                  }}
                />
              );
            }}
          />
          <Route path="/">
            <Lobby setAuth={setAuth} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
