import React, {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button.jsx';
import {format} from 'date-fns';
import axios from 'axios';
import {useParams, useNavigate} from 'react-router-dom';
import { FaThumbsUp, FaHeart } from 'react-icons/fa';

const DetailView = ({handleTabClick}) => {
    const {board, idx} = useParams();
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserNickname, setLoggedInUserNickname] = useState(null);
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentContent, setEditedCommentContent] = useState('');
    const [likeCount, setLikeCount] = useState(0); // 좋아요 수 상태 추가
    const [userPoints, setUserPoints] = useState(null); // 사용자 포인트 상태 추가

    // 각 게시판에 해당하는 카테고리명과 데이터 연결
    const boardTitles = {
        Notice: '공지사항',
        freeboard: '자유게시판',
        ExchangeLearningTips: '학습 팁 교환',
        ClubBoard: '동아리 게시판'
    };

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/community/post/${idx}`);
                setSelectedItem(response.data);
                setLikeCount(response.data.likeCount); // 초기 좋아요 수 설정
                setUserPoints(response.data.points);
            } catch (error) {
                console.error('게시글을 불러오는 중 에러 발생:', error);
            }
        };

        fetchPostData();
    }, [idx]);

    useEffect(() => {
        const userId = sessionStorage.getItem('id');
        const nickname = sessionStorage.getItem('nickname');
        setLoggedInUserId(userId);
        setLoggedInUserNickname(nickname);
    }, []);

    useEffect(() => {
        if (selectedItem) {
            fetchComments();
        }
    }, [selectedItem]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/comments/${idx}`);
            setComments(response.data);
        } catch (error) {
            console.error('댓글을 불러오는 중 에러 발생:', error);
        }
    };

    // 게시글 수정/삭제 핸들러
    const handleEditPost = () => {
        console.log("handel on")
        setIsEditingPost(true);
        setEditedTitle(selectedItem.title);
        setEditedContent(selectedItem.content);
    };

    // 게시글 수정
    const handleSavePost = async () => {
        console.log("Saving post edits:", { editedTitle, editedContent });
        console.log({loggedInUserId})
        try {
            await axios.put(`${import.meta.env.VITE_APP_API_BASE_URL}/community/${idx}?userId=${loggedInUserId}`, {
                title: editedTitle,
                content: editedContent,
            });
            setSelectedItem({...selectedItem, title: editedTitle, content: editedContent});
            setIsEditingPost(false);
            console.log("Post saved and edit mode disabled");
        } catch (error) {
            console.error('게시글 수정 중 에러 발생:', error);
        }
    };

    // 게시글 삭제
    const handleDeletePost = async () => {
        const confirmed = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmed) return;
        try {
            await axios.delete(`${import.meta.env.VITE_APP_API_BASE_URL}/community/${idx}`, {
                params: { userId: loggedInUserId }
            });
            navigate(`/community/${board}`);
        } catch (error) {
            console.error('게시글 삭제 중 에러 발생:', error);
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
            communityIdx: idx,
            content: newComment,
            userId: userId,
        };
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/comments`, commentData);
            setNewComment(''); // 입력란 초기화
            fetchComments(); // 댓글 목록 다시 불러오기
        } catch (error) {
            console.error('댓글을 등록하는 중 에러 발생:', error);
        }
    };

    // 댓글 수정/삭제 핸들러
    const handleEditComment = (commentIdx, content) => {
        setEditingCommentId(commentIdx);
        setEditedCommentContent(content);
    };

    // 댓글 수정
    const handleSaveComment = async (commentIdx) => {
        try {
            await axios.put(`${import.meta.env.VITE_APP_API_BASE_URL}/comments/${commentIdx}`, {content: editedCommentContent});
            fetchComments();
            setEditingCommentId(null);
        } catch (error) {
            console.error('댓글 수정 중 에러 발생:', error);
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentIdx) => {
        const confirmed = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmed) return;

        try {
            await axios.delete(`${import.meta.env.VITE_APP_API_BASE_URL}/comments/${commentIdx}`);
            fetchComments();
        } catch (error) {
            console.error('댓글 삭제 중 에러 발생:', error);
        }
    };

    // 좋아요 버튼 클릭 핸들러
    const handleLikeClick = async () => {
        // 포인트가 부족할 경우 알림 표시
        if (!userPoints || userPoints < 10) {
            alert("포인트가 부족합니다.");
            return;
        }

        const confirmed = window.confirm("좋아요를 누르면 10포인트가 차감됩니다. 계속하시겠습니까?");
        if (!confirmed) return; // 사용자가 확인하지 않으면 실행하지 않음

        try {
            // 좋아요 API 호출
            await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/community/post/${selectedItem.idx}/like`, null, {
                params: { userId: loggedInUserId }
            });

            setLikeCount(likeCount + 1); // 좋아요 수 증가
        } catch (error) {
            console.error('좋아요 처리 중 에러 발생:', error);
        }
    };

    if (!selectedItem) {
        return <div>로딩 중...</div>;
    }
  if (!selectedItem) {
    return <div className="custom-loader"></div>;
  }

    return (
        <div className="w-full bg-white rounded-md flex flex-col justify-start items-center min-h-screen p-8 mt-8">
            {/* 게시글 내용 */}
            <div className="w-full flex flex-col justify-start items-start mb-4">
                <div className="w-full flex justify-between items-center border-b pb-2">
                    <div>
                        <p className="text-green-500 font-bold">{boardTitles[selectedItem.category]}</p>
                        <h2 className="text-2xl font-bold mb-1">{selectedItem.title}</h2>
                        <div className="text-gray-500 flex items-center space-x-2">
                            <span>{selectedItem.nickname || selectedItem.userId.split('@')[0]}</span>
                            <span>· 조회 {selectedItem.viewCount}</span>
                            <span>· 좋아요 {selectedItem.likeCount}</span>
                            <span>· 댓글 {comments.length}</span>
                        </div>
                        {/* 작성 날짜는 항상 표시하고, 수정 날짜는 있을 때만 추가로 표시 */}
                        <div className="text-gray-500 w-full mt-1">
                            <span>
                              작성 {format(new Date(selectedItem.createdAt), 'yyyy-MM-dd')}
                                {selectedItem.updatedAt && (
                                    <span> · 수정 {format(new Date(selectedItem.updatedAt), 'yyyy-MM-dd')}</span>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button className="mr-2">이전글</Button>
                        <Button className="mr-2">다음글</Button>
                        <Button onClick={() => navigate(`/community/${board}`)}>목록</Button>
                    </div>
                </div>

                {/* 수정 및 삭제 옵션 */}
                {selectedItem.userId === loggedInUserId && (
                    <div className="w-full flex justify-end mt-2 text-sm text-blue-500 space-x-2">
                        <span onClick={handleEditPost} className="cursor-pointer hover:underline">수정</span>
                        <span onClick={handleDeletePost}
                              className="cursor-pointer hover:underline text-red-500">삭제</span>
                    </div>
                )}
            </div>


            {/* 본문 내용 */
            }
            <div className="w-full bg-transparent p-4 rounded-md mb-8">
                <p className="mb-4">{selectedItem.content}</p>
            </div>

            {/* 작성자 정보 및 더보기 */
            }
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

                {/* 좋아요 버튼 */}
                <button onClick={handleLikeClick} className="text-gray-500 hover:text-red-500 flex items-center ml-auto">
                    <FaHeart />
                    <span className="ml-1">{likeCount}</span>
                </button>
            </div>

            {/* 댓글 입력 및 등록 버튼 */
            }
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
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{comment.nickname || comment.userId}</p>
                                            <p className="text-sm text-gray-500">
                                                작성 날짜: {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                                {comment.updatedAt && (
                                                    <span> | 수정 날짜: {format(new Date(comment.updatedAt), 'yyyy-MM-dd HH:mm:ss')}</span>
                                                )}
                                            </p>
                                        </div>
                                        {comment.userId === loggedInUserId && (
                                            <div className="text-sm text-blue-500 space-x-2">
                                                <span onClick={() => handleEditComment(comment.idx, comment.content)}
                                                      className="cursor-pointer"> 수정
                                                </span>
                                                <span onClick={() => handleDeleteComment(comment.idx)}
                                                      className="cursor-pointer text-red-500"> 삭제
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment.idx ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editedCommentContent}
                                                onChange={(e) => setEditedCommentContent(e.target.value)}
                                                className="w-full p-2 border rounded-md mt-2"
                                            />
                                            <div className="flex justify-end space-x-2 mt-2">
                                                <button onClick={() => handleSaveComment(comment.idx)}
                                                        className="text-blue-500"> 저장
                                                </button>
                                                <button onClick={() => setEditingCommentId(null)}
                                                        className="text-gray-500"> 취소
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <p>{comment.content}</p>
                                    )}

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
