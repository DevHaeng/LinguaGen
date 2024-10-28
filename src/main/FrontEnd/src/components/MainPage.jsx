import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import PracticeMenubar from './MainPageComponents/PracticeMenubar'; // PracticeMenubar 컴포넌트 불러오기
import ProfileCard from './MainPageComponents/ProfileCard';
import MainContainer from './MainPageComponents/MainContainer';
import WordCarousel from './WordCarousel';
import '../App.css'; // App.css 파일을 import 합니다.
import Header from './Header';
import useStore from '../store/useStore.js';
import { useNavigate } from 'react-router-dom';



const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const MainPageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: ${fadeInAnimation} 1s forwards;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 비디오가 화면에 맞도록 커버되도록 설정 */
  z-index: -1; /* 다른 요소 뒤에 배치 */
`;

function MainPage() {
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');
  const { setIsLoggedIn } = useStore();

  useEffect(() => {
    // 로그인 상태 확인
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    // 페이드 인 효과 시작
    setTimeout(() => setFadeIn(true), 100);
  }, [setIsLoggedIn]);

  return (
    <MainPageContainer>
      <BackgroundVideo autoPlay muted loop>
        <source src='src/assets/video/MainBackground.mp4' type='video/mp4' />
      </BackgroundVideo>
      <Header />
      
      {/* 메인 컨텐츠 영역을 grid로 구성 */}
      <main className='w-full h-full grid grid-cols-12 gap-4 p-4 pt-0 mt-4 '>
        {/* 왼쪽 사이드바 (프로필 카드 + 캐러셀) */}
        <div className='col-span-3 col-start-2 flex flex-col gap-8'>
          <div className='flex items-center justify-center'>
            <ProfileCard />
          </div>
          <div className='flex items-center justify-center'>
            <WordCarousel />
          </div>
        </div>

        {/* 오른쪽 메인 컨테이너 */}
        <div className='col-span-7 flex items-center justify-center'>
          <MainContainer selectedGame={selectedGame} />
        </div>
      </main>
    </MainPageContainer>
  );
}

export default MainPage;
