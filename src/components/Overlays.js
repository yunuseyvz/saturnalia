import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import QRCode from "react-qr-code";

const emojis = ['😂', '😍', '😎', '😡', '👍', '🤨', '😦'];

const Overlays = ({
    showQRCode,
    toggleQRCode,
    gameID,
    isEmojiBubbleOpen,
    toggleEmojiBubble,
    moves
}) => (
    <>
        <Modal show={showQRCode} onHide={toggleQRCode} centered className="custom-modal">
            <Modal.Header closeButton className="justify-content-center">
                <Modal.Title className="w-100 text-center">
                    Room Code: {gameID}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                    <h4 className="mb-0 mr-2">Scan QR Code to join</h4>
                </div>
                <QRCode value={`saturnalia.onrender.com/${gameID}`} />
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button variant="secondary" onClick={toggleQRCode} className="btn btn-primary">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>

        <div className={`emoji-bubble ${isEmojiBubbleOpen ? 'open' : ''}`} onClick={toggleEmojiBubble}>
            <span
                className="emoji-bubble-icon"
                role="img"
                aria-label="Smiling emoji bubble icon"
            >
                😊
            </span>
            {isEmojiBubbleOpen && (
                <div className="emoji-selection">
                    {emojis.map((emoji, idx) => (
                        <button
                            key={idx}
                            className="emoji-button"
                            onClick={() => moves.addEmojiReaction(emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    </>
);

export default Overlays;