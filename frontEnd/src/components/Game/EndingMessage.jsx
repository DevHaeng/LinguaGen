import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

// 비디오 import
import Clear1 from '@/assets/TutorialLipSync/Clear_1.webm';
import Clear2 from '@/assets/TutorialLipSync/Clear_2.webm';
import Clear3 from '@/assets/TutorialLipSync/Clear_3.webm';
import GameOver1 from '@/assets/TutorialLipSync/GameOver_1.webm';
import GameOver2 from '@/assets/TutorialLipSync/GameOver_2.webm';
import GameOver3 from '@/assets/TutorialLipSync/GameOver_3.webm';

const EndingMessage = ({ isGameClear, onFinish }) => {
    const [messageStep, setMessageStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const clearMessages = [
        { text: "축하해! 보스를 물리쳤어!", video: Clear1 },
        { text: "네 덕분에 마을이 평화로워졌어!", video: Clear2 },
        { text: "더욱 강해져서 이세계의 최강자가 될 수있을거야!", video: Clear3 },
    ];

    const gameOverMessages = [
        { text: "아쉽게도 보스를 물리치지 못했어...", video: GameOver1 },
        { text: "하지만 괜찮아! 다음에 다시 도전하면 되니까!", video: GameOver2 },
        { text: "더 강해져서 돌아오자!", video: GameOver3 },
    ];

    const messages = isGameClear ? clearMessages : gameOverMessages;

    const handleClick = () => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        if (messageStep < messages.length - 1) {
            setMessageStep(prev => prev + 1);
        } else {
            onFinish();
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
                        key={messageStep} // 메시지가 바뀔 때마다 비디오를 새로 로드
                        autoPlay 
                        className="w-full h-full object-contain"
                    >
                        <source src={messages[messageStep].video} type="video/webm" />
                        Your browser does not support the video tag.
                    </video>
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
                                        sequence={[messages[messageStep].text]}
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

export default EndingMessage;
