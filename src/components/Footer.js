import React from 'react';
import { Container } from 'react-bootstrap';

export function FooterSimple() {
  return (
    <div id="footer-simple">
      Built on{' '}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/yunuseyvz/saturnalia"
      >
        open source
      </a>
      {' '}| Made by{' '}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://yuemya.de"
      >
        me
      </a>
    </div>
  );
}

/**
 * Footer component
 * @param {bool} mobileOnly - only display on mobile devices, <768 px
 */
export default function Footer({ mobileOnly = false }) {
  return (
    <footer className={mobileOnly ? 'd-block d-md-none' : null}>
      <Container>
        <div>
          Built on{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/yunuseyvz/saturnalia"
          >
            open source
          </a>
          {' '}| Made by{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://yuemya.de"
          >
            me
          </a>
        </div>
      </Container>
    </footer>
  );
}