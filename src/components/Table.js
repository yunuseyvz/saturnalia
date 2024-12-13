import React, { useState, useEffect, useRef } from 'react';
import { some, isEmpty, sortBy, values, orderBy, get, round } from 'lodash';
import { Howl } from 'howler';
import { AiOutlineDisconnect, AiOutlineArrowRight, AiOutlineQrcode, AiOutlineArrowLeft } from 'react-icons/ai';
import { FaCrown, FaUser, FaGamepad, FaList, FaHippo, FaRandom, FaPlay, FaCog, FaLock, FaUnlock, FaRedo, FaStop, FaBolt, FaIceCream } from 'react-icons/fa'; // Import icons
import { Container, Modal, Button, Carousel, Spinner } from 'react-bootstrap'; // Import Carousel and Spinner
import Header from '../components/Header';
import '../App.css';
import QRCode from "react-qr-code";
import toast, { Toaster } from 'react-hot-toast';

const emojis = ['😂', '😍', '😎', '😡', '👍', '🤨', '😦'];

export default function Table({ G, ctx, moves, playerID, gameMetadata, headerData, gameID, isConnected }) {
  const [loaded, setLoaded] = useState(false);
  const [buzzed, setBuzzer] = useState(some(G.queue, (o) => o.id === playerID));
  const [lastBuzz, setLastBuzz] = useState(null);
  const [sound, setSound] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [question, setQuestion] = useState(G.question);
  const [category, setCategory] = useState(G.category);
  const [answer, setAnswer] = useState(G.answer);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(G.currentQuestionIndex || 0);
  const [totalQuestions, setTotalQuestions] = useState(G.questions.length);
  const buzzButton = useRef(null);
  const queueRef = useRef(null);
  const questionBoxRef = useRef(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState(G.gameMode);
  const [isEmojiBubbleOpen, setIsEmojiBubbleOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(G.selectedCategory);
  const [emojiCooldown, setEmojiCooldown] = useState(false);
  const [previousPlayers, setPreviousPlayers] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const buzzSound = new Howl({
    src: [
      `${process.env.PUBLIC_URL}/shortBuzz.webm`,
      `${process.env.PUBLIC_URL}/shortBuzz.mp3`,
    ],
    volume: 0.5,
    rate: 1.0,
  });

  const playSound = () => {
    if (sound && !soundPlayed) {
      buzzSound.play();
      setSoundPlayed(true);
    }
  };

  useEffect(() => {
    console.log(G.queue, Date.now());
    if (!G.queue[playerID]) {
      if (lastBuzz && Date.now() - lastBuzz < 500) {
        setTimeout(() => {
          const queue = queueRef.current;
          if (queue && !queue[playerID]) {
            setBuzzer(false);
          }
        }, 500);
      } else {
        setBuzzer(false);
      }
    }

    if (isEmpty(G.queue)) {
      setSoundPlayed(false);
    } else if (loaded) {
      playSound();
    }

    if (!loaded) {
      setLoaded(true);
    }

    queueRef.current = G.queue;
  }, [G.queue]);

  useEffect(() => {
    // Update local state when game state changes or on initial render
    const filteredQuestions = G.questions.filter(q => q.category === category);
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    setQuestion(currentQuestion ? currentQuestion.question : '');
    setCategory(G.category); // Ensure category is updated from G.category
    setCurrentQuestionIndex(G.currentQuestionIndex);
    setTotalQuestions(filteredQuestions.length);
  }, [G.questions, G.currentQuestionIndex, G.category, G.question, category, currentQuestionIndex]);

  useEffect(() => {
    if (G.emojiReaction) {
      toast(G.emojiReaction.emoji, {
        className: 'toast-custom',
        duration: 2000,
        style: {
          background: 'rgba(0, 0, 0, 0.0)',
          boxShadow: 'none',
        },
      });
      moves.clearEmojiReactions();
    }
  }, [G.emojiReaction]);

  useEffect(() => {
    const currentPlayers = gameMetadata
      ? gameMetadata.filter((p) => p.name).map((p) => ({ ...p, id: String(p.id) }))
      : [];

    const previousPlayerIds = previousPlayers.map(p => p.id);
    const currentPlayerIds = currentPlayers.map(p => p.id);

    const joinedPlayers = currentPlayers.filter(p => !previousPlayerIds.includes(p.id));
    const leftPlayers = previousPlayers.filter(p => !currentPlayerIds.includes(p.id));

    if (!initialLoad) {
      joinedPlayers.forEach(p => toast(`${p.name} has joined the game`, {
        icon: <FaUser />,
        duration: 2000,
      }));
      leftPlayers.forEach(p => toast(`${p.name} has left the game`, {
        icon: <FaUser />,
        duration: 2000,
      }));
    }

    setPreviousPlayers(currentPlayers);
    setInitialLoad(false);
  }, [gameMetadata, initialLoad]);


  const attemptBuzz = () => {
    if (!buzzed) {
      playSound();
      moves.buzz(playerID);
      setBuzzer(true);
      setLastBuzz(Date.now());
    }
  };


  // spacebar will buzz
  useEffect(() => {
    function onKeydown(e) {
      if (e.keyCode === 32 && !e.repeat && ctx.phase === 'play') {
        buzzButton.current.click();
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [ctx.phase]);

  const players = !gameMetadata
    ? []
    : gameMetadata
      .filter((p) => p.name)
      .map((p) => ({ ...p, id: String(p.id) }));
  const firstPlayer =
    get(
      sortBy(players, (p) => parseInt(p.id, 10)).filter((p) => p.connected),
      '0'
    ) || null;
  const isHost = get(firstPlayer, 'id') === playerID;

  const queue = sortBy(values(G.queue), ['timestamp']);
  const buzzedPlayers = queue
    .map((p) => {
      const player = players.find((player) => player.id === p.id);
      if (!player) {
        return {};
      }
      return {
        ...p,
        name: player.name,
        connected: player.connected,
      };
    })
    .filter((p) => p.name);
  const activePlayers = orderBy(
    players.filter((p) => !some(queue, (q) => q.id === p.id)),
    ['connected', 'name'],
    ['desc', 'asc']
  );

  const timeDisplay = (delta) => {
    if (delta > 1000) {
      return `+${round(delta / 1000, 2)} s`;
    }
    return `+${delta} ms`;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      moves.nextQuestion();
      moves.resetBuzzers();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      moves.previousQuestion();
      moves.resetBuzzers();
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const filteredQuestions = G.questions.filter(q => q.category === newCategory);
    setCurrentQuestionIndex(0);
    setTotalQuestions(filteredQuestions.length);
    setQuestion(filteredQuestions[0]?.question || ''); // Set the first question of the new category
    moves.changeCategory(newCategory); // Ensure this updates the game state
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  const selectRandomCategory = () => {
    const randomCategory = G.categories[Math.floor(Math.random() * G.categories.length)];
    handleCategoryChange(randomCategory);
  };

  const handleEmojiClick = (emoji) => {
    //if (!emojiCooldown) {
    moves.addEmojiReaction(emoji);
    setEmojiCooldown(true);
    //setTimeout(() => setEmojiCooldown(false), 2000); // 2 seconds cooldown
    //}
  };

  const toggleEmojiBubble = () => {
    setIsEmojiBubbleOpen(!isEmojiBubbleOpen);
  };

  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameID);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000); // Clear the message after 2 seconds
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleCategoryChange(category);
  };

  return (
    <div className="App">
      <Toaster />
      <Header
        auth={headerData}
        clearAuth={() =>
          headerData.setAuth({
            playerID: null,
            credentials: null,
            roomID: null,
          })
        }
        sound={sound}
        setSound={() => setSound(!sound)}
      />
      <Container>
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
          {ctx.phase === 'lobby' ? (
            <>
              {isHost && !G.gameMode ? (
                <div className="game-mode-selection">
                  <div
                    className="game-mode-card"
                    onClick={() => {
                      moves.setGameMode('buzz');
                      setSelectedGameMode('buzz');
                    }}
                  >
                    <FaIceCream className="game-mode-card-icon" />
                    <div className="game-mode-card-title">Buzzin</div>
                    <div className="game-mode-card-description">Standard</div>
                  </div>
                  <div
                    className="game-mode-card"
                    onClick={() => {
                      moves.setGameMode('standard');
                      setSelectedGameMode('standard');
                    }}
                  >
                    <FaHippo className="game-mode-card-icon" />
                    <div className="game-mode-card-title">Group</div>
                    <div className="game-mode-card-description">Questions</div>
                  </div>
                  <div
                    className="game-mode-card"
                    onClick={() => {
                      moves.setGameMode('multipleChoice');
                      setSelectedGameMode('multipleChoice');
                    }}
                  >
                    <FaBolt className="game-mode-card-icon" />
                    <div className="game-mode-card-title">Rissa</div>
                    <div className="game-mode-card-description">Multiple-choice</div>
                  </div>
                </div>
              ) : null}
              {isHost && G.gameMode && G.gameMode !== 'buzz' ? (
                <>
                  <div className="category-selection">
                    {G.categories.map((cat) => (
                      <div
                        key={cat}
                        className={`category-card ${category === cat ? 'selected' : ''}`}
                        onClick={() => {
                          handleCategorySelect(cat)
                        }}
                      >
                        <div className="category-card-title">{cat}</div>
                      </div>
                    ))}
                    <div
                      className="category-card"
                      onClick={selectRandomCategory}
                    >
                      <><FaRandom className="category-card-icon" /><div className="category-card-title">Random</div></>
                    </div>
                  </div>
                </>
              ) : null}
              {isHost && (G.category || G.gameMode === 'buzz') ? (
                <button
                  className="start-game-button"
                  onClick={() => moves.startGame()}
                >
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
              <div className="queue">
                <p>Players</p>
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
          ) : (
            <>
              {G.gameMode === 'buzz' ? (
                <div id="buzzer" style={{ margin: '20px 0' }}>
                  <button
                    ref={buzzButton}
                    disabled={buzzed || G.locked}
                    onClick={() => {
                      if (!buzzed && !G.locked) {
                        attemptBuzz();
                      }
                    }}
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
                        {!q.options && isHost ? (
                          <div className="answer-box">
                            <p className="answer">{q.answer}</p>
                          </div>
                        ) : null}
                        {q.options && (
                          <div className="options-box">
                            {q.options.map((option, idx) => (
                              <p
                                key={idx}
                                className={`option ${isHost && option === q.answer ? 'correct-answer' : ''}`}
                              >
                                {option}
                              </p>
                            ))}
                          </div>
                        )}
                      </Carousel.Item>
                    ))}
                  </Carousel>
                  {isHost ? null : (
                    <div id="buzzer" style={{ margin: '20px 0' }}>
                      <button
                        ref={buzzButton}
                        disabled={buzzed || G.locked}
                        onClick={() => {
                          if (!buzzed && !G.locked) {
                            attemptBuzz();
                          }
                        }}
                      >
                        {G.locked ? 'Locked' : buzzed ? 'Buzzed' : 'Buzz'}
                      </button>
                    </div>
                  )}
                </>
              )}
              {G.gameMode !== 'buzz' && (
                <div className="question-counter-container">
                  <p className="question-counter">Question {currentQuestionIndex + 1}/{totalQuestions}</p>
                  {isHost ? (
                    <div className="navigation-buttons-container">
                      <button
                        className="previous-question-button"
                        onClick={previousQuestion}
                        disabled={currentQuestionIndex <= 0}
                      >
                        <AiOutlineArrowLeft size={24} />
                      </button>
                      <button
                        className="next-question-button"
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex >= totalQuestions - 1}
                      >
                        <AiOutlineArrowRight size={24} />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
              {!isConnected ? (
                <p className="warning">Disconnected - attempting to reconnect...</p>
              ) : null}
              {isHost ? (
                <div className="settings" style={{ margin: '20px 0' }}>
                  <div className="button-container">
                    <button
                      className="text-button"
                      onClick={() => moves.toggleLock()}
                    >
                      {G.locked ? <FaUnlock /> : <FaLock />} {G.locked ? 'Unlock buzzers' : 'Lock buzzers'}
                    </button>
                  </div>
                  <div className="button-container">
                    <button
                      className="text-button"
                      onClick={() => moves.resetBuzzers()}
                    >
                      <FaRedo /> Reset buzzers
                    </button>
                  </div>
                  <div className="button-container">
                    <button
                      onClick={() => moves.stopGame()}
                    >
                      <FaStop /> Stop Game
                    </button>
                  </div>
                  <div className="divider" />
                </div>
              ) : null}
            </>
          )}
        </section>
        {ctx.phase === 'play' && (
          <>
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
        )}
      </Container>

      <Modal show={showQRCode} onHide={toggleQRCode} centered className="custom-modal">
        <Modal.Header closeButton className="justify-content-center">
          <Modal.Title className="w-100 text-center">Room Code: {gameID}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <h4 className="mb-0 mr-2">Scan QR Code to join</h4>
          </div>
          {copySuccess && <div className="mb-2 text-success">{copySuccess}</div>}
          <QRCode value={"saturnalia.onrender.com/" + gameID} />
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={toggleQRCode} className="btn btn-primary">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className={`emoji-bubble ${isEmojiBubbleOpen ? 'open' : ''}`} onClick={toggleEmojiBubble}>
        <span className="emoji-bubble-icon">😊</span>
        {isEmojiBubbleOpen && (
          <div className="emoji-selection">
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                className="emoji-button"
                onClick={() => handleEmojiClick(emoji)}
              //disabled={emojiCooldown} // Disable button during cooldown
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}