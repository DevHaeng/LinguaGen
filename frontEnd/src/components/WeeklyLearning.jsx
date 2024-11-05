import React, { useState, useEffect } from 'react';
import { FaBellSlash, FaCog } from 'react-icons/fa';
import styled from 'styled-components';
import { Card } from '@/components/ui/card.jsx';
import play from '../assets/imgs/play.svg';
import timer from '../assets/imgs/timer.svg';
import axios from 'axios';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

const WeekLabel = styled.div`
  text-align: center;
  margin: 20px;
  font-size: 18px;
  font-weight: bold;
`;

const DaysContainer = styled.ul`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0;
  list-style: none;
`;

const DayItem = styled.li`
  text-align: center;
  flex: 1;
  position: relative;
`;

const DayCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => (props.studied ? '#00b894' : '#dee2e6')};
  margin: 0 auto 10px;
`;

const DayLabel = styled.p`
  font-size: 14px;
  color: ${props => (props.studied ? '#00b894' : '#6c757d')};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-right: 20px;
  position: relative;
`;

const FooterIcon = styled.div`
  margin-right: 5px;
`;

const WeeklyLearning = () => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];

    const englishToKoreanDayMap = {
        MONDAY: '월',
        TUESDAY: '화',
        WEDNESDAY: '수',
        THURSDAY: '목',
        FRIDAY: '금',
        SATURDAY: '토',
        SUNDAY: '일',
    };

    const [studiedDays, setStudiedDays] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 정의

    useEffect(() => {
        const fetchStudyLog = async () => {
            const user = sessionStorage.getItem('user');
            if (user) {
                setIsLoggedIn(true);
                const userData = JSON.parse(user);
                try {
                    const response = await axios.get(`http://localhost:8085/api/study-log/this-week/${userData.id}`, { withCredentials: true });

                    const koreanDays = response.data.map(day => englishToKoreanDayMap[day]);
                    setStudiedDays(koreanDays);
                } catch (error) {
                    console.error('Error fetching study log:', error);
                }
            }
        };

        fetchStudyLog();
    }, []);

    // 현재 주차 계산 함수
    const getWeekOfMonth = (date) => {
        const startWeekDayIndex = 1; // 월요일 시작
        const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstDay = firstDate.getDay() || 7;
        const offsetDate = date.getDate() + firstDay - startWeekDayIndex;
        return Math.ceil(offsetDate / 7);
    };

    const currentWeek = getWeekOfMonth(new Date());

  return (
    <Card className='w-full h-full px-10 pb-10 pt-4'>
      <Header style={{ marginBottom: '50px', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>주간 학습</span>
          <FaCog style={{ marginLeft: '10px', color: '#adb5bd', cursor: 'pointer' }} />
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            outline: 'none'
          }}
        >
          <FaBellSlash />
          <span style={{ marginLeft: '5px' }}>알림 설정</span>
        </button>
      </Header>

            <WeekLabel>
                {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {currentWeek}주차
            </WeekLabel>

            <DaysContainer style={{ marginBottom: '50px' }}>
                {days.map(day => (
                    <DayItem key={day}>
                        <DayCircle studied={studiedDays.includes(day)} />
                        <DayLabel studied={studiedDays.includes(day)}>{day}</DayLabel>
                    </DayItem>
                ))}
            </DaysContainer>

            <Footer style={{ userSelect: 'none' }}>
                <FooterItem>
                    <FooterIcon><img src={play} alt='play' /></FooterIcon>
                    <span>0</span>
                </FooterItem>
                <FooterItem>
                    <FooterIcon><img src={timer} alt='timer' /></FooterIcon>
                    <span>0분</span>
                </FooterItem>
            </Footer>
        </Card>
    );
};

export default WeeklyLearning;
