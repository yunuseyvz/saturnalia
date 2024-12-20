import React, { useState, useEffect, useRef } from 'react';
import { some, isEmpty, sortBy, values, orderBy, get, round } from 'lodash';
import { Howl } from 'howler';
import { FaUser } from 'react-icons/fa';
import { Container } from 'react-bootstrap';
import Header from '../components/Header';
import '../App.css';
import toast, { Toaster } from 'react-hot-toast';
import RoomInfo from '../components/RoomInfo';
import LobbyView from '../components/LobbyView';
import Overlays from '../components/Overlays';
import GameView from './GameView';

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
  const [selectedGameMode, setSelectedGameMode] = useState(G.gameMode);
  const [isEmojiBubbleOpen, setIsEmojiBubbleOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(G.selectedCategory);
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
    const filteredQuestions = G.questions.filter(q => q.category === category);
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    setQuestion(currentQuestion ? currentQuestion.question : '');
    setCategory(G.category);
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
          color: 'white',
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

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const filteredQuestions = G.questions.filter(q => q.category === newCategory);
    setCurrentQuestionIndex(0);
    setTotalQuestions(filteredQuestions.length);
    setQuestion(filteredQuestions[0]?.question || '');
    moves.changeCategory(newCategory);
  };

  const toggleQRCode = () => {
    setShowQRCode(!showQRCode);
  };

  const selectRandomCategory = () => {
    const randomCategory = G.categories[Math.floor(Math.random() * G.categories.length)];
    handleCategoryChange(randomCategory);
  };

  const toggleEmojiBubble = () => {
    setIsEmojiBubbleOpen(!isEmojiBubbleOpen);
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
        <RoomInfo
          gameID={gameID}
          toggleQRCode={toggleQRCode}
          isHost={isHost}
          players={players}
          playerID={playerID}
          G={G}
          ctx={ctx}
          moves={moves}
          setSelectedGameMode={setSelectedGameMode}
          category={category}
        />
        {ctx.phase === 'lobby' ? (
          <LobbyView
            isHost={isHost}
            G={G}
            moves={moves}
            category={category}
            handleCategorySelect={handleCategorySelect}
            selectRandomCategory={selectRandomCategory}
            activePlayers={activePlayers}
            firstPlayer={firstPlayer}
            setSelectedGameMode={setSelectedGameMode}
          />
        ) : (
          <GameView
            G={G}
            isHost={isHost}
            buzzed={buzzed}
            buzzButton={buzzButton}
            attemptBuzz={attemptBuzz}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            category={category}
            questionBoxRef={questionBoxRef}
            moves={moves}
            isConnected={isConnected}
            buzzedPlayers={buzzedPlayers}
            activePlayers={activePlayers}
            firstPlayer={firstPlayer}
            queue={queue}
            timeDisplay={timeDisplay} />
        )}
      </Container>
      <Overlays
        showQRCode={showQRCode}
        toggleQRCode={toggleQRCode}
        gameID={gameID}
        isEmojiBubbleOpen={isEmojiBubbleOpen}
        toggleEmojiBubble={toggleEmojiBubble}
        moves={moves}
      />
    </div>
  );
}