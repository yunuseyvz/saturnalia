import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { get, isNil } from 'lodash';

import Lobby from './containers/Lobby';
import Game from './containers/Game';
import './App.css';

function App() {
  const [auth, setAuth] = useState({
    playerID: null,
    credentials: null,
    roomID: null,
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });
  }, []);

  const handleInstallClick = () => {
    setShowInstallButton(false);
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <div className="App">
      <Router>
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
      {showInstallButton && (
        <button onClick={handleInstallClick} className="install-button">
          Install App
        </button>
      )}
    </div>
  );
}

export default App;