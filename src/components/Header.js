import React from 'react';
import { Navbar } from 'react-bootstrap';
import { isNil } from 'lodash';
import { useHistory } from 'react-router';
import { leaveRoom } from '../lib/endpoints';

function Logo({ size = 30, color = '#2eb2ff' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        style={{
          fill: 'none',
          stroke: color,
          strokeWidth: 10,
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit: 10,
          strokeOpacity: 1,
        }}
        transform="matrix(.1 0 0 -.1 0 12)"
        d="M30 90h40m-20 20V60c0 11.055 8.945 20 20 20s20-8.945 20-20c0-5.313-2.11-10.39-5.86-14.14C75.079 36.796 70 22.812 70 10"
      />
    </svg>
  );
}

export default function Header({
  auth = {},
  clearAuth,
  sound = null,
  setSound,
}) {
  const history = useHistory();

  // leave current game
  async function leave() {
    try {
      await leaveRoom(auth.roomID, auth.playerID, auth.credentials);
      clearAuth();
      history.push('/');
    } catch (error) {
      console.log('leave error', error);
      clearAuth();
      history.push('/');
    }
  }

  return (
    <header>
      <Navbar>
        <Navbar.Brand>
          <Logo /> Saturnalia
        </Navbar.Brand>
        <div className="nav-buttons">
          {!isNil(sound) ? (
            <button className="text-button" onClick={() => setSound()}>
              {sound ? 'Turn off sound' : 'Turn on sound'}
            </button>
          ) : null}
          {clearAuth ? (
            <button className="text-button" onClick={() => leave()}>
              Leave game
            </button>
          ) : null}
        </div>
      </Navbar>
    </header>
  );
}
