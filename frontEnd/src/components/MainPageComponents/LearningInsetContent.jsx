import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// diffGrade 값을 등급 이름으로 변환하는 함수
const getGradeName = (diffGrade) => {
    const gradeMapping = {
        1: 'Bronze',
        2: 'Silver',
        3: 'Gold',
        4: 'Platinum',
        5: 'Diamond',
        6: 'Challenger',
    };
    return gradeMapping[diffGrade] || 'Unknown';
};

const LearningInsetContent = ({
                                  scrollContainerRef,
                                  overscrollShadow,
                                  wrongWords,
                                  loading,
                                  selectedMenu,
                              }) => {
    const [data, setData] = useState([]);

    // sessionStorage에서 사용자 정보 가져오기 및 API 호출
    useEffect(() => {
        const fetchData = async () => {
            const user = sessionStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                try {
                    // 첫 번째 API 호출
                    const response1 = await axios.get(
                        `${import.meta.env.VITE_APP_API_BASE_URL}/mypage-summary/${userData.id}`,
                        { withCredentials: true }
                    );

                    // 두 번째 API 호출
                    const response2 = await axios.get(
                        `${import.meta.env.VITE_APP_API_BASE_URL}/mypage-summary/question/${userData.id}`,
                        { withCredentials: true }
                    );

                    // 응답 데이터를 병합하여 새로운 배열 생성
                    const combinedData = response1.data.map((item, index) => ({
                        ...item,
                        type: response2.data[index]?.type,
                        diffGrade: response2.data[index]?.diffGrade,
                        diffTier: response2.data[index]?.diffTier
                    }));

                    // 병합된 데이터를 상태에 설정
                    setData(combinedData);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchData();
    }, []);


    // selectedMenu 값을 변환하는 함수
    const translateSelectedMenu = (menu) => {
        switch (menu) {
            case "Reading":
                return "리딩";
            case "Listening":
                return "리스닝";
            case "ETC":
                return "기타 유형";
            default:
                return menu; // 변환하지 않을 경우 원래 값 반환
        }
    };

    // 변환된 selectedMenu 값
    const translatedMenu = translateSelectedMenu(selectedMenu);

    // selectedMenu와 item.type이 같은 항목만 필터링
    const filteredData = data.filter((item) => item.type === translatedMenu);


    return (
        <div
            ref={scrollContainerRef}
            className="w-full h-[calc(100vh-200px)] pb-20 overflow-y-auto flex justify-center border-t-2 pt-12 relative custom-scrollbar"
            style={{
                boxShadow: `inset 0 ${overscrollShadow}px ${overscrollShadow}px -${overscrollShadow / 2}px rgba(0, 0, 0, 0.1), inset 0 ${overscrollShadow / 2}px ${overscrollShadow / 2}px -${overscrollShadow / 4}px rgba(0, 0, 0, 0.05)`,
            }}
        >
            <div className="w-full grid grid-cols-1 gap-8 pb-8 mx-4">
                {filteredData.map((item, index) => (
                    <Card
                        key={index}
                        className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden min-h-[300px]"
                        style={{ userSelect: 'none' }}
                    >
                        <Dialog>
                            <DialogTrigger asChild>
                                <div>
                                    <CardHeader
                                        className="bg-gradient-to-r from-[#1F2937] to-[#111827] text-white py-4 cursor-pointer hover:opacity-90 transition-opacity duration-200 lg:cursor-default lg:hover:opacity-100"
                                        onClick={(e) => {
                                            if (window.innerWidth >= 1024) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <CardTitle className="text-lg font-semibold flex items-center text-white">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            {item.createdAt}
                                            <span className="ml-2 text-sm text-gray-300 lg:hidden">
                (클릭하여 틀린 단어 보기)
              </span>
                                        </CardTitle>
                                    </CardHeader>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] h-[600px] overflow-y-auto bg-white rounded-xl">
                                <DialogHeader className="bg-gradient-to-r from-black to-white text-white p-6 rounded-t-xl">
                                    <DialogTitle className="text-xl font-bold">틀린 단어 노트</DialogTitle>
                                    <DialogDescription className="text-blue-100">틀린 단어를 확인하세요~</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 p-6">
                                    {wrongWords.map((word, index) => (
                                        <React.Fragment key={index}>
                                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
                                                <p className="font-medium text-gray-800">{word.english}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
                                                <p className="font-medium text-gray-800">{word.korean}</p>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <CardContent className="flex flex-col md:flex-row p-6 gap-6 h-full">
                            <div className="flex flex-col md:w-2/3 space-y-1">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <span className="font-medium text-gray-600">카테고리</span>
                                    <span className="text-gray-800 font-semibold">{item.type}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <span className="font-medium text-gray-600">레벨</span>
                                    <span className="text-gray-800 font-semibold">level {item.diffTier}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <span className="font-medium text-gray-600">스코어</span>
                                    <span className="text-gray-800 font-semibold">{item.correctCount}/{item.count}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <span className="font-medium text-gray-600">랭크</span>
                                    <span className="text-gray-800 font-semibold">{getGradeName(item.diffGrade)} {item.diffTier}</span>
                                </div>
                            </div>
                            <div className="md:w-1/3 flex justify-center md:justify-end pt-8">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button
                                            className="transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg w-full h-[120px] rounded-xl text-white font-bold flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                                                border: 'none',
                                                outline: 'none',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            }}
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-8 w-8 mb-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                    />
                                                </svg>
                                                <span className="text-lg">틀린 단어 보기</span>
                                            </div>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent
                                        className="sm:max-w-[600px] h-[600px] overflow-y-auto bg-white rounded-xl">
                                        <DialogHeader
                                            className="bg-gradient-to-r from-black to-white text-white p-6 rounded-t-xl">
                                            <DialogTitle className="text-xl font-bold">틀린 단어 노트</DialogTitle>
                                            <DialogDescription className="text-blue-100">틀린 단어를
                                                확인하세요~</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-4 p-6">
                                            {wrongWords.map((word, index) => (
                                                <React.Fragment key={index}>
                                                    <div
                                                        className="bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
                                                        <p className="font-medium text-gray-800">{word.english}</p>
                                                    </div>
                                                    <div
                                                        className="bg-gray-50 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
                                                        <p className="font-medium text-gray-800">{word.korean}</p>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {loading && (
                    <div className="flex justify-center items-center p-4">
                        <div className="loader"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningInsetContent;
