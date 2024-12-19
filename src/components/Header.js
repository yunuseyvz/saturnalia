import React from 'react';
import { Navbar } from 'react-bootstrap';
import { isNil } from 'lodash';
import { useHistory } from 'react-router';
import { leaveRoom } from '../lib/endpoints';
import { FaVolumeUp, FaVolumeMute, FaSignOutAlt } from 'react-icons/fa'; 
import '../App.css';

function Logo({ size = 30, color = '#2eb2ff' }) {
  const containerSize = size * 1.5; 
  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '15%', // Rounded corners
        background: 'linear-gradient(135deg, #f0f0f0, #f0f0f0)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1)', 
        overflow: 'hidden', 
        marginRight: '15px',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block', 
          transform: 'translate(-60%, -75%)', 
          position: 'relative',
          top: '50%',
          left: '50%',
        }}
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
    </div>
  );
}

export default function Header({
  auth = {},
  clearAuth,
  sound = null,
  setSound,
}) {
  const history = useHistory();

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
            <div
              className="icon-button"
              onClick={() => setSound()}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'white' }}
            >
              {sound ? <FaVolumeUp style={{ color: '#4287f5' }} /> : <FaVolumeMute style={{ color: '#4287f5' }} />}
            </div>
          ) : null}
          {clearAuth ? (
            <div
              className="icon-button"
              onClick={() => leave()}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'white' }}
            >
              <FaSignOutAlt style={{ color: '#f57171' }} />
            </div>
          ) : null}
        </div>
      </Navbar>
    </header>
  );
}