import React, { useState } from 'react';
import styled from 'styled-components';
import Switch from '../Switch.jsx'; // 커스텀 Switch 컴포넌트 가져오기

const NotificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent;
  padding: 20px;
  border-radius: 8px;
`;

const NotificationTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const NotificationDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
`;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1f5f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
`;

const NotificationText = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationName = styled.p`
  font-weight: bold;
  font-size: 16px;
`;

const NotificationDetail = styled.p`
  font-size: 14px;
  color: #6b7280;
`;

const NotificationPanel = () => {
  const [enabled, setEnabled] = useState({
    notice: true,
    lecture: true,
    comment: true,
    promotion: true,
  });

  // 스위치 상태 변경 핸들러
  const toggleSwitch = (id) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className='w-full h-[calc(100vh-200px)]'>  
      <NotificationContainer>
        <NotificationTitle>알림 설정</NotificationTitle>
      <NotificationDescription>
        이메일 수신 여부를 설정할 수 있어요. 회의안 변경, 결제내역 등 필수적으로 안내되어야 하는 내용은 수신여부와 상관없이 계속 발송됩니다.
      </NotificationDescription>

      <NotificationItem>
        <NotificationText>
          <NotificationName>공지사항</NotificationName>
          <NotificationDetail>중요한 공지사항, 기능 업데이트 등 새로운 인프런 소식을 받을 수 있어요.</NotificationDetail>
        </NotificationText>
        <Switch checked={enabled.notice} onChange={() => toggleSwitch('notice')} />
      </NotificationItem>

      <NotificationItem>
        <NotificationText>
          <NotificationName>강의 새소식</NotificationName>
          <NotificationDetail>수강 중인 강의의 지식공유자가 보내는 강의 새소식 알림을 받을 수 있어요.</NotificationDetail>
        </NotificationText>
        <Switch checked={enabled.lecture} onChange={() => toggleSwitch('lecture')} />
      </NotificationItem>

      <NotificationItem>
        <NotificationText>
          <NotificationName>커뮤니티 댓글</NotificationName>
          <NotificationDetail>작성한 게시글의 댓글, 대댓글이 등록될 때 알림을 받을 수 있어요.</NotificationDetail>
        </NotificationText>
        <Switch checked={enabled.comment} onChange={() => toggleSwitch('comment')} />
      </NotificationItem>

      <NotificationItem>
        <NotificationText>
          <NotificationName>인프런 소식 및 홍보</NotificationName>
          <NotificationDetail>할인, 이벤트, 강의추천 등 유용한 정보를 알려주는 소식을 받을 수 있어요.</NotificationDetail>
        </NotificationText>
        <Switch checked={enabled.promotion} onChange={() => toggleSwitch('promotion')} />
      </NotificationItem>
        </NotificationContainer>
    </div>
  );
};

export default NotificationPanel;
