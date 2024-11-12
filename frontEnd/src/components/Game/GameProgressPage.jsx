import React, {useState, useCallback, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import axios from 'axios';
import Lottie from 'react-lottie';
import CorrectAnimation from '../../assets/LottieAnimation/Correct.json';
import IncorrectAnimation from '../../assets/LottieAnimation/Incorrect.json';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

axios.defaults.withCredentials = true;


// axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:5173',
    headers: {
        'Content-Type': 'application/json'
    }
});

const GameProgressPage = ({
                              onCorrectAnswer,
                              onWrongAnswer,
                              currentQuestion: currentQuestionNumber,
                              totalQuestions,
                              customQuestions,
                              isCustomSet,
                              setId,
                              isGameOver,
                              isGameClear,
                              onRestart,
                              onMainMenu,
                              onNextQuestion, // 추가

                          }) => {
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('id');

    // State 선언들
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(currentQuestionNumber - 1);
    const [userAnswer, setUserAnswer] = useState('');
    const [isSliding, setIsSliding] = useState(false);
    const [slideDirection, setSlideDirection] = useState('left');
    const [feedback, setFeedback] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [hoveredAnswer, setHoveredAnswer] = useState(null);
    const [sessionIdentifier, setSessionIdentifier] = useState(null);
    const [isTimeExpired, setIsTimeExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

    // Lottie 옵션 설정
    const correctOptions = {
        loop: false,
        autoplay: true,
        animationData: CorrectAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const incorrectOptions = {
        loop: false,
        autoplay: true,
        animationData: IncorrectAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };
    // GameProgressPage.jsx의 submitAnswerToServer 함수 수정
    const submitAnswerToServer = useCallback(async (submitData) => {
        try {
            if (!submitData.studentAnswer) {
                console.error("No answer provided");
                return;
            }

            // 나만의 문제인 경우와 일반 문제인 경우를 구분
            let response;
            if (isCustomSet) {
                // 나만의 문제 답안 제출
                response = await axios.post("http://localhost:8085/api/user-questions/submit-answer", {
                    sessionIdentifier: sessionIdentifier, // 세션 식별자 추가
                    questionIdx: submitData.questionId,
                    answer: submitData.studentAnswer
                }, {
                    withCredentials: true
                });
            } else {
                // 기존 일반 문제 답안 제출
                response = await api.post("/api/answers/submit", {
                    sessionIdentifier: sessionIdentifier,
                    idx: submitData.questionId,
                    studentId: userId,
                    studentAnswer: submitData.studentAnswer,
                    questionOrder: currentQuestionNumber,
                    type: submitData.questionType
                });
            }

            const result = response.data;
            console.log("Server response:", result);

            // `isCorrect` 값을 Boolean 타입으로 변환
            const isCorrect = result.isCorrect === true || result.isCorrect === 'true';

            if (isCorrect) {
                onCorrectAnswer();
            } else {
                onWrongAnswer();
            }

            setFeedback(isCorrect);
            setShowFeedback(true);
            setShowAnimation(true);
        } catch (error) {
            console.error("Error submitting answer:", error);
            if (error.response) {
                console.error("Server error details:", error.response.data);
            }
        }
    }, [sessionIdentifier, currentQuestionNumber, userId, onCorrectAnswer, onWrongAnswer, isCustomSet]);


    // 답안 처리 함수
    const handleAnswer = useCallback((answerIndex) => {
        if (!currentQuestion) {
            console.error("No current question available");
            return;
        }

        // 이미 답을 제출한 상태라면 무시
        if (showFeedback) {
            return;
        }

        console.log("Handling answer:", {
            answerIndex,
            currentQuestion,
            type: currentQuestion.type
        });

        let studentAnswer;

        if (currentQuestion.type === 'multipleChoice') {
            if (!currentQuestion.options || answerIndex >= currentQuestion.options.length) {
                console.error("Invalid answer index for multiple choice question");
                return;
            }
            studentAnswer = ['A', 'B', 'C', 'D'][answerIndex];
        } else if (currentQuestion.type === 'shortAnswer') {
            if (typeof answerIndex !== 'string') {
                console.error("Invalid answer type for short answer question");
                return;
            }
            studentAnswer = answerIndex.trim();
        } else {
            console.error("Unknown question type:", currentQuestion.type);
            return;
        }

        setSelectedAnswer(answerIndex);

        submitAnswerToServer({
            questionId: currentQuestion.idx,
            studentAnswer: studentAnswer,
            questionType: currentQuestion.type
        });
    }, [currentQuestion, submitAnswerToServer, showFeedback]); // showFeedback 의존성 추가

    // 시간 초과 처리
    const handleTimeExpired = async () => {
        try {
            await api.post(`/api/answers/session/${sessionIdentifier}/complete`);
            setIsTimeExpired(true);
            setIsGameOver(true);
        } catch (error) {
            console.error('Failed to complete session:', error);
        }
    };

    // 세션 시작 함수
    const startSession = async () => {
        try {
            const response = await api.post('/api/answers/start-session', {
                userId: userId
            });
            setSessionIdentifier(response.data.sessionIdentifier);
            return response.data.sessionIdentifier;
        } catch (error) {
            console.error('Failed to start session:', error);
            throw error;
        }
    };

    // 힌트 생성 함수
    const generateHint = useCallback((answer) => {
        if (!answer) return '';

        if (answer.includes('BLANK:')) {
            const [beforeBlank, rest] = answer.split('BLANK:');
            const [blankWord, afterBlank] = rest.split(' ', 2);
            return `${beforeBlank}${'_'.repeat(blankWord.length)}${afterBlank ? ' ' + afterBlank : ''}`;
        }

        const first = answer.slice(0, 1);
        const last = answer.slice(-1);
        const middle = '_'.repeat(answer.length - 2);
        return `${first}${middle}${last}`;
    }, []);

    // handleNextQuestion 함수 수정
    const handleNextQuestion = useCallback(() => {
        setIsSliding(true);
        setSlideDirection('left');

        setTimeout(() => {
            if (currentQuestionIndex + 1 >= questions.length) {
                api.post(`/api/answers/session/${sessionIdentifier}/complete`)
                    .catch(error => console.error('Failed to complete session:', error));
            } else {
                onNextQuestion(); // 부모 컴포넌트의 현재 문제 번호 업데이트
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                setUserAnswer('');
                setSelectedAnswer(null);
                setShowFeedback(false);
                setShowExplanation(false);
            }
            setSlideDirection('right');
        }, 500);

        setTimeout(() => {
            setIsSliding(false);
        }, 1000);
    }, [currentQuestionIndex, questions.length, sessionIdentifier, onNextQuestion]);

    // 문제 초기화 및 세션 설정
    useEffect(() => {
        const initializeGame = async () => {
            try {
                setLoading(true);
                if (!userId) throw new Error("User ID not found in sessionStorage.");

                // 새로운 세션 항상 생성
                const newSessionResponse = await api.post('/api/answers/start-session', { userId });
                const currentSessionId = newSessionResponse.data.sessionIdentifier;
                setSessionIdentifier(currentSessionId);

                let questionsData;

                // 커스텀 세트 모드와 일반 모드 구분
                if (isCustomSet && customQuestions && setId) {
                    console.log("Using custom set mode with setId:", setId);
                    const response = await api.get(`/api/user-questions/sets/${setId}`);
                    questionsData = response.data.map(q => ({
                        idx: q.idx,
                        type: q.questionFormat === 'MULTIPLE_CHOICE' ? 'multipleChoice' : 'shortAnswer',
                        question: q.question,
                        passage: q.passage,
                        explanation: q.explanation,
                        detailType: q.detailType,
                        interest: q.interest,
                        diffGrade: q.diffGrade,
                        diffTier: q.diffTier,
                        correctAnswer: q.correctAnswer,
                        options: q.choices?.map(choice => choice.choiceText) || []
                    }));
                    console.log("Formatted custom questions:", questionsData);
                } else {
                    console.log("Using default mode");
                    const response = await api.get(`/api/questions/user/${userId}`);
                    questionsData = response.data.map(q => ({
                        idx: q.idx,
                        type: q.questionFormat === 'MULTIPLE_CHOICE' ? 'multipleChoice' : 'shortAnswer',
                        question: q.question,
                        passage: q.passage,
                        explanation: q.explanation,
                        detailType: q.detailType,
                        interest: q.interest,
                        diffGrade: q.diffGrade,
                        diffTier: q.diffTier,
                        correctAnswer: q.correctAnswer,
                        options: q.choices?.map(choice => choice.choiceText) || []
                    }));
                    console.log("Formatted default questions:", questionsData);
                }

                console.log("Final questions data:", questionsData);
                setQuestions(questionsData);
                setLoading(false);
            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message || 'Failed to load questions');
                setLoading(false);
            }
        };

        initializeGame();
    }, [userId, isCustomSet, customQuestions, setId]);

    // 현재 문제 업데이트
    useEffect(() => {
        if (questions.length > 0 && currentQuestionNumber > 0) {
            setCurrentQuestion(questions[currentQuestionNumber - 1]);
        }
    }, [questions, currentQuestionNumber]);

    // 타이머 관리
    useEffect(() => {
        let timer;
        if (sessionIdentifier) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        handleTimeExpired();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [sessionIdentifier]);

    // 게임 종료 처리
    useEffect(() => {
        const completeSession = async () => {
            if (sessionIdentifier && (isGameOver || isGameClear)) {
                try {
                    await api.post(`/api/answers/session/${sessionIdentifier}/complete`);
                } catch (error) {
                    console.error('Failed to complete session:', error);
                }
            }
        };

        completeSession();
    }, [isGameOver, isGameClear, sessionIdentifier]);

    // 문제 렌더링 함수
    const renderQuestion = () => {
        if (!currentQuestion) return null;

        switch (currentQuestion.type) {
            case 'multipleChoice':
                return (
                    <div className="flex h-full w-full">
                        {/* 왼쪽 패널: 지문과 문제 */}
                        <div
                            className="w-1/2 h-full border-r-2 border-gray-200 p-6 flex flex-col overflow-auto custom-scrollbar">
                            {/* 문제 */}
                            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-row justify-between">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {currentQuestion.question}
                                </h2>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="bg-transparent m-0 p-0">
                                            <h2 className="text-xl font-semibold text-gray-800 hover:text-gray-500">
                                                Bronze-4
                                            </h2>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Bronze-4 의 난이도 입니다.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            {/* Passage 섹션 */}
                            {currentQuestion.passage && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                                    <h3 className="text-lg kanit-semibold mb-2 text-gray-700">Passage</h3>
                                    {currentQuestion.passage.includes('A:') || currentQuestion.passage.includes('B:') ? (
                                        // 대화형 passage인 경우
                                        <div className="space-y-4">
                                            {currentQuestion.passage.split(/(?=[AB]:)/).map((line, index) => {
                                                const speaker = line.trim().startsWith('A:') ? 'A' : 'B';
                                                const content = line.replace(/^[AB]:/, '').trim();

                                                return (
                                                    <div key={index}
                                                         className={`flex items-start gap-2 ${speaker === 'B' ? 'flex-row-reverse' : ''}`}>
                                                        <div
                                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${speaker === 'A' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                                            <span className="text-white font-bold">{speaker}</span>
                                                        </div>
                                                        <div
                                                            className={`max-w-[75%] p-3 rounded-lg ${speaker === 'A' ? 'bg-white shadow-sm rounded-tl-none border border-gray-100' : 'bg-white shadow-sm rounded-tr-none border border-gray-100'}`}>
                                                            <p className="kanit-regular text-lg leading-relaxed">
                                                                {content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        // 일반 passage인 경우
                                        <p className="kanit-regular text-lg text-gray-600 leading-relaxed">
                                            {currentQuestion.passage}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 오른쪽 패널: 선택지들 */}
                        <div className="w-1/2 h-full p-6">
                            <div className="grid grid-cols-2 gap-4 h-full">
                                {currentQuestion.options.map((option, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => !showFeedback && handleAnswer(index)}
                                        onMouseEnter={() => showFeedback && selectedAnswer === index && setHoveredAnswer(index)}
                                        onMouseLeave={() => setHoveredAnswer(null)}
                                        className={`relative rounded-lg shadow-md transition-all duration-300 hover:shadow-lg flex flex-col ${showFeedback && selectedAnswer !== index ? 'cursor-not-allowed opacity-50' : ''}`}
                                        style={{
                                            backgroundColor: colors[index],
                                            minHeight: '120px',
                                            height: 'auto'
                                        }}
                                        whileHover={!showFeedback || selectedAnswer === index ? {scale: 1.02} : {}}
                                        whileTap={!showFeedback || selectedAnswer === index ? {scale: 0.98} : {}}
                                    >

                                        <div className="w-full h-full flex flex-col items-center justify-start p-4">
                                            <span className="text-2xl font-bold mb-2 text-white shrink-0">
                                                {['A', 'B', 'C', 'D'][index]}
                                            </span>
                                            <p className="text-lg text-white w-full px-4 overflow-y-auto max-h-[120px] custom-scrollbar">
                                                {option}
                                            </p>
                                        </div>

                                        <AnimatePresence>
                                            {showFeedback && selectedAnswer === index && (
                                                <motion.div
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    exit={{opacity: 0}}
                                                    className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center"
                                                    onMouseEnter={() => setHoveredAnswer(index)}
                                                    onMouseLeave={() => setHoveredAnswer(null)}
                                                >
                                                    {showAnimation && (
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center">
                                                            <Lottie
                                                                options={feedback === true ? correctOptions : incorrectOptions}
                                                                height={200}
                                                                width={200}
                                                                isClickToPauseDisabled={true}
                                                            />
                                                        </div>
                                                    )}

                                                    {hoveredAnswer === index && (
                                                        <motion.div
                                                            initial={{opacity: 0, y: 10}}
                                                            animate={{opacity: 1, y: 0}}
                                                            exit={{opacity: 0, y: 10}}
                                                            className="absolute bottom-4 flex gap-4 z-50"
                                                        >
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowExplanation(true);
                                                                }}
                                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                            >
                                                                해설 보기
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleNextQuestion();
                                                                }}
                                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                            >
                                                                다음 문제
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'shortAnswer':
                return (
                    <div className="flex h-full w-full">
                        {/* 왼쪽 패널: 지문과 문제 */}
                        <div
                            className="w-1/2 h-full border-r-2 border-gray-200 p-6 flex flex-col overflow-auto custom-scrollbar">
                            {/* 문제 */}
                            <div
                                className="bg-white p-4 rounded-lg shadow-sm flex flex-row justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {currentQuestion.question}
                                </h2>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="bg-transparent m-0 p-0">
                                            <h2 className="text-xl font-semibold text-gray-800 hover:text-gray-500">
                                                Bronze-4
                                            </h2>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Bronze-4 의 난이도 입니다.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Passage 섹션 */}
                            {currentQuestion.passage && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                                    <h3 className="text-lg kanit-semibold mb-2 text-gray-700">Passage</h3>
                                    {currentQuestion.passage.includes('A:') || currentQuestion.passage.includes('B:') ? (
                                        // 대화형 passage인 경우
                                        <div className="space-y-4">
                                            {currentQuestion.passage.split(/(?=[AB]:)/).map((line, index) => {
                                                const speaker = line.trim().startsWith('A:') ? 'A' : 'B';
                                                const content = line.replace(/^[AB]:/, '').trim();

                                                return (
                                                    <div key={index} className={`flex items-start gap-2 ${speaker === 'B' ? 'flex-row-reverse' : ''}`}>
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${speaker === 'A' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                                            <span className="text-white font-bold">{speaker}</span>
                                                        </div>
                                                        <div className={`max-w-[75%] p-3 rounded-lg ${speaker === 'A' ? 'bg-white shadow-sm rounded-tl-none border border-gray-100' : 'bg-white shadow-sm rounded-tr-none border border-gray-100'}`}>
                                                            <p className="kanit-regular text-lg leading-relaxed">
                                                                {content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        // 일반 passage인 경우
                                        <p className="kanit-regular text-lg text-gray-600 leading-relaxed">
                                            {currentQuestion.passage}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 오른쪽 패널: 답안 입력 */}
                        <div className="w-1/2 h-full p-6 flex flex-col items-center justify-center relative">
                            <div className="w-full max-w-md">
                                {/* 힌트 표시 */}
                                <div className="text-center mb-4">
                                    <p className="text-2xl font-mono tracking-wider">
                                        {generateHint(currentQuestion.correctAnswer)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Fill in the blank with the correct answer
                                    </p>
                                </div>

                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAnswer(userAnswer)}
                                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none text-center font-mono tracking-wider"
                                    placeholder="Type your answer..."
                                    disabled={showFeedback}
                                    maxLength={currentQuestion.correctAnswer.length}
                                />

                                <motion.button
                                    onClick={() => handleAnswer(userAnswer)}
                                    className="w-full p-4 bg-blue-500 text-white rounded-lg text-lg font-semibold"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={showFeedback}
                                >
                                    Submit
                                </motion.button>

                                <AnimatePresence>
                                    {showFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                            onMouseEnter={() => setHoveredAnswer(true)}
                                            onMouseLeave={() => setHoveredAnswer(false)}
                                        >
                                            <div className={`absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center`}>
                                                {showAnimation && (
                                                    <div className="mb-4">
                                                        <Lottie
                                                            options={feedback ? correctOptions : incorrectOptions}
                                                            height={200}
                                                            width={200}
                                                            isClickToPauseDisabled={true}
                                                        />
                                                    </div>
                                                )}

                                                {hoveredAnswer && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="flex gap-4 mt-4"
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowExplanation(true);
                                                            }}
                                                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium"
                                                        >
                                                            해설 보기
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleNextQuestion();
                                                            }}
                                                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
                                                        >
                                                            다음 문제
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // 로딩 상태 표시
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // 에러 상태 표시
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-600 text-xl mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    // 게임 오버 상태 표시
    if (isGameOver) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full"
            >
                <h2 className="text-4xl font-bold text-red-600 mb-8">Game Over</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={onRestart}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/main')}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        Main Menu
                    </button>
                </div>
            </motion.div>
        );
    }

    // 게임 클리어 상태 표시
    if (isGameClear) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full"
            >
                <h2 className="text-4xl font-bold text-green-600 mb-8">Game Clear!</h2>
                <div className="flex space-x-4">
                    <button
                        onClick={onRestart}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={() => navigate('/main')}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        Main Menu
                    </button>
                </div>
            </motion.div>
        );
    }

    // 기본 렌더링
    return (
        <div className="h-full w-full overflow-visible bg-gray-50 relative">
            <motion.div
                className="flex h-full"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 1.2,
                    ease: "easeOut"
                }}
            >
                <div className="flex-1">
                    {renderQuestion()}
                </div>

                {/* 해설 모달 */}
                <AnimatePresence>
                    {showExplanation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-visible"
                            onClick={() => setShowExplanation(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: -20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                                className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 absolute top-[-50%] transform -translate-x-1/2"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-xl text-gray-700">💡 해설</h4>
                                    <button
                                        onClick={() => setShowExplanation(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="text-lg text-gray-600 leading-relaxed">
                                    <p className="whitespace-pre-line break-words">
                                        {currentQuestion?.explanation}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default GameProgressPage;