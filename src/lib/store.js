import { ActivePlayers } from 'boardgame.io/core';
import { questions } from './questions'; // Import questions
import { questionsMultipleChoice } from './questionsMultipleChoice'; // Import multiple choice questions

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function prepareQuestions() {
  let allQuestions = [];
  Object.keys(questions).forEach(category => {
    const categoryQuestions = questions[category].map(q => ({ category, question: q.question, answer: q.answer }));
    allQuestions = allQuestions.concat(shuffleArray(categoryQuestions));
  });
  return allQuestions;
}

function prepareMultipleChoiceQuestions() {
  let allQuestions = [];
  Object.keys(questionsMultipleChoice).forEach(category => {
    const categoryQuestions = questionsMultipleChoice[category].map(q => ({
      category,
      question: q.question,
      options: q.options,
      answer: q.answer
    }));
    allQuestions = allQuestions.concat(shuffleArray(categoryQuestions));
  });
  return allQuestions;
}

function filterQuestionsByCategory(allQuestions, category) {
  return allQuestions.filter(q => q.category === category);
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
  const questions = G.selectedCategory ? filterQuestionsByCategory(G.questions, G.selectedCategory) : G.questions;
  if (G.currentQuestionIndex < questions.length - 1) {
    G.currentQuestionIndex += 1;
    G.question = questions[G.currentQuestionIndex].question;
    G.category = questions[G.currentQuestionIndex].category; // Update the category
    resetBuzzers(G);
  }
}

function changeCategory(G, ctx, category) {
  G.selectedCategory = category;
  G.currentQuestionIndex = 0;
  const filteredQuestions = filterQuestionsByCategory(G.questions, category);
  G.question = filteredQuestions[0].question;
  G.category = filteredQuestions[0].category;
  resetBuzzers(G);
}

function startGame(G, ctx) {
  ctx.events.setPhase('play');
}

function stopGame(G, ctx) {
  ctx.events.setPhase('lobby');
}

function setGameMode(G, ctx, mode) {
  G.gameMode = mode;
  G.questions = mode === 'standard' ? prepareQuestions() : prepareMultipleChoiceQuestions();
  G.categories = [...new Set(G.questions.map(q => q.category))]; // Update categories based on selected mode
}

export const Buzzer = {
  name: 'buzzer',
  minPlayers: 2,
  maxPlayers: 200,
  setup: (ctx) => {
    const shuffledQuestions = prepareQuestions(); // Prepare the shuffled list of questions
    const categories = Object.keys(questions); // Get the categories
    console.log("Shuffled Questions:", shuffledQuestions); // Print the shuffled questions to the console
    return {
      queue: {},
      locked: false,
      questions: [], // Will be set after mode selection
      currentQuestionIndex: 0,
      selectedCategory: null,
      categories: Object.keys(questions),
      gameMode: null, // Add game mode
    };
  },
  phases: {
    lobby: {
      start: true,
      moves: { setGameMode, changeCategory, startGame },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
    play: {
      moves: { buzz, resetBuzzer, resetBuzzers, toggleLock, nextQuestion, changeCategory, stopGame },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
      onEnd: (G, ctx) => {
        // Reset the game state when transitioning back to the lobby
        G.currentQuestionIndex = 0;
        resetBuzzers(G);
      },
    },
  },
};