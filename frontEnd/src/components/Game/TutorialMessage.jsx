import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

const TutorialMessage = ({ onStart, setIsHighlightingHealthBar, setIsHighlightingSoundButton }) => {
  const [messageStep, setMessageStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef(null);
  
  const HEALTH_BAR_MESSAGE_INDEX = 4;
  const SOUND_BUTTON_MESSAGE_INDEX = 5;
  
  const messages = [
    "안녕! 링구아젠에 온 것을 환영해!",
    "나는 너의 게임을 도와줄 이블이라고해!",
    "정의의 기사는 영어밖에 알아먹지 못해!",
    "만약 정답을 잘못 알려주면 보스를 잡지 못할꺼야!",
    "여기는 보스와 내 피를 보여주는 체력바야! 체력바가 0이 되면 게임이 끝나!",
    "만약 듣기 문제를 풀고 있다면 여기를 눌러서 사운드를 끄면 돼",
    "이제 게임을 시작해볼까?",
  ];

  useEffect(() => {
    // 비디오 소스 업데이트 및 재생
    if (videoRef.current) {
      videoRef.current.src = `/src/assets/TutorialLipSync/${messageStep + 1}_Message.mp4`;
      videoRef.current.volume = 1.0;
      videoRef.current.play().catch(error => {
        console.log("비디오 재생 에러:", error);
      });
    }
  }, [messageStep]);

  useEffect(() => {
    setIsHighlightingHealthBar(messageStep === HEALTH_BAR_MESSAGE_INDEX);
    setIsHighlightingSoundButton(messageStep === SOUND_BUTTON_MESSAGE_INDEX);
  }, [messageStep, setIsHighlightingHealthBar, setIsHighlightingSoundButton]);

  const handleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    if (messageStep < messages.length - 1) {
      setMessageStep(prev => prev + 1);
    } else {
      onStart();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full flex items-center justify-center text-black z-50"
      onClick={handleClick}
    >
      <div className="relative flex items-center w-[800px]">
        <div className="w-56 h-56 flex-shrink-0">
          <video 
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
          />
        </div>
        
        <div className="flex-grow min-w-0">
          <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
            <motion.div 
              key={messageStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="ml-6"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg relative inline-block max-w-[500px]">
                <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-r-[30px] border-r-white border-b-[15px] border-b-transparent" />
                </div>
                
                <div className="break-keep">
                  <TypeAnimation
                    sequence={[messages[messageStep]]}
                    wrapper="p"
                    speed={50}
                    className="text-xl font-antiquityPrint"
                    cursor={false}
                  />
                </div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-sm text-gray-500 mt-4 text-center"
                >
                  클릭하여 계속하기
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TutorialMessage;
