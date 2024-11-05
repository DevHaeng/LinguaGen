import React, {useEffect, useState} from 'react'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.jsx"

import WeeklyLearning from '../WeeklyLearning.jsx';
import HeatMap from '../HeatMap.jsx'
import CustomLineChart from '../CustomLineChart.jsx'
import CustomRadicalChart from '../CustomRadicalChart.jsx';

import BronzeTier from "../../assets/imgs/Tiers/Bronze Tier.png";
import SilverTier from "../../assets/imgs/Tiers/Silver TIer.png";
import GoldTier from "../../assets/imgs/Tiers/Gold Tier.png";
import PlatinumTier from "../../assets/imgs/Tiers/Platinum Tier.png";
import DiamondTier from "../../assets/imgs/Tiers/Diamond Tier.png";
import ChellengerTier from "../../assets/imgs/Tiers/Chellenger Tier.png";
import axios from "axios";


const MistakeWord = [
    {
        id: 1,
        word: 'abandon',
        percentage: '48%',
        meaning: '버리다'
    },
    {
        id: 2,
        word: 'mistake',
        percentage: '21%',
        meaning: '실수'
    },
    {
        id: 3,
        word: 'slack',
        percentage: '18%',
        meaning: '망치'
    },
    {
        id: 4,
        word: 'illigal',
        percentage: '12%',
        meaning: '불법'
    },
    {
        id: 5,
        word: 'stash',
        percentage: '10%',
        meaning: '창고'
    },
    {
        id: 6,
        word: 'branch',
        percentage: '7%',
        meaning: '가지'
    },

]

const gradeNames = {
    1: "Bronze",
    2: "Silver",
    3: "Gold",
    4: "Platinum",
    5: "Diamond",
    6: "Chellenger"
};

const tierImages = {
    1: BronzeTier,
    2: SilverTier,
    3 : GoldTier,
    4 : PlatinumTier,
    5 : DiamondTier,
    6 : ChellengerTier
};


const DashBoardPanel = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [userExp, setUserExp] = useState(0);
    const [userGrade, setUserGrade] = useState(null);
    const [userGradeString, setUserGradeString] = useState(null);
    const [userTier, setUserTier] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [latestStudyInfo, setLatestStudyInfo] = useState(null); // 최신 학습 정보 상태 추가


    useEffect(() => {
        const fetchUserData = async () => {
            const user = sessionStorage.getItem('user');
            if (user) {
                setIsLoggedIn(true);
                const userData = JSON.parse(user);
                try {
                    // 사용자 정보 가져오기
                    const userResponse = await axios.get(`http://localhost:8085/api/users/${userData.id}`, {withCredentials: true});
                    setUserInfo(userResponse.data);

                    // 사용자의 등급 정보 가져오기
                    const gradeResponse = await axios.get(`http://localhost:8085/api/grade/${userData.id}`, {withCredentials: true});
                    const numericGrade = gradeResponse.data.grade;
                    setUserGrade(numericGrade);
                    setUserGradeString(gradeNames[numericGrade] || "알 수 없음");
                    setUserTier(gradeResponse.data.tier);
                    setUserExp(gradeResponse.data.exp);

                    // 최신 학습 정보 가져오기
                    const studyLogResponse = await axios.get(`http://localhost:8085/api/study-log/latest/${userData.id}`, { withCredentials: true });
                    setLatestStudyInfo(studyLogResponse.data);
                } catch (error) {
                    console.error('사용자 정보를 가져오는 중 오류 발생:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    const nextTierExp = 100;
    const remainingExp = nextTierExp - userExp;

    return (
        <div className='flex flex-col items-center justify-start w-auto ml-24 p-4 border-2 border-gray-300 rounded-lg min-h-[1400px]
            max-lg:ml-0 max-lg:w-full max-lg:min-h-[2650px]'
            style={{ backdropFilter: 'blur(15px)', background: 'rgba(255, 255, 255, 0.2' }}
        >
            <div className='w-full'>
                <h4 className='font-bold h-14 pt-0 pl-4' style={{fontSize : '24px'}}>대쉬보드</h4>
            </div>
            
            <div className='grid grid-cols-1 gap-8 w-full' style={{ width: '945px', maxWidth: '100%' }}>
                <div className='grid grid-cols-2 gap-4 max-lg:grid-cols-1'>
                    <div className='grid grid-rows-2 gap-4'>
                        <Card className='w-full h-[140px]'>
                            <CardHeader className='flex flex-row justify-between items-center py-2'>
                                <CardTitle className='text-lg'> 최근 Play </CardTitle>
                                <CardDescription style={{ cursor: 'pointer' }}> Play 내역 {'>'} </CardDescription>
                            </CardHeader>
                            <CardContent className='flex flex-col py-2'>
                                <p className='font-bold text-lg'>
                                    {latestStudyInfo ? (
                                        <>
                                            <span>{latestStudyInfo.questionType} </span>
                                           
                                                <img
                                                    src={tierImages[latestStudyInfo.difficultyGrade]}
                                                    alt={`${gradeNames[latestStudyInfo.difficultyGrade]} 이미지`}
                                                    className='inline-block w-5 h-5 ml-2'
                                                />
                                                {` Tier ${latestStudyInfo.difficultyTier}`}
                                            <span>{gradeNames[latestStudyInfo.difficultyGrade] || "Unknown Grade"}</span>
                                            <span> {` ${latestStudyInfo.difficultyTier}`}</span>
                                        </>
                                    ) : '로딩 중...'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className='w-full h-[140px]'>
                            <CardHeader className='flex flex-row justify-between items-center py-2'>
                                <CardTitle className='text-lg'> 현재 티어
                                    - {userGradeString && userTier ? `${userGradeString} ${userTier}` : '로딩 중...'}</CardTitle>
                            </CardHeader>
                            <CardContent className='flex flex-row items-center py-2'>
                                <img
                                    src={userTier === 1 ? tierImages[userGrade + 1] : tierImages[userGrade]}
                                    alt='Tier img'
                                    className='w-16 h-16'
                                />
                                <p className='font-bold text-sm ml-6'>
                                    {userTier === 1
                                        ? `다음 ${gradeNames[userGrade + 1]} 4 까지 남은 포인트: ${remainingExp > 0 ? remainingExp : 0}`
                                        : `다음 ${gradeNames[userGrade]} ${userTier - 1} 까지 남은 포인트: ${remainingExp > 0 ? remainingExp : 0}`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className='h-[300px]'>
                        <WeeklyLearning/>
                    </div>
                </div>

                <div className='w-full'>
                    <Card className='w-full'>
                        <CardHeader className='p-4 pl-8 text-md font-bold'>
                            <h2>1년간 Play</h2>
                        </CardHeader>
                        <CardContent>
                            <HeatMap />
                        </CardContent>
                    </Card>
                </div>

                <div className='grid grid-cols-3 gap-4 max-lg:grid-cols-1' style={{ height: '450px' }}>
                    <Card className='w-full h-full'>
                        <CardHeader className='p-4 pl-8 text-md font-bold border-b-2 border-gray-300'>
                            <h2>자주 틀린 단어</h2>
                        </CardHeader>
                        <CardContent className='mt-4'>
                            <ul>
                                {MistakeWord.map((word) => (
                                    <li key={word.id} className='flex flex-row items-center justify-between border-b-2 border-gray-300 mb-4 pb-4'>
                                        <p className='font-bold hover:scale-125 transition-all duration-300 cursor-pointer' style={{ userSelect: 'none' }}>{word.word}</p>
                                        <p className='text-sm text-gray-500' style={{ userSelect: 'none' }}>{word.percentage}</p>
                                        <p style={{ userSelect: 'none' }}>{word.meaning}</p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className='flex flex-row justify-end'>
                            <CardDescription style={{ cursor: 'pointer' }}>
                                더보기 {'>'}
                            </CardDescription>
                        </CardFooter>
                    </Card>
                    <CustomLineChart className='w-full h-full' />
                    <CustomRadicalChart className='w-full h-full' />
                </div>
            </div>
        </div>
    )
}

export default DashBoardPanel