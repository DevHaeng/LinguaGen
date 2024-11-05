import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import styled, { keyframes } from 'styled-components';
import MyPageSettingPanel from './MyPageSettingPanel'; // 계정 설정 패널
import MyPagePlayHistoryPanel from './MyPagePlayHistoryPanel'; // 플레이 내역 패널


// 사이드바 스타일
const SidebarContainer = styled.div`
  width: 20rem;
  padding: 20px;
  font-size: 16px;
  height: 545px;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.2);
  border: 1px white solid;
  border-radius: 8px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);

  @media (max-width: 951px) {
    display: none;
  }
`;

// 섹션 제목 스타일
const SectionTitle = styled.p`
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

// 리스트 스타일
const List = styled.ul`
  padding-left: 10px;
`;

// 리스트 아이템 스타일
const ListItem = styled.li`
  display: list-item;
  list-style-position: inside;
  padding: 14px;
  font-weight: bold;
  color: ${({ isActive }) => (isActive ? 'black' : '#5a5255')}; /* 클릭된 상태일 때 색상 변경 */
  cursor: pointer;
  user-select: none;
  &:hover {
    color: ${({ isActive }) => (isActive ? 'black' : 'black')}; /* hover 상태에서 색상 변경 */
  }
  transition: color 0.3s ease; /* 부드러운 색상 전환 애니메이션 */
`;

const BackgroundVideo = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 비디오가 화면에 맞도록 커버되도록 설정 */
  z-index: -1; /* 다른 요소 뒤에 배치 */
`;

// 페이드 인 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// 페이드 인 애니메이션을 적용한 컨테이너
const FadeInContainer = styled.div`
  animation: ${fadeIn} 1s ease-in-out;
`;

const MyPage = () => {
  const location = useLocation(); // useLocation으로 URL 정보 가져오기
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab'); // URL에서 'tab' 파라미터 읽기
  const [activePanel, setActivePanel] = useState(tabFromQuery || 'playHistory'); // 기본값을 'playHistory'로 설정

  useEffect(() => {
    if (tabFromQuery) {
      setActivePanel(tabFromQuery); // URL 쿼리 파라미터에 따라 activePanel 설정
    }
  }, [tabFromQuery]); // URL이 변경될 때마다 상태 업데이트
  const [inquiryDetails, setInquiryDetails] = useState(null); // 상세보기 상태

  const handleSelectInquiry = (title, content) => {
    setInquiryDetails({ title, content });
  };

  return (
    <FadeInContainer className='flex flex-col items-center justify-start h-screen w-full relative overflow-y-auto custom-scrollbar '>
      <BackgroundVideo autoPlay muted loop>
        <source src='src/assets/video/MainBackground.mp4' type='video/mp4' />
      </BackgroundVideo>
      <Header />
      
      {/* 메인 컨텐츠 영역을 grid로 구성 */}
      <main className='w-full h-min-screen grid grid-cols-12 gap-4 p-4 pt-0 mt-4 flex flex-col justify-start items-start'>
        {/* 왼쪽 사이드바 */}
        <div className='col-span-3 col-start-2 flex flex-col gap-8 items-center'>
          <div className='flex items-center justify-center mt-16'>
            <SidebarContainer>
              <SectionTitle className='jua-regular text-2xl'>기록</SectionTitle>
              <List className='jua-regular text-xl'>
                <ListItem
                  isActive={activePanel === 'playHistory'}
                  onClick={() => setActivePanel('playHistory')}
                >
                  내 플레이 내역
                </ListItem>
                <ListItem
                  isActive={activePanel === 'postHistory'}
                  onClick={() => setActivePanel('postHistory')}
                >
                  작성한 게시글
                </ListItem>
                <ListItem
                  isActive={activePanel === 'inquiryHistory'}
                  onClick={() => setActivePanel('inquiryHistory')}
                >
                  작성한 문의글
                </ListItem>
                <ListItem
                  isActive={activePanel === 'pointUsingHistory'}
                  onClick={() => setActivePanel('pointUsingHistory')}
                >
                  포인트 사용 내역
                </ListItem>
              </List>

              <SectionTitle className='jua-regular text-2xl' style={{ marginTop: '45px' }}>설정</SectionTitle>
              <List className='jua-regular text-xl'>
                <ListItem
                  isActive={activePanel === 'accountSettings'}
                  onClick={() => setActivePanel('accountSettings')}
                >
                  계정 설정
                </ListItem>
                <ListItem
                  isActive={activePanel === 'notificationSettings'}
                  onClick={() => setActivePanel('notificationSettings')}
                >
                  알림 설정
                </ListItem>
              </List>
            </SidebarContainer>
          </div>
        </div>

        {/* 오른쪽 메인 컨테이너 */}
        <div className='col-span-7 flex items-start justify-center mt-16 max-lg:col-span-12 max-lg:w-full'>
          {(activePanel === 'playHistory' || activePanel === 'postHistory' || activePanel === 'inquiryHistory' || activePanel === 'pointUsingHistory') && (
            <MyPagePlayHistoryPanel activePanel={activePanel} setActivePanel={setActivePanel} />
          )}
          {(activePanel === 'accountSettings' || activePanel === 'notificationSettings') && (
            <MyPageSettingPanel activePanel={activePanel} setActivePanel={setActivePanel} />
          )}
        </div>
      </main>
    </FadeInContainer>
  );
};

export default MyPage;
