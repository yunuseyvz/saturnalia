import React, { useState, useEffect, useRef } from 'react';
import { some, isEmpty, sortBy, values, orderBy, get, round } from 'lodash';
import { Howl } from 'howler';
import { AiOutlineDisconnect, AiOutlineArrowRight } from 'react-icons/ai';
import { Container } from 'react-bootstrap';
import Header from '../components/Header';
import '../App.css';

const categories = ['science', 'history', 'geography', 'literature', 'sports'];

export default function Table({ G, ctx, moves, playerID, gameMetadata, headerData, gameID, isConnected }) {
  const [loaded, setLoaded] = useState(false);
  const [buzzed, setBuzzer] = useState(some(G.queue, (o) => o.id === playerID));
  const [lastBuzz, setLastBuzz] = useState(null);
  const [sound, setSound] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [question, setQuestion] = useState(G.question || '');
  const [category, setCategory] = useState(G.category || categories[0]); // Add category state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(G.currentQuestionIndex || 0);
  const [totalQuestions, setTotalQuestions] = useState(G.questions.length);
  const buzzButton = useRef(null);
  const queueRef = useRef(null);
  const questionBoxRef = useRef(null);

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
    // reset buzzer based on game
    if (!G.queue[playerID]) {
      // delay the reset, in case game state hasn't reflected your buzz yet
      if (lastBuzz && Date.now() - lastBuzz < 500) {
        setTimeout(() => {
          const queue = queueRef.current;
          if (queue && !queue[playerID]) {
            setBuzzer(false);
          }
        }, 500);
      } else {
        // immediate reset, if it's been awhile
        setBuzzer(false);
      }
    }

    // reset ability to play sound if there is no pending buzzer
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
    // Update local state when game state changes
    setQuestion(G.question);
    setCategory(G.category); // Update category state
    setCurrentQuestionIndex(G.currentQuestionIndex);
    setTotalQuestions(G.questions.filter(q => q.category === G.category).length); // Update total questions
  }, [G.question, G.category, G.currentQuestionIndex]);

  useEffect(() => {
    // Ensure initial state is set correctly
    setQuestion(G.questions[G.currentQuestionIndex].question);
    setCategory(G.questions[G.currentQuestionIndex].category); // Set initial category
    setCurrentQuestionIndex(G.currentQuestionIndex);
    setTotalQuestions(G.questions.filter(q => q.category === G.questions[G.currentQuestionIndex].category).length); // Set initial total questions
  }, []);

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
  // host is lowest active user
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
  // active players who haven't buzzed
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
      moves.nextQuestion(); // Call the move to update the game state
      moves.resetBuzzers(); // Reset buzzers for the next question
    }
  };

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setCategory(newCategory);
    setCurrentQuestionIndex(0);
    setTotalQuestions(G.questions.filter(q => q.category === newCategory).length); // Update total questions
    moves.changeCategory(newCategory); // Call the move to update the game state
  };

  useEffect(() => {
    const questionBox = questionBoxRef.current;

    // Trigger slide-out animation
    questionBox.classList.add('slide-out');
    setTimeout(() => {
      // Trigger slide-in animation
      questionBox.classList.remove('slide-out');
      questionBox.classList.add('slide-in');
      setTimeout(() => {
        questionBox.classList.remove('slide-in');
      }, 500); // Match the duration of the slide-in animation
    }, 500); // Match the duration of the slide-out animation
  }, [question]);

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
          <p id="room-title">Room {gameID}</p>
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
              <div className="divider" />
              <div className="category-selector">
                <label htmlFor="category">Choose a category:</label>
                <select id="category" value={category} onChange={handleCategoryChange}>
                  {G.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </section>
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
      </Container>
    </div>
  );
}