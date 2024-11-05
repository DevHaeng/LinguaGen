import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Switch 컨테이너 및 슬라이드 애니메이션 스타일 정의
const SwitchContainer = styled.div`
  position: relative;
  width: 300px;
  height: 40px;
  background-color: #f0f4f8;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  margin-bottom: 20px;
`

const SwitchSlider = styled.div`
  position: absolute;
  top: 4px;
  left: ${({ activeTab }) => (activeTab === 'challenges' ? '4px' : '150px')}; /* 탭 전환 시 위치 */
  width: 146px;
  height: 32px;
  background-color: #000000;
  border-radius: 16px;
  transition: left 0.3s ease; /* 부드러운 슬라이드 전환 */
`

const SwitchButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 146px;
  height: 32px;
  background-color: transparent;
  color: ${({ active }) => (active ? '#ffffff' : '#000000')};
  border: none;
  z-index: 1;
  font-weight: bold;
  cursor: pointer;
  border-radius: 16px;
  transition: color 0.3s ease;
`

// Badge 아이템 스타일 정의
const BadgeItem = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${({ unlocked }) => (unlocked ? '#ffffff' : '#f0f4f8')};
  opacity: ${({ unlocked }) => (unlocked ? '1' : '0.5')};
  transition: opacity 0.3s ease;
  box-shadow: ${({ unlocked }) => (unlocked ? '0px 4px 15px rgba(0, 0, 0, 0.25)' : '0px 2px 8px rgba(0, 0, 0, 0.15)')};
  
  &:hover > div {
    opacity: 1;
    visibility: visible;
  }

  svg {
    position: absolute;
    bottom: 8px;
    right: 8px;
    opacity: ${({ unlocked }) => (unlocked ? '0' : '1')};
  }
`

// Tooltip 스타일 정의
const Tooltip = styled.div`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #000;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
`

const BadgeText = styled.p`
  margin-top: 8px;
  text-align: center;
  font-weight: bold;
  color: ${({ unlocked }) => (unlocked ? '#000000' : '#afb9c9')};
  white-space: nowrap; /* 텍스트를 한 줄로 유지 */
  overflow: hidden;
  text-overflow: ellipsis; /* 텍스트가 길면 말줄임표로 처리 */
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
`

// Badge 컨테이너 grid로 정렬하여 일정한 간격 유지, 한 열에 5개 제한
const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 40px;
  justify-items: center;
  align-items: center;
  width: 100%;
  
  @media (max-width: 952px) {
    grid-template-columns: repeat(2, 1fr); /* 모바일에서 2열로 변경 */
    grid-gap: 20px;
  }
`;

const BadgePanel = () => {
  const [activeTab, setActiveTab] = useState('challenges');
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = window.innerWidth <= 952;

  // challenges 데이터 쿼리
  const { data: challengesBadges = [] } = useQuery({
    queryKey: ['badges', 'challenges'],
    queryFn: async () => {
      const response = await fetch('src/Challenges.json');
      const data = await response.json();
      return data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  // activities 데이터 쿼리
  const { data: activitiesBadges = [] } = useQuery({
    queryKey: ['badges', 'activities'],
    queryFn: async () => {
      const response = await fetch('src/Activities.json');
      const data = await response.json();
      return data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  // 현재 활성화된 탭의 데이터를 메모이제이션
  const badges = useMemo(() => 
    activeTab === 'challenges' ? challengesBadges : activitiesBadges,
    [activeTab, challengesBadges, activitiesBadges]
  );

  // itemsPerPage를 badges 초기화 이후에 설정
  const itemsPerPage = useMemo(() => 
    isMobile ? 8 : badges.length,
    [isMobile, badges.length]
  );

  // 현재 페이지의 뱃지들만 필터링
  const currentBadges = useMemo(() => {
    if (!isMobile) return badges;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return badges.slice(startIndex, startIndex + itemsPerPage);
  }, [badges, currentPage, itemsPerPage, isMobile]);

  // 총 페이지 수 계산
  const totalPages = useMemo(() => 
    isMobile ? Math.ceil(badges.length / itemsPerPage) : 1,
    [badges.length, itemsPerPage, isMobile]
  );

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='flex flex-col items-center justify-start w-full ml-24 border-2 border-gray-300 rounded-lg max-lg:ml-0' 
         style={{backdropFilter: 'blur(15px)', background: 'rgba(255, 255, 255, 0.2', height: 'auto'}}>
      <div className='w-full'>
        <h4 className='font-bold h-14 pt-8 pl-4 max-lg:mb-8' style={{ fontSize: '24px' }}>뱃지</h4>
      </div>

      <SwitchContainer>
        <SwitchSlider activeTab={activeTab} />
        <SwitchButton 
          active={activeTab === 'challenges'} 
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </SwitchButton>
        <SwitchButton 
          active={activeTab === 'activities'} 
          onClick={() => setActiveTab('activities')}
        >
          Activities
        </SwitchButton>
      </SwitchContainer>

      <div className='flex flex-col items-start justify-start w-full mt-10 h-full'>
        <BadgeGrid style={{ marginBottom: '45px' }}>
          {currentBadges.map((badge, index) => (
            <div key={badge.id || index} className="flex flex-col items-center justify-center">
              <BadgeItem unlocked={badge.unlocked}>
                <img
                  src={badge.src || 'https://via.placeholder.com/60'}
                  alt={badge.title}
                  style={{ borderRadius: '50%', width: '60px', height: '60px'}}
                  loading="lazy"
                  decoding="async"
                />
                <Lock size={20} />
                <Tooltip>{badge.description}</Tooltip>
              </BadgeItem>
              <BadgeText unlocked={badge.unlocked}>{badge.title}</BadgeText>
            </div>
          ))}
        </BadgeGrid>

        {isMobile && badges.length > itemsPerPage && (
          <div className="w-full flex justify-center mb-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index + 1}>
                    <PaginationLink
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export default BadgePanel;
