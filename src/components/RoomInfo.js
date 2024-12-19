import React from 'react';
import { AiOutlineQrcode } from 'react-icons/ai';
import { FaCrown, FaUser, FaGamepad, FaList, FaCog } from 'react-icons/fa';

const RoomInfo = ({
    gameID,
    toggleQRCode,
    isHost,
    players,
    playerID,
    G,
    ctx,
    moves,
    setSelectedGameMode,
    category
}) => (
    <section>
        <div className="room-code-container">
            <p id="room-title" className="clickable" onClick={toggleQRCode}>
                <strong>Room {gameID}</strong> <AiOutlineQrcode className="qr-icon" />
            </p>
        </div>
        <div className="status-container">
            {isHost ? (
                <p className="host">
                    <FaCrown className="role-icon host-icon" /> Host: {players.find((p) => p.id === playerID)?.name}
                </p>
            ) : (
                <p className="player">
                    <FaUser className="role-icon player-icon" /> Player: {players.find((p) => p.id === playerID)?.name}
                </p>
            )}
            <p className="game-mode">
                <FaGamepad className="game-mode-icon" /> Game Mode:
                <span style={{ marginRight: '5px' }}></span>
                {G.gameMode === 'multipleChoice' ? 'Rissa' : G.gameMode === 'standard' ? 'Group' : G.gameMode === 'buzz' ? 'Buzzin' : <span className="loading-dots" style={{ marginLeft: '5px' }}></span>}
                {isHost && G.gameMode && ctx.phase === "lobby" ? (
                    <FaCog
                        className="change-game-mode-icon"
                        onClick={() => {
                            moves.setGameMode(null);
                            setSelectedGameMode(null);
                        }}
                        style={{ cursor: 'pointer', marginLeft: '10px' }}
                    />
                ) : null}
            </p>
            {G.gameMode !== 'buzz' && (
                <p className="category">
                    <FaList className="category-icon" /> Category:
                    <span style={{ marginRight: '5px' }}></span>
                    {category ? category : <span className="loading-dots" style={{ marginLeft: '5px' }}></span>}
                </p>
            )}
        </div>
    </section>
);

export default RoomInfo;