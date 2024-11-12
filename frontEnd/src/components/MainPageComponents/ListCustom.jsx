import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Player } from '@lottiefiles/react-lottie-player';
import ClickAnimation from '../../assets/LottieAnimation/ClickAnimation.json';
import FatiguePopup from './FatiguePopup';
import { useNavigate } from 'react-router-dom';
import DungeonCanvas from '../Game/DungeonCanvas';
import RuinsCanvas from '../Game/RuinsCanvas';
import MountainCanvas from '../Game/MountainCanvas';
import useStore from '../../store/useStore';
import { CustomAlertDialog } from "@/components/popup";

const ListCustom = () => {
  const {
    increaseFatigue,
    fatigue,
    setCurrentQuestions,
    setSelectedQuestionSet: storeSetSelectedQuestionSet,
    resetGameProgress,
    resetGame
  } = useStore();
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [showFatiguePopup, setShowFatiguePopup] = useState(false);
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: "",
    description: ""
  });
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [canvasValue, setCanvasValue] = useState(null);
  const [questionSets, setQuestionSets] = useState([]);
  const canvases = [DungeonCanvas, RuinsCanvas, MountainCanvas];



// getTierColor 함수 수정
  const getTierColor = (grade) => {
    switch (grade) {
      case '브론즈':
        return 'bg-[#B87333]/10 text-[#B87333] hover:bg-[#B87333]/20 border-[#B87333]'; // 청동색
      case '실버':
        return 'bg-[#C0C0C0]/10 text-[#808080] hover:bg-[#C0C0C0]/20 border-[#C0C0C0]'; // 은색
      case '골드':
        return 'bg-[#FFD700]/10 text-[#DAA520] hover:bg-[#FFD700]/20 border-[#FFD700]'; // 금색
      case '플래티넘':
        return 'bg-[#E5E4E2]/10 text-[#7B9095] hover:bg-[#E5E4E2]/20 border-[#E5E4E2]'; // 백금색
      case '다이아몬드':
        return 'bg-[#B9F2FF]/10 text-[#00A2E8] hover:bg-[#B9F2FF]/20 border-[#B9F2FF]'; // 다이아몬드 블루
      case '챌린저':
        return 'bg-gradient-to-r from-purple-500/10 to-red-500/10 text-red-500 hover:from-purple-500/20 hover:to-red-500/20 border-red-500'; // 그라데이션
      default:
        return 'bg-gray-100';
    }
  };

  // API에서 문제 세트 불러오기
  useEffect(() => {
    const fetchQuestionSets = async () => {
      try {
        const response = await fetch('http://localhost:8085/api/user-questions/sets', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch question sets');
        const data = await response.json();
        setQuestionSets(data);
      } catch (error) {
        console.error('Error fetching question sets:', error);
        showAlert(
            "데이터 로딩 실패",
            "문제 세트를 불러오는데 실패했습니다."
        );
      }
    };

    fetchQuestionSets();
  }, []);

  const showAlert = (title, description) => {
    setAlertDialog({
      isOpen: true,
      title,
      description
    });
  };

  // handleQuestionSetSelect 수정
  const handleQuestionSetSelect = async (set) => {
    if (selectedQuestionSet?.id === set.id) {
      setSelectedQuestionSet(null);
      storeSetSelectedQuestionSet(null);  // store 상태 업데이트
      try {
        await fetch('http://localhost:8085/api/user-questions/deselect-set', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error deselecting question set:', error);
      }
    } else {
      setSelectedQuestionSet(set);
      storeSetSelectedQuestionSet(set);  // store 상태 업데이트
      try {
        const response = await fetch('http://localhost:8085/api/user-questions/select-set', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ setId: set.id })
        });

        if (!response.ok) {
          throw new Error('Failed to select question set');
        }
      } catch (error) {
        console.error('Error selecting question set:', error);
        showAlert(
            "선택 실패",
            "문제 세트 선택에 실패했습니다."
        );
      }
    }
  };

  const handleButtonClick = (e) => {
    // 문제 세트가 선택되지 않은 경우
    if (!selectedQuestionSet) {
      showAlert(
          "문제 세트 필요",
          "게임을 시작하기 전에 문제 세트를 선택해주세요."
      );
      return;
    }

    // 피로도가 100%일 때
    if (fatigue >= 100) {
      setShowFatiguePopup(true);
      return;
    }

    if (showAnimation || isExiting) return;

    const buttonRect = e.currentTarget.getBoundingClientRect();
    setAnimationPosition({
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2
    });

    setShowAnimation(true);
    setIsExiting(false);

    setTimeout(() => {
      setShowAnimation(false);
      setIsExiting(true);

      setTimeout(() => {
        handleStartGame();
      }, 500);
    }, 1000);
  };

  // handleStartGame 수정
  const handleStartGame = useCallback(async () => {
    if (!selectedQuestionSet) return;

    try {
      // 문제 세트 가져오기
      const response = await fetch(`http://localhost:8085/api/user-questions/sets/${selectedQuestionSet.id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const questions = await response.json();
      console.log("Fetched questions:", questions);

      // 게임 상태 초기화
      resetGame();
      resetGameProgress();

      // 피로도 증가
      increaseFatigue(5);

      // 랜덤 캔버스 선택
      const randomCanvas = canvases[Math.floor(Math.random() * canvases.length)];
      setCanvasValue(randomCanvas);

      // 로딩 화면으로 이동
      navigate('/loading');

      // 게임 화면으로 이동
      const timer = setTimeout(() => {
        if (randomCanvas === DungeonCanvas) {
          navigate('/dungeon', {
            state: {
              setId: selectedQuestionSet.id,
              questions: questions,
              isCustomSet: true  // 커스텀 세트임을 표시
            }
          });
        } else if (randomCanvas === MountainCanvas) {
          navigate('/mountain', {
            state: {
              setId: selectedQuestionSet.id,
              questions: questions,
              isCustomSet: true
            }
          });
        } else if (randomCanvas === RuinsCanvas) {
          navigate('/ruins', {
            state: {
              setId: selectedQuestionSet.id,
              questions: questions,
              isCustomSet: true
            }
          });
        }
      }, 3000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error starting game:', error);
      showAlert(
          "오류 발생",
          "게임 시작 중 오류가 발생했습니다."
      );
    }
  }, [navigate, increaseFatigue, selectedQuestionSet, resetGame, resetGameProgress]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
      <div className="p-6 space-y-6 h-screen flex flex-col overflow-hidden">
        <div className="space-y-2 flex flex-row justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Question Sets</h2>
            <p className="text-gray-500">생성한 15문제 세트들을 관리하고 선택하세요.</p>
            <p className="text-sm text-gray-400">
              {selectedQuestionSet ? "문제 세트가 선택되었습니다." : "게임을 시작하려면 문제 세트를 선택하세요."}
            </p>
          </div>
          <div className="mr-8">
            <Button
                onClick={handleButtonClick}
                className="w-30 h-12 text-white rounded-md font-bold text-xl hover:scale-125 transition-all duration-500 jua-regular"
                disabled={showAnimation || isExiting || !selectedQuestionSet}
            >
              게임 시작하기
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid gap-4 pb-20">
            {questionSets.map((set) => (
                <Card
                    key={set.id}
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                        selectedQuestionSet?.id === set.id ? 'border-2 border-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => handleQuestionSetSelect(set)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{set.topic}</CardTitle>
                        <CardDescription>생성일: {formatDate(set.createdAt)}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">{set.questionType}</Badge>
                        <Badge variant="secondary">15문제</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge className={getTierColor(set.grade)} variant="secondary">
                          {set.grade}
                        </Badge>
                        {set.grade !== '챌린저' && (
                            <Badge variant="outline" className={getTierColor(set.grade)}>
                              {set.tier}티어
                            </Badge>
                        )}
                      </div>
                      <Badge>{set.detailType}</Badge>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>

        {showAnimation && (
            <div
                className="fixed pointer-events-none"
                style={{
                  left: animationPosition.x - 100,
                  top: animationPosition.y - 100,
                  width: '200px',
                  height: '200px',
                  zIndex: 100
                }}
            >
              <Player
                  ref={playerRef}
                  autoplay
                  keepLastFrame={false}
                  src={ClickAnimation}
                  style={{width: '200px', height: '200px'}}
                  onComplete={() => {
                    setShowAnimation(false);
                  }}
              />
            </div>
        )}

        {showFatiguePopup && (
            <FatiguePopup onClose={() => setShowFatiguePopup(false)}/>
        )}

        <CustomAlertDialog
            isOpen={alertDialog.isOpen}
            onClose={() => setAlertDialog(prev => ({...prev, isOpen: false}))}
            title={alertDialog.title}
            description={alertDialog.description}
        />
      </div>
  );
};

export default ListCustom;