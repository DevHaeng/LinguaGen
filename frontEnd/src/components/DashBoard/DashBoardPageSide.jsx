import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const Item = styled.div`
  display: list-item;
  list-style-position: inside;
  padding: 14px;
  font-weight: bold;
  color: ${({ isActive }) => (isActive ? 'black' : '#5a5255')};
  cursor: pointer;
  user-select: none;
  &:hover {
    color: ${({ isActive }) => (isActive ? 'black' : 'black')};
  }
  transition: color 0.3s ease;
`;

const DashBoardPageSide = ({ activePanel, setActivePanel }) => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState(''); // 닉네임 상태 정의
    const [gameCount, setGameCount] = useState(null); // 게임 횟수 상태 정의
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 정의
    const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태 정의
    const [averageCorrectRate, setAverageCorrectRate] = useState(null); // 평균 정답률 상태 정의

    useEffect(() => {
        const fetchData = async () => {
            const user = sessionStorage.getItem('user');
            if (user) {
                setIsLoggedIn(true);
                const userData = JSON.parse(user);

                try {
                    // 사용자 정보 가져오기
                    const userResponse = await axios.get(`http://localhost:8085/api/users/${userData.id}`, { withCredentials: true });
                    setUserInfo(userResponse.data);
                    setNickname(userResponse.data.nickname); // 닉네임 설정

                    // 게임 진행 수 가져오기
                    const gradeResponse = await axios.get(`http://localhost:8085/api/study-log/game-count/${userData.id}`, { withCredentials: true });
                    setGameCount(gradeResponse.data); // 전체 객체 대신 특정 필드 사용 가능

                    // 평균 정답률 가져오기
                    const correctRateResponse = await axios.get(`http://localhost:8085/api/study-log/average-correct-rate/${userData.id}`, { withCredentials: true });
                    setAverageCorrectRate(correctRateResponse.data); // 평균 정답률 설정
                } catch (error) {
                    console.error('Error fetching user or game count data:', error);
                }
            }
        };

        fetchData();
    }, []);

    return (
        <div className='flex flex-col items-center justify-start w-80 border-2 border-gray-300 rounded-lg jua-regular' style={{backdropFilter : 'blur(15px)' , background : 'rgba(255, 255, 255, 0.2', height : 'auto'}}>
            <div className='flex flex-col items-start justify-between w-full h-48 pt-4 p-4'>
                <Avatar className='w-20 h-20 ml-4'>
                    <AvatarImage
                        src={"https://github.com/shadcn.png"}
                        alt="프로필 이미지"
                        onClick={() => navigate('/mypage?tab=accountSettings')}
                        style={{ cursor: 'pointer' }}
                    />
                    <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                {/* 닉네임 표시 */}
                <p className='text-center w-1/2 mt-4 kanit-regular'>{nickname || 'Guest'}</p>
            </div>
            <Separator className='w-full mt-8 mb-8 border-2' />
            <div className='flex flex-row justify-between w-full'>
                <div className='flex flex-col w-full h-12 items-center justify-start'>
                    <p className='font-bold'> 게임 진행 수</p>
                    {/* gameCount의 특정 필드를 출력 */}
                    <p>{gameCount ? gameCount : '-'}</p>
                </div>
                <div className='flex flex-col w-full h-12 items-center justify-start'>
                    <p className='font-bold'> 평균 정답률</p>
                    {/* 평균 정답률 출력 */}
                    <p>{averageCorrectRate !== null ? `${Math.floor(averageCorrectRate * 100)}%` : '-'}</p>
                </div>
            </div>
            <Separator className='w-full mt-8 mb-8 border-2'/>
            <div className='flex flex-col w-full h-full items-start justify-start text-xl'>
            <Item
                    isActive={activePanel === 'dashboard'}
                    onClick={() => setActivePanel('dashboard')}
                >
                    대시보드
                </Item>
                <Item
                    isActive={activePanel === 'badge'}
                    onClick={() => setActivePanel('badge')}
                    style={{marginBottom : '45px'}}
                >
                    뱃지 / 업적
                </Item>
            </div>
        </div>
    );
};

export default DashBoardPageSide;
