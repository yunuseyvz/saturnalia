import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaIceCream, FaHippo, FaBolt } from 'react-icons/fa';

const TutorialModal = ({ show, handleClose }) => {
    return (
        <Modal show={show} onHide={handleClose} centered className='custom-modal'>
            <Modal.Header>
                <Modal.Title>REGOLE</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-left">
                <p><strong>Due tipi di quiz, SINGOLO, DI GRUPPO.</strong></p>
                <p><FaBolt /> <strong>Singolo</strong> - tutti contro tutti, domande a scelta multipla. Si avanza di 1 casella per domanda indovinata, 3 o 5 domande totali.</p>
                <p><FaHippo /> <strong>Di Gruppo</strong> - primo e ultimo giocatore sfidano gli altri 3 (in caso di pareggi il team da 3 sceglie il compagno). Domande aperte, il team che vince la meglio di 3/5 avrà un dado aggiuntivo da 1 a 3.</p>
                <p><strong>SWITCH</strong> - Nel caso il gioco sia troppo veloce il conducente potrà applicare lo SWITCH, che consiste nel cambiamento da vantaggi per aver vinto il quiz, in svantaggi per averlo perso:</p>
                <ul>
                    <li><FaBolt /> <strong>Singolo (SWITCH)</strong> - Chi indovina sceglie chi indietreggiare di 1 casella per domanda.</li>
                    <li><FaHippo /> <strong>Di Gruppo (SWITCH)</strong> - Il team che perde tirerà il dado aggiuntivo che verrà sottratto al tiro principale.</li>
                </ul>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TutorialModal;