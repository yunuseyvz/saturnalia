import React from 'react';
import { Carousel } from 'react-bootstrap';
import { AiOutlineDisconnect, AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';
import { FaUnlock, FaLock, FaRedo, FaStop, FaCrown } from 'react-icons/fa';

const GameView = ({
    G,
    isHost,
    buzzed,
    buzzButton,
    attemptBuzz,
    currentQuestionIndex,
    totalQuestions,
    category,
    questionBoxRef,
    moves,
    isConnected,
    buzzedPlayers,
    activePlayers,
    firstPlayer,
    queue,
    timeDisplay
}) => (
    <>
        {/* Buzzer or Question Display */}
        {G.gameMode === 'buzz' ? (
            <div id="buzzer" style={{ margin: '20px 0' }}>
                <button
                    ref={buzzButton}
                    disabled={buzzed || G.locked}
                    onClick={() => !buzzed && !G.locked && attemptBuzz()}
                >
                    {G.locked ? 'Locked' : buzzed ? 'Buzzed' : 'Buzz'}
                </button>
            </div>
        ) : (
            <>
                <Carousel activeIndex={currentQuestionIndex} controls={false} indicators={false}>
                    {G.questions.filter(q => q.category === category).map((q, index) => (
                        <Carousel.Item key={index}>
                            <div className="question-box" ref={questionBoxRef}>
                                <p className="question">{q.question}</p>
                            </div>
                            {!q.options && isHost && (
                                <div className="answer-box">
                                    <p className="answer">{q.answer}</p>
                                </div>
                            )}
                            {q.options && (
                                <div className="options-box">
                                    {q.options.map((option, idx) => (
                                        <p key={idx} className={`option ${isHost && option === q.answer ? 'correct-answer' : ''}`}>
                                            {option}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </Carousel.Item>
                    ))}
                </Carousel>
                {!isHost && (
                    <div id="buzzer" style={{ margin: '20px 0' }}>
                        <button
                            ref={buzzButton}
                            disabled={buzzed || G.locked}
                            onClick={() => !buzzed && !G.locked && attemptBuzz()}
                        >
                            {G.locked ? 'Locked' : buzzed ? 'Buzzed' : 'Buzz'}
                        </button>
                    </div>
                )}
            </>
        )}

        {/* Question Counter & Navigation */}
        {G.gameMode !== 'buzz' && (
            <div className="question-counter-container">
                <p className="question-counter">Question {currentQuestionIndex + 1}/{totalQuestions}</p>
                {isHost && (
                    <div className="navigation-buttons-container">
                        <button
                            className="previous-question-button"
                            onClick={() => moves.previousQuestion()}
                            disabled={currentQuestionIndex <= 0}
                        >
                            <AiOutlineArrowLeft size={24} />
                        </button>
                        <button
                            className="next-question-button"
                            onClick={() => moves.nextQuestion()}
                            disabled={currentQuestionIndex >= totalQuestions - 1}
                        >
                            <AiOutlineArrowRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Connection Status & Host Controls */}
        {!isConnected && <p className="warning">Disconnected - attempting to reconnect...</p>}
        {isHost && (
            <div className="settings" style={{ margin: '20px 0' }}>
                <div className="buzzer-controls">
                    <div className="button-container">
                        <button className="text-button" onClick={() => moves.toggleLock()}>
                            {G.locked ? <FaUnlock /> : <FaLock />} {G.locked ? 'Unlock buzzers' : 'Lock buzzers'}
                        </button>
                    </div>
                    <div className="button-container">
                        <button className="text-button" onClick={() => moves.resetBuzzers()}>
                            <FaRedo /> Reset buzzers
                        </button>
                    </div>
                </div>
                <div className="button-container">
                    <button onClick={() => moves.stopGame()}>
                        <FaStop /> Stop Game
                    </button>
                </div>
                <div className="divider" />
            </div>
        )}

        {/* Player Lists */}
        <div className="queue">
            <p>Players Buzzed</p>
            <ul>
                {buzzedPlayers.map(({ id, name, timestamp, connected }, i) => (
                    <li key={id} className={isHost ? 'resettable' : null}>
                        <div className="player-sign" onClick={() => { if (isHost) { moves.resetBuzzer(id); } }}>
                            <div className={`name ${!connected ? 'dim' : ''}`}>
                                {name}
                                {!connected ? <AiOutlineDisconnect className="disconnected" /> : ''}
                            </div>
                            {i > 0 ? (
                                <div className="mini">
                                    {timeDisplay(timestamp - queue[0].timestamp)}
                                </div>
                            ) : null}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        <div className="queue">
            <p>Other Players</p>
            <ul>
                {activePlayers.map(({ id, name, connected }) => (
                    <li key={id} className={id === firstPlayer.id ? 'host-player' : ''}>
                        <div className={`name ${!connected ? 'dim' : ''}`}>
                            {name} {id === firstPlayer.id ? <FaCrown className="host-icon" /> : ''}
                            {!connected ? <AiOutlineDisconnect className="disconnected" /> : ''}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </>
);

export default GameView;    