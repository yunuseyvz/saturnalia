import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import QRCode from "react-qr-code";
import '../App.css';

const emojis = ['😩', '😂', '😎', '😡', '👍', '🤨', '😦', '🤡' , '🐂', '🐻'];

const Overlays = ({
    showQRCode,
    toggleQRCode,
    gameID,
    isEmojiBubbleOpen,
    toggleEmojiBubble,
    moves
}) => {
    const [customEmoji, setCustomEmoji] = useState('');

    return (
        <>
            <Modal show={showQRCode} onHide={toggleQRCode} centered className="custom-modal">
                <Modal.Header className="justify-content-center">
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
                    <div className="emoji-selection" onClick={(e) => e.stopPropagation()}>
                        {emojis.map((emoji, idx) => (
                            <button
                                key={idx}
                                className="emoji-button"
                                onClick={() => {
                                    moves.addEmojiReaction(emoji);
                                    toggleEmojiBubble();
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                moves.addEmojiReaction(customEmoji);
                                setCustomEmoji('');
                                toggleEmojiBubble();
                            }}
                            className="custom-emoji-form"
                        >
                            <input
                                type="text"
                                placeholder="Custom Message"
                                value={customEmoji}
                                onChange={(e) => setCustomEmoji(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="custom-emoji-input"
                            />
                            <button type="submit" className="custom-emoji-button">
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default Overlays;