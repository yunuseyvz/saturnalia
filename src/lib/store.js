import { ActivePlayers } from 'boardgame.io/core';
import { questions } from './questions'; // Import questions

function getRandomQuestion(category) {
  const categoryQuestions = questions[category];
  const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
  return categoryQuestions[randomIndex];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function prepareQuestions(categories) {
  let allQuestions = [];
  categories.forEach(category => {
    const categoryQuestions = questions[category].map(q => ({ category, question: q }));
    allQuestions = allQuestions.concat(categoryQuestions);
  });
  return shuffleArray(allQuestions);
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

function nextQuestion(G, ctx) {
  if (G.currentQuestionIndex < G.questions.length) {
    G.currentQuestionIndex += 1;
    G.question = G.questions[G.currentQuestionIndex - 1].question;
    resetBuzzers(G);
  }
}

export const Buzzer = {
  name: 'buzzer',
  minPlayers: 2,
  maxPlayers: 200,
  setup: (ctx) => {
    const categories = ['science', 'history']; // Specify the categories you want to include
    const shuffledQuestions = prepareQuestions(categories); // Prepare the shuffled list of questions
    console.log("Shuffled Questions:", shuffledQuestions); // Print the shuffled questions to the console
    return {
      queue: {},
      locked: false,
      questions: shuffledQuestions, // Initialize with the shuffled list of questions
      currentQuestionIndex: 1, // Initialize the current question index
      question: shuffledQuestions[0].question, // Set the first question
    };
  },
  phases: {
    play: {
      start: true,
      moves: { buzz, resetBuzzer, resetBuzzers, toggleLock, nextQuestion },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
  },
};