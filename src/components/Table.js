import React, { useState, useEffect, useRef } from 'react';
import { some, isEmpty, sortBy, values, orderBy, get, round } from 'lodash';
import { Howl } from 'howler';
import { AiOutlineDisconnect, AiOutlineArrowRight, AiOutlineQrcode } from 'react-icons/ai';
import { Container, Modal, Button } from 'react-bootstrap';
import Header from '../components/Header';
import '../App.css';
import QRCode from "react-qr-code";

export default function Table({ G, ctx, moves, playerID, gameMetadata, headerData, gameID, isConnected }) {
  const [loaded, setLoaded] = useState(false);
  const [buzzed, setBuzzer] = useState(some(G.queue, (o) => o.id === playerID));
  const [lastBuzz, setLastBuzz] = useState(null);
  const [sound, setSound] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [question, setQuestion] = useState(G.question);
  const [category, setCategory] = useState(G.category);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(G.currentQuestionIndex || 0);
  const [totalQuestions, setTotalQuestions] = useState(G.questions.length);
  const buzzButton = useRef(null);
  const queueRef = useRef(null);
  const questionBoxRef = useRef(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const buzzSound = new Howl({
    src: [
      `${process.env.PUBLIC_URL}/shortBuzz.webm`,
      `${process.env.PUBLIC_URL}/shortBuzz.mp3`,
    ],
    volume: 0.5,
    rate: 1.5,
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
      if (e.keyCode === 32 && !e.repeat) {
        buzzButton.current.click();
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, []);

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

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setCategory(newCategory);
    const filteredQuestions = G.questions.filter(q => q.category === newCategory);
    setCurrentQuestionIndex(0);
    setTotalQuestions(filteredQuestions.length);
    setQuestion(filteredQuestions[0].question); // Set the first question of the new category
    moves.changeCategory(newCategory); // Ensure this updates the game state
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  return (
    <div className="App">
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
          {isHost ? (
            <p className="host">You are the host</p>
          ) : (
            <p className="player">You are a player</p>
          )}
          {ctx.phase === 'lobby' ? (
            <>
              {isHost ? (
                <div className="category-select">
                  <select id="category" value={category} onChange={handleCategoryChange}>
                    {G.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {isHost ? (
                <button onClick={() => moves.startGame()}>Start Game</button>
              ) : (
                <p>Waiting for the host to start the game...</p>
              )}
              <div className="queue">
                <p>Players</p>
                <ul>
                  {activePlayers.map(({ id, name, connected }) => (
                    <li key={id}>
                      <div className={`name ${!connected ? 'dim' : ''}`}>
                        {name}
                        {!connected ? (
                          <AiOutlineDisconnect className="disconnected" />
                        ) : (
                          ''
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="question-box" ref={questionBoxRef}>
                <p className="uppercase">{category}</p>
                <p className="question">{question}</p>
              </div>
              <div className="question-counter-container">
                <p className="question-counter">Question {currentQuestionIndex + 1}/{totalQuestions}</p>
                {isHost ? (
                  <button className="next-question-button" onClick={nextQuestion}>
                    <AiOutlineArrowRight size={24} />
                  </button>
                ) : null}
              </div>
              {!isConnected ? (
                <p className="warning">Disconnected - attempting to reconnect...</p>
              ) : null}
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
              {isHost ? (
                <div className="settings" style={{ margin: '20px 0' }}>
                  <div className="button-container">
                    <button
                      className="text-button"
                      onClick={() => moves.toggleLock()}
                    >
                      {G.locked ? 'Unlock buzzers' : 'Lock buzzers'}
                    </button>
                  </div>
                  <div className="button-container">
                    <button
                      onClick={() => moves.resetBuzzers()}
                    >
                      Reset all buzzers
                    </button>
                  </div>
                  <div className="button-container">
                    <button
                      onClick={() => moves.stopGame()}
                    >
                      Stop Game
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
                    <div
                      className="player-sign"
                      onClick={() => {
                        if (isHost) {
                          moves.resetBuzzer(id);
                        }
                      }}
                    >
                      <div className={`name ${!connected ? 'dim' : ''}`}>
                        {name}
                        {!connected ? (
                          <AiOutlineDisconnect className="disconnected" />
                        ) : (
                          ''
                        )}
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
                  <li key={id}>
                    <div className={`name ${!connected ? 'dim' : ''}`}>
                      {name}
                      {!connected ? (
                        <AiOutlineDisconnect className="disconnected" />
                      ) : (
                        ''
                      )}
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
          <Modal.Title className="w-100 text-center">Scan QR Code to join</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <QRCode value={"saturnalia.onrender.com/" + gameID} />
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" onClick={toggleQRCode}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}