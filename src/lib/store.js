import { ActivePlayers } from 'boardgame.io/core';
import { questions } from './questions';
import { questionsMultipleChoice } from './questionsMultipleChoice';

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
    const categoryQuestions = questions[category].map(q => ({ category, id: q.id, question: q.question, answer: q.answer }));
    allQuestions = allQuestions.concat(shuffleArray(categoryQuestions));
  });
  return allQuestions;
}

function prepareMultipleChoiceQuestions() {
  let allQuestions = [];
  Object.keys(questionsMultipleChoice).forEach(category => {
    const categoryQuestions = questionsMultipleChoice[category].map(q => ({
      category,
      id: q.id,
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
    G.category = questions[G.currentQuestionIndex].category;
    resetBuzzers(G);
    G.displayedQuestions.push(questions[G.currentQuestionIndex - 1].id);
  }
}

function previousQuestion(G, ctx) {
  const questions = G.selectedCategory ? filterQuestionsByCategory(G.questions, G.selectedCategory) : G.questions;
  if (G.currentQuestionIndex > 0) {
    G.currentQuestionIndex -= 1;
    G.question = questions[G.currentQuestionIndex].question;
    G.category = questions[G.currentQuestionIndex].category;
    resetBuzzers(G);
    G.displayedQuestions.push(questions[G.currentQuestionIndex + 1].id);
  }
}

function changeCategory(G, ctx, category) {
  G.selectedCategory = category;
  G.currentQuestionIndex = 0;
  G.questions = G.gameMode === 'standard' ? prepareQuestions() : prepareMultipleChoiceQuestions();
  const filteredQuestions = filterQuestionsByCategory(G.questions, category);
  G.question = filteredQuestions[0].question;
  G.category = filteredQuestions[0].category;
  resetBuzzers(G);
  //console.log('Changed category to:', category);
}

function startGame(G, ctx) {
  ctx.events.setPhase('play');
}

function stopGame(G, ctx) {
  ctx.events.setPhase('lobby');
  const questions = G.selectedCategory ? filterQuestionsByCategory(G.questions, G.selectedCategory) : G.questions;
  G.displayedQuestions.push(questions[G.currentQuestionIndex].id);
}

function setGameMode(G, ctx, mode) {
  G.gameMode = mode;
  G.questions = mode === 'standard' ? prepareQuestions() : prepareMultipleChoiceQuestions();
  G.categories = [...new Set(G.questions.map(q => q.category))];
  G.category = null;
}

function addEmojiReaction(G, ctx, emoji) {
  G.emojiReaction = { playerID: ctx.playerID, emoji, timestamp: Date.now() };
}

function clearEmojiReactions(G) {
  G.emojiReaction = null;
}

function markAsSeen(G, id) {
  G.displayedQuestions.push(id);
}

export const Buzzer = {
  name: 'buzzer',
  minPlayers: 2,
  maxPlayers: 200,
  setup: (ctx) => {
    return {
      queue: {},
      locked: false,
      questions: [],
      currentQuestionIndex: 0,
      selectedCategory: null,
      categories: Object.keys(questions),
      gameMode: null,
      emojiReactions: [],
      displayedQuestions: [],
    };
  },
  phases: {
    lobby: {
      start: true,
      moves: {
        setGameMode,
        changeCategory,
        startGame,
        addEmojiReaction,
        clearEmojiReactions
      },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
    },
    play: {
      moves: {
        buzz,
        resetBuzzer,
        resetBuzzers,
        toggleLock,
        markAsSeen,
        nextQuestion,
        previousQuestion,
        changeCategory,
        stopGame,
        addEmojiReaction,
        clearEmojiReactions
      },
      turn: {
        activePlayers: ActivePlayers.ALL,
      },
      onEnd: (G, ctx) => {
        G.currentQuestionIndex = 0;
        resetBuzzers(G);
        G.emojiReactions = [];
        G.category = null;
      },
    },
  },
};