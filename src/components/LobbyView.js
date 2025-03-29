import React, { useState } from 'react';
import { Spinner, Button } from 'react-bootstrap';
import {
    FaIceCream, FaHippo, FaBolt, FaRandom,
    FaPlay, FaCrown, FaInfoCircle
} from 'react-icons/fa';
import { AiOutlineDisconnect } from 'react-icons/ai';
import TutorialModal from './TutorialModal';
import Dice from './DiceRoll';

const LobbyView = ({
    isHost,
    G,
    moves,
    category,
    handleCategorySelect,
    selectRandomCategory,
    activePlayers,
    firstPlayer,
    setSelectedGameMode
}) => {
    const [showTutorial, setShowTutorial] = useState(false);

    const handleShowTutorial = () => setShowTutorial(true);
    const handleCloseTutorial = () => setShowTutorial(false);

    return (
        <div className="lobby-container">
            {/* Game Mode Selection */}
            {isHost && !G.gameMode && (
                <div className="game-mode-selection">
                    <div className="game-mode-card"
                        onClick={() => {
                            moves.setGameMode('buzz');
                            setSelectedGameMode('buzz');
                        }}>
                        <FaIceCream className="game-mode-card-icon" />
                        <div className="game-mode-card-title">Buzzin</div>
                        <div className="game-mode-card-description">Just the Buzzer</div>
                    </div>
                    <div className="game-mode-card"
                        onClick={() => {
                            moves.setGameMode('standard');
                            setSelectedGameMode('standard');
                        }}>
                        <FaHippo className="game-mode-card-icon" />
                        <div className="game-mode-card-title">Group</div>
                        <div className="game-mode-card-description">Standard Questions</div>
                    </div>
                    <div className="game-mode-card"
                        onClick={() => {
                            moves.setGameMode('multipleChoice');
                            setSelectedGameMode('multipleChoice');
                        }}>
                        <FaBolt className="game-mode-card-icon" />
                        <div className="game-mode-card-title">Rissa</div>
                        <div className="game-mode-card-description">Multiple-choice</div>
                    </div>
                </div>
            )}

            {/* Category Selection */}
            {isHost && G.gameMode && G.gameMode !== 'buzz' && (
                <div className="category-selection">
                    {G.categories.map((cat) => (
                        <div key={cat}
                            className={`category-card ${category === cat ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect(cat)}>
                            <div className="category-card-title">{cat}</div>
                        </div>
                    ))}
                    <div className="category-card" onClick={selectRandomCategory}>
                        <FaRandom className="category-card-icon" />
                        <div className="category-card-title">Random</div>
                    </div>
                </div>
            )}

            {/* Start Game or Waiting */}
            {isHost && (G.category || G.gameMode === 'buzz') ? (
                <button className="start-game-button"
                    onClick={() => moves.startGame()}>
                    <FaPlay className="start-game-icon" /> Start Game
                </button>
            ) : (
                !isHost && (
                    <div className="waiting-for-host">
                        <p>Waiting for host...</p>
                        <div className="spinner-container">
                            <Spinner animation="grow" role="status" className="slow-spinner">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        </div>
                    </div>
                )
            )}

            {/* Dice Roll */}
            <div className="dice-roll-container">
                <h2 className="dice-roll-title">Dice Roll</h2>
                <div className="dice-results">
                    <div className="dice-container">
                    
                        <Dice faces={6} className="dice1" />
                    </div>
                    <div className="dice-container">
                       
                        <Dice faces={3} className="dice2" />
                    </div>
                </div>
            </div>

            {/* How to Play Button */}
            <div className="how-to-play-container">
                <Button variant="info" onClick={handleShowTutorial}>
                    <FaInfoCircle /> Rules
                </Button>
            </div>

            {/* How to Play Modal */}
            <TutorialModal show={showTutorial} handleClose={handleCloseTutorial} />

            {/* Players List */}
            <div className="queue">
                <p>Players</p>
                <ul>
                    {activePlayers.map(({ id, name, connected }) => (
                        <li key={id} className={id === firstPlayer.id ? 'host-player' : ''}>
                            <div className={`name ${!connected ? 'dim' : ''}`}>
                                {name} {id === firstPlayer.id && <FaCrown className="host-icon" />}
                                {!connected && <AiOutlineDisconnect className="disconnected" />}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LobbyView;