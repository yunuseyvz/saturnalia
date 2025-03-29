import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaIceCream, FaHippo, FaBolt } from 'react-icons/fa';

const TutorialModal = ({ show, handleClose }) => {
    return (
        <Modal show={show} onHide={handleClose} centered className='custom-modal'>
            <Modal.Header>
                <Modal.Title>Rules</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-left">
                <p>
                    <FaBolt /> <strong>Single</strong> – Everyone against everyone, multiple-choice questions. Players advance 1 space for each correct answer, with a total of 3 or 5 questions.
                </p>
                <p>
                    <FaHippo /> <strong>Group</strong> – The first and last player challenge the other three (in case of a tie, the team of three selects a teammate). Open-ended questions, and the team that wins the best of 3/5 rounds gets an additional die roll (1 to 3).
                </p>

                <p><strong>SWITCH</strong></p>
                <p>
                    If the game progresses too quickly, the host can apply the SWITCH, which changes quiz rewards from advantages for winning to penalties for losing:
                </p>
                <ul>
                    <li>
                        <FaBolt /> <strong>Single (SWITCH)</strong> – The player who answers correctly chooses someone to move back 1 space per question.
                    </li>
                    <li>
                        <FaHippo /> <strong>Group (SWITCH)</strong> – The losing team rolls the additional die, and the result is subtracted from their main roll.
                    </li>
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