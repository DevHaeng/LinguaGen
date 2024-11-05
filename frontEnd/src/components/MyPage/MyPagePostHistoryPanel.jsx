import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.jsx";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination.jsx"

import styled from 'styled-components';

/*const NotepadDiv = styled.div`
  position: relative;
  padding: 2px;
  font-size: 16px;
  line-height: 30px;
  min-height: 90px;
  white-space: pre-wrap;
  background-image: linear-gradient(to bottom, transparent 29px, #ccc 30px);
  background-size: 100% 30px;
`;*/

const TitleDiv = styled.div`
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap; /* 한 줄로 고정 */
  overflow: hidden;
    text-overflow: ellipsis;
`;

const NotepadDiv = styled.div`
  position: relative;
  padding: 2px;
  font-size: 16px;
  line-height: 24px; /* 줄 간격 */
    min-height: 72px; /* 3줄의 높이 */
  max-height: 72px; /* 3줄까지만 표시 */
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* 최대 3줄까지만 표시하고 초과 시 ... */
  text-overflow: ellipsis;
  white-space: normal; /* 줄바꿈 허용 */

  /* 배경에 3줄 밑줄 표시 */
  background-image: linear-gradient(to bottom, transparent 23px, #ccc 24px);
  background-size: 100% 24px;
`;

const Tooltip = styled.div`
  visibility: hidden;
  max-width: 250px;
  width: 150px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

const IconImage = styled.img`
  width: 16px;
  height: 16px;
  
  &:hover + ${Tooltip} {
    visibility: visible;
    opacity: 1;
  }
`;

const MyPagePostHistoryPanel = () => {
    const [cards, setCards] = useState([]);
    const userId = sessionStorage.getItem("id");
    const [page, setPage] = useState(0); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 수

    useEffect(() => {
        // 페이지 번호와 크기를 포함해 API 요청
        axios.get(`http://localhost:8085/api/community/user/${userId}`, {
            params: {
                page: page,
                size: 12, // 한 페이지에 12개씩 표시
            },
        })
            .then(response => {
                setCards(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch(error => console.error('Error fetching community posts:', error));
    }, [userId, page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const [isHovered, setIsHovered] = useState(null); // 마우스 호버 상태를 저장

    const handleMouseEnter = (id) => {
        setIsHovered(id);
    };

    const handleMouseLeave = () => {
        setIsHovered(null);
    };

    return (
        <>
            <div className='pb-10 w-full text-center font-bold text-xl'>
                <p>게시글 내역</p>
            </div>
            {cards.length === 0 ? (
                <div className='text-center text-gray-500 text-lg'>
                    작성된 게시글이 없습니다.
                </div>
            ) : (
            <div className='grid grid-cols-3 gap-4 items-start justify-start w-full mt-4 px-8'>
                {cards.map((card) => (
                    <Card
                        key={card.idx}
                        className='h-64 w-full'
                        style={{
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            userSelect: 'none',
                            transform: isHovered === card.idx ? 'translateY(-10px)' : 'translateY(0)',
                            boxShadow: isHovered === card.idx
                                ? '0px 10px 15px rgba(0, 0, 0, 0.1)'
                                : 'none',
                        }}
                        onMouseEnter={() => handleMouseEnter(card.idx)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <CardHeader className='flex flex-row items-center justify-between border-b-2'>
                            <TitleDiv>{card.title}</TitleDiv>
                        </CardHeader>
                        <CardContent className='pt-12'>
                            <NotepadDiv contentEditable={false}>
                                {card.content}
                            </NotepadDiv>
                        </CardContent>
                        <CardFooter style={{ position: 'relative', display: 'inline-block' }}>
                            <IconImage src="src/assets/imgs/comments.png" alt="comments icon" />
                            <Tooltip>댓글 달린 갯수: {card.commentsCount}</Tooltip>
                        </CardFooter>
                    </Card>
                ))}
                <div className='h-24 w-full flex justify-center items-center col-span-3 mb-24'>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem onClick={() => handlePageChange(page - 1)}>
                                <PaginationPrevious href="#"/>
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, index) => (
                                <PaginationItem key={index} onClick={() => handlePageChange(index)}>
                                    <PaginationLink href="#">{index + 1}</PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem onClick={() => handlePageChange(page + 1)}>
                                <PaginationNext href="#"/>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
            )}
        </>
    );
};

export default MyPagePostHistoryPanel;
