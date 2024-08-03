import { ActivePlayers } from 'boardgame.io/core';
import { questions } from './questions'; // Import questions

function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

function resetBuzzers(G) {
  G.queue = {};
}

function resetBuzzer(G, ctx, id) {
  const newQueue = { ...G.queue };
  delete newQueue[id];
  G.queue = newQueue;
}

function toggleLock(G) {
  G.locked = !G.locked;
}

function buzz(G, ctx, id) {
  const newQueue = {
    ...G.queue,
  };
  if (!newQueue[id]) {
    // buzz on server will overwrite the client provided timestamp
    newQueue[id] = { id, timestamp: new Date().getTime() };
  }
  G.queue = newQueue;
}

export const Buzzer = {
  name: 'buzzer',
  minPlayers: 2,
  maxPlayers: 200,
  setup: () => {
    const question = getRandomQuestion(); // Get a random question
    console.log("Random Question:", question); // Print the question to the console
    return {
      queue: {},
      locked: false,
      question, // Initialize with the random question
    };
  },
  phases: {
    play: {
      start: true,
      moves: { buzz, resetBuzzer, resetBuzzers, toggleLock },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
  },
};