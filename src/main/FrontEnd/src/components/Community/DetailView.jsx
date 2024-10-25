import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import axios from 'axios';

const DetailView = ({ selectedItem, handleTabClick }) => {
  // 상태 관리
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState(null); // 로그인한 사용자 ID
  const [loggedInUserNickname, setLoggedInUserNickname] = useState(null); // 로그인한 사용자 닉네임

  // 각 게시판에 해당하는 카테고리명과 데이터 연결
  const boardTitles = {
    Notice: '공지사항',
    freeboard: '자유게시판',
    ExchangeLearningTips: '학습 팁 교환',
    ClubBoard: '동아리 게시판'
  };

/*  // 컴포넌트가 마운트될 때 `userId`와 `nickname`을 세션에서 가져와 상태로 설정
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const nickname = sessionStorage.getItem('nickname');
    setLoggedInUserId(userId);
    setLoggedInUserNickname(nickname);
  }, []);*/

// sessionStorage에서 초기 로그인 정보 설정
  useEffect(() => {
    const userId = sessionStorage.getItem('id');
    const nickname = sessionStorage.getItem('nickname');
    setLoggedInUserId(userId);
    setLoggedInUserNickname(nickname);
  }, []);

  // selectedItem이 변경될 때마다 댓글 목록을 불러옴
  useEffect(() => {
    if (selectedItem) {
      fetchComments();
    }
  }, [selectedItem]);

  // 서버에서 댓글 목록을 불러오는 함수
  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:8085/api/comments/${selectedItem.idx}`);
      setComments(response.data); // 서버에서 받아온 댓글 데이터로 상태 업데이트
    } catch (error) {
      console.error('댓글을 불러오는 중 에러 발생:', error);
    }
  };

  // 댓글 입력 핸들러
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  // 댓글 등록 핸들러
  const handleCommentSubmit = async () => {
    const userId = loggedInUserId || sessionStorage.getItem('id');

    if (newComment.trim() === '') return;

    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const commentData = {
      communityIdx: selectedItem.idx,
      content: newComment,
      userId: userId, // 로그인한 사용자 ID
    };

    try {
      const response = await axios.post('http://localhost:8085/api/comments', commentData);
      setNewComment(''); // 입력란 초기화
      fetchComments(); // 댓글 목록 다시 불러오기
    } catch (error) {
      console.error('댓글을 등록하는 중 에러 발생:', error);
    }
  };

  if (!selectedItem) {
    return <div>항목을 선택해 주세요.</div>;
  }

  return (
      <div className="w-full bg-white rounded-md flex flex-col justify-start items-center min-h-screen p-8">
        {/* 상단 게시글 메타 정보 */}
        <div className="w-full flex flex-col justify-start items-start mb-4">
          <div className="w-full flex justify-between items-center border-b pb-2">
            <div>
              <p className="text-green-500 font-bold">{boardTitles[selectedItem.category]}</p>
              <h2 className="text-2xl font-bold mb-1">{selectedItem.title}</h2>
              <div className="text-gray-500 flex items-center space-x-2">
                <span>{selectedItem.nickname || selectedItem.userId.split('@')[0]}</span>
                <span>·</span>
                <span>{format(new Date(selectedItem.createdAt), 'yyyy-MM-dd')}</span>
                <span>· 조회 {selectedItem.viewCount}</span>
                <span>· 댓글 {comments.length}</span>
              </div>
            </div>
            <div>
              <Button className="mr-2">이전글</Button>
              <Button className="mr-2">다음글</Button>
              <Button onClick={() => handleTabClick('Notice')}>목록</Button>
            </div>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="w-full bg-transparent p-4 rounded-md mb-8">
          <p className="mb-4">{selectedItem.content}</p>
        </div>

        {/* 작성자 정보 및 더보기 */}
        <div className="w-full flex items-center mb-4">
          <img
              src="https://via.placeholder.com/40"
              alt="작성자 아바타"
              className="w-10 h-10 rounded-full mr-4"
          />
          <div>
            <Button className="text-sm bg-transparent" variant="link">
              {selectedItem.nickname || selectedItem.userId.split('@')[0]}님의 게시글 더보기
            </Button>
          </div>
        </div>

        {/* 댓글 입력 및 등록 버튼 */}
        <div className="w-full border-t pt-4">
          <h3 className="font-bold text-lg mb-4">댓글</h3>
          <div className="w-full bg-gray-50 p-4 rounded-md flex items-center space-x-4 mb-4">
            <img
                src="https://via.placeholder.com/40"
                alt="유저 아바타"
                className="w-10 h-10 rounded-full"
            />
            <p>{loggedInUserNickname || loggedInUserId}</p>
            <input
                type="text"
                value={newComment}
                onChange={handleCommentChange}
                placeholder="댓글을 남겨보세요"
                className="w-full bg-white p-3 rounded-md border border-gray-300"
            />
            <Button className="text-sm bg-green-300 hover:bg-green-400" onClick={handleCommentSubmit}>
              등록
            </Button>
          </div>

          {/* 댓글 목록 */}
          <div className="w-full">
            {comments.length === 0 ? (
                <p className="text-gray-500">아직 댓글이 없습니다.</p>
            ) : (
                <ul>
                  {comments.map((comment) => (
                      <li key={comment.id} className="bg-gray-100 p-4 rounded-md mb-4">
                        <div className="flex items-center mb-2">
                          <img
                              src="https://via.placeholder.com/40"
                              alt="유저 아바타"
                              className="w-8 h-8 rounded-full mr-2"
                          />
                          <div>
                            <p className="font-bold">{comment.nickname || comment.userId}</p>
                            <p className="text-sm text-gray-500">
                              작성 날짜: {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                              {comment.updatedAt && (
                                  <span> | 수정 날짜: {format(new Date(comment.updatedAt), 'yyyy-MM-dd HH:mm:ss')}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <p>{comment.content}</p>
                      </li>
                  ))}
                </ul>
            )}
          </div>
        </div>
      </div>
  );
};

export default DetailView;
