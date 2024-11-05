import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.jsx";
import MyPagePostHistoryPanel from './MyPagePostHistoryPanel.jsx';
import MyPageInquiryHistoryPanel from './MyPageInquiryHistoryPanel.jsx';
import MyPagePointUsingHistoryPanel from './MyPagePointUsingHistoryPanel.jsx';

// 슬라이드 탭 스타일 정의
const TabContainer = styled.div`
  position: relative;
  width: 100%;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
  padding-top: 16px;
`;

const Tab = styled.div`
  width: 120px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  padding: 8px 0;
  cursor: pointer;
  color: ${({ isActive }) => (isActive ? 'black' : '#5a5255')};
  transition: color 0.3s ease;
  user-select: none;
    &:hover {
    color: ${({ isActive }) => (isActive ? 'black' : 'black')}; /* hover 상태에서 색상 변경 */
  }
`;

const Slider = styled.div`
  position: absolute;
  bottom: 0;
  left: ${({ activeTab }) => {
        switch (activeTab) {
            case 'playHistory':
                return '0px';
            case 'postHistory':
                return '120px';
            case 'inquiryHistory':
                return '240px';
            case 'pointUsingHistory':
                return '360px';
            case 'accountSettings':
                return '480px';
            case 'notificationSettings':
                return '600px';
            default:
                return '0px';
        }
    }};
  width: 120px;
  height: 4px;
  background-color: #00b894;
  transition: left 0.3s ease;
`;

const Loader = styled.div`
  width: 50px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 8px solid;
  border-color: #000 #0000;
  animation: l1 1s infinite;

  @keyframes l1 {
    to {
      transform: rotate(.5turn);
    }
  }
`;

// 랜덤 숫자와 날짜, 티어 생성 함수
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = () => {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        .toISOString().split('T')[0];
};
const getRandomTier = () => {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger'];
    return `${tiers[getRandomNumber(0, tiers.length - 1)]} ${getRandomNumber(1, 4)}`;
};

// 임시 데이터 목록
const initialData = [
    { type: '리딩 유형', task: '주제/제목 찾기' },
    { type: '리딩 유형', task: '요지 파악' },
    { type: '리스닝 유형', task: '주제/제목 파악' },
    { type: '리스닝 유형', task: '세부 정보 듣기' },
    { type: '기타 유형', task: '문법 문제' },
    { type: '기타 유형', task: '어휘 문제' },
    { type: '문제 푸는 방법', task: '빈칸 채우기' },
    { type: '문제 푸는 방법', task: '사지선다' }
];

// 스타일 정의 - hover 시 공중에 뜨는 효과 추가
const Container = styled.div`
  height: 16rem;
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 애니메이션 효과 */
  user-select : none;
  
  &:hover {
    transform: translateY(-10px); /* 공중으로 뜨는 효과 */
    box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1); /* 그림자 효과 추가 */
  }
`;

const MyPagePlayHistoryPanel = ({ activePanel, setActivePanel }) => {
    // activeTab을 설정
    const activeTab = activePanel;

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleToggleChange = (value) => {
        setSelectedCategories((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value]
        );
    };

    const filteredData = data.filter(item => {
        if (selectedCategories.length === 0) return true;
        if (selectedCategories.includes('reading') && item.type === '리딩 유형') return true;
        if (selectedCategories.includes('listening') && item.type === '리스닝 유형') return true;
        if (selectedCategories.includes('ETC') && item.type === '기타 유형') return true;
        if (selectedCategories.includes('way') && item.type === '문제 푸는 방법') return true;
        return false;
    });

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading) {
                return;
            }
            loadMoreData();
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading]);

    const loadMoreData = () => {
        if (!hasMore) return;
        setIsLoading(true);

        setTimeout(() => {
            const moreData = initialData.map((item) => ({
                ...item,
                task: `${item.task} - 추가 ${getRandomNumber(1, 10)}`,
            }));
            setData((prevData) => [...prevData, ...moreData]);
            setIsLoading(false);

            if (data.length >= 50) {
                setHasMore(false);
            }
        }, 2000);
    };

    return (
        <>
            <div className='flex flex-col items-start justify-start h-full w-full ml-24 border-2 border-gray-300 rounded-lg max-lg:ml-0'
                style={{backdropFilter: 'blur(15px)', background: 'rgba(255, 255, 255, 0.2', height: 'auto'}}
            >
                {/* 탭 부분 */}
                <TabContainer>
                    {/* 모바일 버전 탭 - 모든 메뉴 표시 */}
                    <div className='hidden max-lg:flex w-full'>
                        <Tab
                            isActive={activeTab === 'playHistory'}
                            onClick={() => setActivePanel('playHistory')}
                        >
                            플레이 내역
                        </Tab>
                        <Tab
                            isActive={activeTab === 'postHistory'}
                            onClick={() => setActivePanel('postHistory')}
                        >
                            작성한 게시글
                        </Tab>
                        <Tab
                            isActive={activeTab === 'inquiryHistory'}
                            onClick={() => setActivePanel('inquiryHistory')}
                        >
                            작성한 문의글
                        </Tab>
                        <Tab
                            isActive={activeTab === 'pointUsingHistory'}
                            onClick={() => setActivePanel('pointUsingHistory')}
                        >
                            포인트 내역
                        </Tab>
                        <Tab
                            isActive={activeTab === 'accountSettings'}
                            onClick={() => setActivePanel('accountSettings')}
                        >
                            계정 설정
                        </Tab>
                        <Tab
                            isActive={activeTab === 'notificationSettings'}
                            onClick={() => setActivePanel('notificationSettings')}
                        >
                            알림 설정
                        </Tab>
                        <Slider activeTab={activeTab} />
                    </div>

                    {/* PC 버전 탭 - 기록 관련 탭만 표시 */}
                    <div className='flex max-lg:hidden w-full'>
                        <Tab
                            isActive={activeTab === 'playHistory'}
                            onClick={() => setActivePanel('playHistory')}
                        >
                            플레이 내역
                        </Tab>
                        <Tab
                            isActive={activeTab === 'postHistory'}
                            onClick={() => setActivePanel('postHistory')}
                        >
                            작성한 게시글
                        </Tab>
                        <Tab
                            isActive={activeTab === 'inquiryHistory'}
                            onClick={() => setActivePanel('inquiryHistory')}
                        >
                            작성한 문의글
                        </Tab>
                        <Tab
                            isActive={activeTab === 'pointUsingHistory'}
                            onClick={() => setActivePanel('pointUsingHistory')}
                        >
                            포인트 내역
                        </Tab>
                        <Slider activeTab={activeTab} />
                    </div>
                </TabContainer>

                {/* 기존 컨텐츠 부분 */}
                <div className='w-full mt-8 flex flex-col' style={{ height: '100%', marginBottom: '45px' }}>
                    {activeTab === 'playHistory' && (
                        <>
                            <div className='pb-10 w-full text-center font-bold text-xl'>
                                <p>플레이 내역</p>
                            </div>
                            <div className='flex flex-row justify-center items-start mb-14'>
                                <ToggleGroup type="multiple" variant='outline' className='gap-4'>
                                    <ToggleGroupItem
                                        value="reading"
                                        selected={selectedCategories.includes('reading')}
                                        onClick={() => handleToggleChange('reading')}
                                    >
                                        리딩 유형
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="listening"
                                        selected={selectedCategories.includes('listening')}
                                        onClick={() => handleToggleChange('listening')}
                                    >
                                        리스닝 유형
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="ETC"
                                        selected={selectedCategories.includes('ETC')}
                                        onClick={() => handleToggleChange('ETC')}
                                    >
                                        기타 유형
                                    </ToggleGroupItem>
                                    <ToggleGroupItem
                                        value="way"
                                        selected={selectedCategories.includes('way')}
                                        onClick={() => handleToggleChange('way')}
                                    >
                                        문제 푸는 방법
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div className='flex flex-col w-full h-full mb-14'>
                                {filteredData.map((item, index) => {
                                    const backgroundColor = index % 2 === 0 ? 'bg-emerald-100' : 'bg-emerald-200';
                                    return (
                                        <Container key={index} className={backgroundColor}>
                                            <div className='flex flex-col w-1/3 p-12 justify-between font-bold text-md'>
                                                <p>{item.type} - {item.task}</p>
                                                <p>Play Time: 0</p>
                                                <p>Result: {getRandomNumber(1, 10)}/10</p>
                                            </div>
                                            <div className='flex flex-row w-1/3 justify-center items-center p-12'>
                                                <p style={{ fontSize: '120px' }}>{getRandomNumber(50, 100)}</p>
                                                <div className='flex flex-col justify-end h-full'>
                                                    <p style={{ fontWeight: 'bold', fontSize: '24px' }}>exp</p>
                                                </div>
                                            </div>
                                            <div className='flex flex-col w-1/3 justify-between items-end p-12'>
                                                <p className='font-bold text-lg'>{getRandomDate()}</p>
                                                <p className='font-bold text-md'>{getRandomTier()}</p>
                                            </div>
                                        </Container>
                                    );
                                })}
                                <div className='h-14'></div>
                            </div>

                            {/* 로딩 중일 때 로딩 애니메이션 */}
                            {isLoading && (
                                <div className="flex justify-center items-center mt-8">
                                    <Loader className="loader" />
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === 'postHistory' && <MyPagePostHistoryPanel />}
                    {activeTab === 'inquiryHistory' && <MyPageInquiryHistoryPanel />}
                    {activeTab === 'pointUsingHistory' && <MyPagePointUsingHistoryPanel />}
                </div>
            </div>
        </>
    );
};

export default MyPagePlayHistoryPanel;
