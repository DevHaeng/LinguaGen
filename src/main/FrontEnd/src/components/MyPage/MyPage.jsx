import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import styled from 'styled-components';
import MyPageSettingPanel from './MyPageSettingPanel'; // 계정 설정 패널
import MyPagePlayHistoryPanel from './MyPagePlayHistoryPanel'; // 플레이 내역 패널


// 사이드바 스타일
const SidebarContainer = styled.div`
  width: 210px;
  padding: 20px;
  font-size: 16px;
  height: 545px;
  backdrop-filter : blur(15px);
  background : rgba(255, 255, 255, 0.2);
  border : 2px gray solid;
  border-radius : 8px;
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
  color: ${({ isActive }) => (isActive ? '#bbf7d0' : 'black')}; /* 클릭된 상태일 때 색상 변경 */
  cursor: pointer;
  user-select: none;
  &:hover {
    color: ${({ isActive }) => (isActive ? '#bbf7d0' : '#bbf7d0')}; /* hover 상태에서 색상 변경 */
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
    <div className='flex flex-col items-center justify-start overflow-y-auto custom-scrollbar h-full w-full relative'>
      <BackgroundVideo autoPlay muted loop>
        <source src='src/assets/video/MainBackground.mp4' type='video/mp4' />
      </BackgroundVideo>
      <Header style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }} />
      <div className='flex flex-row items-start justify-center h-full w-3/4'>
        <div className='flex flex-col items-center justify-start w-1/4 h-full pt-20 pl-4'>
          <SidebarContainer>
            <SectionTitle>기록</SectionTitle>
            <List>
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

            <SectionTitle style={{ marginTop: '45px' }}>설정</SectionTitle>
            <List>
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

        {/* 선택된 패널에 따라 다른 컴포넌트를 렌더링 */}
        <div className='w-3/4 h-auto min-h-full'>
          {(activePanel === 'playHistory' || activePanel === 'postHistory' || activePanel === 'inquiryHistory' || activePanel === 'pointUsingHistory') && (
            <MyPagePlayHistoryPanel activePanel={activePanel} setActivePanel={setActivePanel} />
          )}
          {(activePanel === 'accountSettings' || activePanel === 'notificationSettings') && (
            <MyPageSettingPanel activePanel={activePanel} setActivePanel={setActivePanel} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
