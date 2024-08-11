import { ActivePlayers } from 'boardgame.io/core';
import { questions } from './questions'; // Import questions

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
    const categoryQuestions = questions[category].map(q => ({ category, question: q }));
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
      questions: shuffledQuestions, // Initialize with the shuffled list of questions
      currentQuestionIndex: 0, // Initialize the current question index
      question: shuffledQuestions[0].question, // Set the first question
      category: shuffledQuestions[0].category, // Set the first category
      selectedCategory: null, // Initialize the selected category
      categories, // Add categories to the state
    };
  },
  phases: {
    play: {
      start: true,
      moves: { buzz, resetBuzzer, resetBuzzers, toggleLock, nextQuestion, changeCategory },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
  },
};