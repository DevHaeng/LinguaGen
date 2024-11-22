import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header.jsx';
import _ from 'lodash';
import { ChevronUp, ChevronsUpDown, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 애니메이션과 스타일 컴포넌트 정의
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const BackgroundVideo = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
`;

const FadeInContainer = styled.div`
  animation: ${fadeIn} 1s ease-in-out;
`;

// 사이드바 스타일
const SidebarContainer = styled.div`
  width: 20rem;
  padding: 20px;
  font-size: 16px;
  height: 300px;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.2);
  border : 1px white solid;
  border-radius : 8px;
  box-shadow : 0 0 10px 0 rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.p`
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
`;

const List = styled.ul`
  padding-left: 10px;
`;

const ListItem = styled.li`
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

const RankingPage = () => {
    const [rankingData, setRankingData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [displayedData, setDisplayedData] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 200;
    const [searchTerm, setSearchTerm] = useState('');
    const [activePanel, setActivePanel] = useState('personalRanking');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // 각 랭킹 데이터를 저장할 상태 추가
    const [weeklyOverallData, setWeeklyOverallData] = useState([]);
    const [weeklyGradeData, setWeeklyGradeData] = useState([]);
    const [personalRankingData, setPersonalRankingData] = useState([]);
    const [groupRankingData, setGroupRankingData] = useState([]);

    const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger'];

    const [showScrollTop, setShowScrollTop] = useState(false);
    const tableRef = useRef(null);

    // 정렬 관련 상태 추가
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    // 등급 순서 매핑 객체 추가
    const tierValues = {
        'Challenger': 6,
        'Diamond': 5,
        'Platinum': 4,
        'Gold': 3,
        'Silver': 2,
        'Bronze': 1
    };

    const gradeToTier = {
        1: 'Bronze',
        2: 'Silver',
        3: 'Gold',
        4: 'Platinum',
        5: 'Diamond',
        6: 'Challenger'
    };

    const [selectedGrade, setSelectedGrade] = useState('전체');

    // API 호출: 주간 전체 랭킹 데이터 가져오기
    const fetchWeeklyOverallRanking = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/ranking/weekly`);
            let data = await response.json();

            // 순위 계산
            data = data
                .sort((a, b) => b.exp - a.exp) // exp 기준 내림차순 정렬
                .map((item, index) => ({ ...item, overallRank: index + 1 })); // 순위 추가

            setWeeklyOverallData(data);
            setFilteredData(Array.isArray(data) ? data : []);
            if (activePanel === 'weeklyOverall') setFilteredData(data);
        } catch (err) {
            console.error('Weekly Overall ranking fetch error:', err);
        }
    };


    // API 호출: 개인 랭킹 데이터 가져오기
    const fetchPersonalRankingData = async (grade = 0) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/ranking/personal?grade=${grade}`);
            const data = await response.json();
            setPersonalRankingData(data);
            setFilteredData(Array.isArray(data) ? data : []);
            if (activePanel === 'personalRanking') setFilteredData(data);
        } catch (err) {
            console.error('Personal ranking fetch error:', err);
        }
    };

    // activePanel에 따라 API 호출 결정
    useEffect(() => {
        if (activePanel === 'weeklyOverall') {
            fetchWeeklyOverallRanking();
        } else if (activePanel === 'personalRanking') {
            fetchPersonalRankingData();
        }
    }, [activePanel]);

    // activePanel이 변경될 때 필터링된 데이터 초기화
    useEffect(() => {
        setDisplayedData(Array.isArray(filteredData) ? filteredData.slice(0, itemsPerPage) : []);
    }, [filteredData]);


    // 등급 필터링 함수 수정
    const filterByGrade = (grade) => {
        setSelectedGrade(grade);
        if (grade === '전체') {
            switch (activePanel) {
                case 'weeklyOverall':
                    setFilteredData(weeklyOverallData);
                    setDisplayedData(weeklyOverallData.slice(0, itemsPerPage));
                    break;
                case 'weeklyGrade':
                    setFilteredData(weeklyGradeData);
                    setDisplayedData(weeklyGradeData.slice(0, itemsPerPage));
                    break;
                case 'personalRanking':
                    setFilteredData(personalRankingData);
                    setDisplayedData(personalRankingData.slice(0, itemsPerPage));
                    break;
                default:
                    break;
            }
        } else {
            const currentData = activePanel === 'weeklyOverall' ? weeklyOverallData : activePanel === 'weeklyGrade' ? weeklyGradeData : personalRankingData;
            const filtered = currentData.filter(item => gradeToTier[item.grade] === grade);
            setFilteredData(filtered);
            setDisplayedData(filtered.slice(0, itemsPerPage));
        }
    };

    // 정렬 처리 함수
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedData = [...displayedData].sort((a, b) => {
            if (key === 'rank') {
                return direction === 'asc' ? 
                    (a.rank - b.rank) : (b.rank - a.rank);
            }
            if (key === 'userId' || key === 'groupName') {
                const aValue = activePanel === 'groupRanking' ? a.groupName : a.userId;
                const bValue = activePanel === 'groupRanking' ? b.groupName : b.userId;
                return direction === 'asc' ? 
                    aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (key === 'grade') {
                // grade 값을 직접 비교 (높은 숫자가 상위 등급)
                return direction === 'asc' ? 
                    (a.grade - b.grade) : (b.grade - a.grade);
            }
            if (key === 'exp') {
                return direction === 'asc' ? 
                    (a.exp - b.exp) : (b.exp - a.exp);
            }
            return 0;
        });

        setDisplayedData(sortedData);
    };

    // 정렬 방향 표시 함수
    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? 
                <ChevronUp className="inline ml-1" size={16} /> : 
                <ChevronsUpDown className="inline ml-1" size={16} />;
        }
        return <ChevronsUpDown className="inline ml-1" size={16} />;
    };

    // 테이블 헤더 스타일
    const headerStyle = "p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200 select-none";

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        setShowScrollTop(scrollTop > 300);
        
        if (scrollHeight - scrollTop === clientHeight) {
            loadMore();
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        const start = (nextPage - 1) * itemsPerPage;
        const end = nextPage * itemsPerPage;
        
        if (start < filteredData.length) {
            setLoading(true);
            setTimeout(() => {
                setDisplayedData([...displayedData, ...filteredData.slice(start, end)]);
                setPage(nextPage);
                setLoading(false);
            }, 500);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim() === '') {
            setFilteredData(rankingData);
            setDisplayedData(rankingData.slice(0, itemsPerPage));
        } else {
            const filtered = rankingData.filter((user) =>
                user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(filtered);
            setDisplayedData(filtered.slice(0, itemsPerPage));
        }
        setPage(1);
    };

    const scrollToTop = () => {
        if (tableRef.current) {
            tableRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    if (error) return <p>{error}</p>;

    return (
        <FadeInContainer className='flex flex-col items-center justify-start h-screen w-full relative overflow-y-auto custom-scrollbar'>
            <BackgroundVideo autoPlay muted loop>
                <source src='/assets/video/MainBackground.mp4' type='video/mp4' />
            </BackgroundVideo>
            <Header />

            <main className='w-full h-min-screen grid grid-cols-12 gap-4 p-4 pt-0 mt-4 flex flex-col justify-start items-start'>
                {/* 왼쪽 사이드바 */}
                <div className='col-span-3 col-start-2 flex flex-col gap-8 items-center'>
                    <SidebarContainer>
                        <SectionTitle className='jua-regular text-2xl'>랭킹</SectionTitle>
                        <List className='jua-regular text-xl'>
                            <ListItem
                                isActive={activePanel === 'personalRanking'}
                                onClick={() => setActivePanel('personalRanking')}
                            >
                                개인 랭킹
                            </ListItem>
                            <ListItem
                                isActive={activePanel === 'weeklyOverall'}
                                onClick={() => setActivePanel('weeklyOverall')}
                            >
                                주간 랭킹
                            </ListItem>
                            <ListItem
                                isActive={activePanel === 'groupRanking'}
                                onClick={() => setActivePanel('groupRanking')}
                            >
                                단체 랭킹
                            </ListItem>
                        </List>
                    </SidebarContainer>
                </div>

                {/* 오른쪽 메인 컨테이너 */}
                <div className='col-span-7 flex items-start justify-start flex-col backdrop-blur-[15px]' 
                    style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px white solid', borderRadius: '8px', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}>
                    
                    {/* 검색 영역 */}
                    <div className="flex w-full justify-between my-4 pr-8">
                        <div className='pl-8 jua-regular text-xl flex items-center'>
                            <p>
                                {activePanel === 'weeklyRanking' && '주간 랭킹'}
                                {activePanel === 'personalRanking' && '개인 랭킹'}
                                {activePanel === 'groupRanking' && '단체 랭킹'}
                            </p>
                        </div>
                        <div className='flex items-center'>
                            <input
                                type="text"
                                placeholder="닉네임 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="h-8 border-2 border-gray-400 rounded-md pl-2 mr-2"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                검색
                            </button>
                        </div>
                    </div>

                    {/* 랭킹 테이블 */}
                    <div className="w-full bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 relative">
                        <div 
                            ref={tableRef}
                            className="max-h-[650px] overflow-y-auto custom-scrollbar relative" 
                            onScroll={handleScroll}
                        >
                            <table className="w-full">
                                <thead className="sticky top-0 bg-white/80 backdrop-blur-md">
                                <tr className="text-left border-b-2 border-gray-300">
                                    <th
                                        className={headerStyle}
                                        onClick={() => handleSort('rank')}
                                    >
                                        순위 {getSortIcon('rank')}
                                    </th>
                                    <th
                                        className={headerStyle}
                                        onClick={() => handleSort(activePanel === 'groupRanking' ? 'groupName' : 'userId')}
                                    >
                                        {activePanel === 'groupRanking' ? '그룹명' : '아이디'}
                                        {getSortIcon(activePanel === 'groupRanking' ? 'groupName' : 'userId')}
                                    </th>
                                    <th
                                        className={headerStyle}
                                        onClick={() => handleSort('grade')}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center justify-between w-full">
                                                등급: {selectedGrade} <ChevronDown className="ml-2" size={16} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => filterByGrade('전체')}>
                                                    전체
                                                </DropdownMenuItem>
                                                {tierOrder.map((tier) => (
                                                    <DropdownMenuItem 
                                                        key={tier} 
                                                        onClick={() => filterByGrade(tier)}
                                                    >
                                                        {tier}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </th>
                                    {/* 조건부로 '티어'와 '경험치' 출력 */}
                                    {activePanel === 'personalRanking' && (
                                        <>
                                            <th
                                                className={headerStyle}
                                                onClick={() => handleSort('tier')}
                                            >
                                                티어 {getSortIcon('tier')}
                                            </th>
                                            <th
                                                className={headerStyle}
                                                onClick={() => handleSort('exp')}
                                            >
                                                경험치 {getSortIcon('exp')}
                                            </th>
                                        </>
                                    )}
                                    {activePanel === 'weeklyOverall' && (
                                        <>
                                            <th
                                                className={headerStyle}
                                                onClick={() => handleSort('exp')}
                                            >
                                                경험치 {getSortIcon('exp')}
                                            </th>
                                        </>
                                    )}
                                </tr>
                                </thead>
                                <tbody>
                                {displayedData
                                    .filter(item => selectedGrade === '전체' || gradeToTier[item.grade] === selectedGrade)
                                    .map((item, index) => (
                                        <tr key={item.id || index}
                                            className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3">
                                                {activePanel === 'weeklyRanking'
                                                    ? item.idx
                                                    : (selectedGrade === '전체' ? item.overallRank : item.gradeRank)}
                                            </td>
                                            <td className="p-3">
                                                {activePanel === 'groupRanking'
                                                    ? item.groupName
                                                    : item.nickName || item.userId.split('@')[0]}
                                            </td>
                                            <td className="p-3">{gradeToTier[item.grade] || 'Unknown'}</td>
                                            {activePanel === 'personalRanking' && (
                                                <>
                                                    <td className="p-3">{`${item.tier} Tier`}</td>
                                                    <td className="p-3">{`${item.exp} XP`}</td>
                                                </>
                                            )}

                                            {activePanel === 'weeklyOverall' && (
                                                <>
                                                    <td className="p-3">{`${item.exp}`}</td>

                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {loading && (
                                <div className="w-full flex justify-center items-center p-4">
                                    <div className="loader"></div>
                                </div>
                            )}
                        </div>
                        
                        {/* 맨 위로 가기 버튼 */}
                        {showScrollTop && (
                            <button
                                onClick={scrollToTop}
                                className="fixed bottom-8 right-8 p-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                                aria-label="맨 위로 가기"
                            >
                                <ChevronUp size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </FadeInContainer>
    );
};

export default RankingPage;
