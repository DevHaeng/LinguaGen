import { create } from 'zustand';

const useStore = create((set, get) => ({
  // 기존 상태들
  isLoaded: false,
  startTyping: false,
  isLeaving: false,
  showDemo: false,
  welcomeMessage1: '',
  welcomeMessage2: '',
  showWelcomeMessage1: false,
  showWelcomeMessage2: false,

  // DemoPlay 상태
  progress: 0,
  currentQuestion: 0,
  answers: ['', '', '', '', ''],
  showResult: false,
  isFinishing: false,
  isFinished: false,
  fadeIn: false,
  fadeOut: false,
  showGoodbyeMessage: false,

  // 로그인 상태
  isLoggedIn: false,
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),

  // PracticeMenubar 상태
  selectedCard: null,
  setSelectedCard: (index) => set({ selectedCard: index }),

  // 새로운 상태들 추가
  currentQuestions: [],
  selectedQuestionSet: null,
  gameProgress: {
    currentQuestionIndex: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    answers: [],
    isGameComplete: false
  },

  // MainContainer 관련 상태
  cards: [],
  loading: false,
  fatigue: 0,

  // 기존 액션들
  setIsLoaded: (value) => set({ isLoaded: value }),
  setStartTyping: (value) => set({ startTyping: value }),
  setIsLeaving: (value) => set({ isLeaving: value }),
  setShowDemo: (value) => set({ showDemo: value }),
  setWelcomeMessage1: (value) => set({ welcomeMessage1: value }),
  setWelcomeMessage2: (value) => set({ welcomeMessage2: value }),
  setShowWelcomeMessage1: (value) => set({ showWelcomeMessage1: value }),
  setShowWelcomeMessage2: (value) => set({ showWelcomeMessage2: value }),

  // DemoPlay 액션들
  setProgress: (value) => set({ progress: value }),
  setCurrentQuestion: (value) => set({ currentQuestion: value }),
  setAnswers: (answers) => set({ answers }),
  setShowResult: (value) => set({ showResult: value }),
  setIsFinishing: (value) => set({ isFinishing: value }),
  setIsFinished: (value) => set({ isFinished: value }),
  setFadeIn: (value) => set({ fadeIn: value }),
  setFadeOut: (value) => set({ fadeOut: value }),
  setShowGoodbyeMessage: (value) => set({ showGoodbyeMessage: value }),

  // 새로 추가: 문제 세트 관련 액션들
  setCurrentQuestions: (questions) => set({ currentQuestions: questions }),
  setSelectedQuestionSet: (questionSet) => set({ selectedQuestionSet: questionSet }),

  setGameProgress: (progress) => set({ gameProgress: progress }),

  resetGameProgress: () => set({
    gameProgress: {
      currentQuestionIndex: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      answers: [],
      isGameComplete: false
    }
  }),

  answerQuestion: (questionIndex, answer, isCorrect) => set((state) => ({
    gameProgress: {
      ...state.gameProgress,
      currentQuestionIndex: state.gameProgress.currentQuestionIndex + 1,
      correctAnswers: isCorrect
          ? state.gameProgress.correctAnswers + 1
          : state.gameProgress.correctAnswers,
      wrongAnswers: !isCorrect
          ? state.gameProgress.wrongAnswers + 1
          : state.gameProgress.wrongAnswers,
      answers: [
        ...state.gameProgress.answers,
        { questionIndex, userAnswer: answer, isCorrect }
      ],
      isGameComplete: state.gameProgress.currentQuestionIndex === 14 // 15문제 기준
    }
  })),

  resetGame: () => {
    set({
      currentQuestions: [],
      selectedQuestionSet: null,
      gameProgress: {
      currentQuestionIndex: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      answers: [],
      isGameComplete: false
      }
    });
  },

  getCurrentQuestion: () => {
    const state = get();
    if (state.currentQuestions.length === 0) return null;
    if (state.gameProgress.currentQuestionIndex >= state.currentQuestions.length) return null;
    return state.currentQuestions[state.gameProgress.currentQuestionIndex];
  },

  // MainContainer 관련 액션들
  setCards: (cards) => set({ cards }),
  setLoading: (loading) => set({ loading }),

  loadMoreCards: () => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    setTimeout(() => {
      const newCards = [
        { date: '2024.xx.xx', category: '문법', level: 'Level 4', score: '5/10', rank: 'Bronz 4' },
        { date: '2024.xx.xx', category: '문법', level: 'Level 3', score: '7/10', rank: 'Bronz 3' },
        { date: '2024.xx.xx', category: '문법', level: 'Level 2', score: '8/10', rank: 'Bronz 2' },
      ];
      set((state) => ({
        cards: [...state.cards, ...newCards],
        loading: false
      }));
    }, 1000);
  },

  // 피로도 관련 액션들
  setFatigue: (value) => set({ fatigue: value }),
  increaseFatigue: (amount) => set((state) => ({
    fatigue: Math.min(state.fatigue + amount, 100)
  })),

  handleNext: () => set((state) => {
    if (state.currentQuestion < 4) {
      return {
        currentQuestion: state.currentQuestion + 1,
        showResult: false,
        progress: ((state.currentQuestion + 1) / 5) * 100
      };
    } else {
      return { isFinishing: true };
    }
  }),

  handleBack: () => set((state) => {
    if (state.currentQuestion > 0) {
      return {
        currentQuestion: state.currentQuestion - 1,
        showResult: false,
        progress: ((state.currentQuestion - 1) / 5) * 100
      };
    }
    return state;
  }),

  handleAnswerChange: (answer) => set((state) => {
    const newAnswers = [...state.answers];
    newAnswers[state.currentQuestion] = answer;
    return { answers: newAnswers };
  }),

  handleCheckAnswer: () => set({ showResult: true }),

  handleFinish: () => set({ isFinishing: true }),

  startFinishingProcess: () => set((state) => {
    if (state.isFinishing && state.progress < 100) {
      return { progress: state.progress + 1 };
    } else if (state.isFinishing && state.progress >= 100) {
      return { fadeOut: true };
    }
    return state;
  }),
}));

export default useStore;