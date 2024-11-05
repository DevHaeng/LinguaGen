import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card.jsx";
import { Button } from "@components/ui/button";
import styled from 'styled-components';
import NotificationPanel from './NotificationPanel.jsx'; // NotificationPanel import
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import axios from "axios";


// 탭 스타일 수정
const TabContainer = styled.div`
  position: relative;
  width: 100%;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
  padding-top: 16px;

  @media (min-width: 952px) {
    .settings-tabs {
      display: none;  // PC 버전에서는 설정 관련 탭 숨기기
    }
  }
`;

const Tab = styled.div`
  width: 120px; // 다른 탭들과 동일한 너비로 수정
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  padding: 8px 0;
  cursor: pointer;
  color: ${({ isActive }) => (isActive ? 'black' : '#5a5255')};
  transition: color 0.3s ease;
  user-select: none;
  &:hover {
    color: ${({ isActive }) => (isActive ? 'black' : 'black')};
  }
`;

const Slider = styled.div`
  position: absolute;
  bottom: 0;
  width: 120px;
  height: 4px;
  background-color: #00b894;
  transition: left 0.3s ease;
  
  /* PC 버전 - 설정 탭만 있을 때 */
  @media (min-width: 952px) {
    left: ${({ activeTab }) => {
      switch (activeTab) {
        case 'accountSettings':
          return '0px';
        case 'notificationSettings':
          return '120px';
        default:
          return '0px';
      }
    }};
  }

  /* 모바일 버전 - 모든 탭이 있을 때 */
  @media (max-width: 951px) {
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
  }
`;

const MyPageSettingPanel = ({ activePanel, setActivePanel }) => {
    const activeTab = activePanel === 'accountSettings' ? 'profile' : 'notification';
    const [selectedImage, setSelectedImage] = useState('https://via.placeholder.com/60'); // 기본 이미지 URL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phone, setPhone] = useState(sessionStorage.getItem('tell') || '010-0000-0000'); // 상태로 관리
    const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false); // 전화번호 Dialog 상태 관리
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false); // 비밀번호 Dialog 상태



    // 세션 스토리지에서 값 가져오기
    const nickname = sessionStorage.getItem('nickname') || 'Unknown';
    const email = sessionStorage.getItem('id') || 'example@example.com';




    const handlePasswordChange = async () => {
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (password.length < 8 || password.length > 12) {
            alert('비밀번호는 8~12자 사이여야 합니다.');
            return;
        }

        try {
            // 서버로 비밀번호 변경 요청
            const response = await axios.post(
                'http://localhost:8085/api/users/change-password',
                { id: email, password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                setPassword(false)
                setIsPasswordDialogOpen(false); // Dialog 닫기
            } else {
                alert('비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);

            // 서버가 반환한 에러 메시지가 있을 경우 표시
            if (error.response && error.response.data) {
                alert(`오류: ${error.response.data.message || '비밀번호 변경에 실패했습니다.'}`);
            } else {
                alert('비밀번호 변경 중 오류가 발생했습니다.');
            }
        }
    };

    const handlePhoneNumberChange = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8085/api/users/change-tell',
                { id: email, tell: phoneNumber },
                { withCredentials: true }
            );

            if (response.status === 200) {
                alert('전화번호가 성공적으로 변경되었습니다.');
                sessionStorage.setItem('tell', phoneNumber);
                setPhone(phoneNumber); // 상태 업데이트 -> 화면에 반영
                setIsPhoneDialogOpen(false); // Dialog 닫기
            } else {
                alert('전화번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('전화번호 변경 중 오류가 발생했습니다.');
        }
    };

    const triggerFileInput = () => {
        document.getElementById('imageInput').click(); // 파일 선택 창 열기
    };


    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='flex flex-col items-start justify-start h-full w-full ml-24 border-2 border-gray-300 rounded-lg max-lg:ml-0'
            style={{ backdropFilter: 'blur(15px)', background: 'rgba(255, 255, 255, 0.2' }}
        >
            {/* 탭 부분 - 모바일에서만 모든 탭 표시 */}
            <TabContainer>
                <div className='hidden max-lg:flex w-full'>
                    <Tab
                        isActive={activePanel === 'playHistory'}
                        onClick={() => setActivePanel('playHistory')}
                    >
                        플레이 내역
                    </Tab>
                    <Tab
                        isActive={activePanel === 'postHistory'}
                        onClick={() => setActivePanel('postHistory')}
                    >
                        작성한 게시글
                    </Tab>
                    <Tab
                        isActive={activePanel === 'inquiryHistory'}
                        onClick={() => setActivePanel('inquiryHistory')}
                    >
                        작성한 문의글
                    </Tab>
                    <Tab
                        isActive={activePanel === 'pointUsingHistory'}
                        onClick={() => setActivePanel('pointUsingHistory')}
                    >
                        포인트 내역
                    </Tab>
                    <Tab
                        isActive={activePanel === 'accountSettings'}
                        onClick={() => setActivePanel('accountSettings')}
                    >
                        계정 설정
                    </Tab>
                    <Tab
                        isActive={activePanel === 'notificationSettings'}
                        onClick={() => setActivePanel('notificationSettings')}
                    >
                        알림 설정
                    </Tab>
                    <Slider activeTab={activePanel} />
                </div>

                {/* PC 버전에서는 설정 관련 탭만 표시 */}
                <div className='flex max-lg:hidden w-full'>
                    <Tab
                        isActive={activePanel === 'accountSettings'}
                        onClick={() => setActivePanel('accountSettings')}
                    >
                        계정 설정
                    </Tab>
                    <Tab
                        isActive={activePanel === 'notificationSettings'}
                        onClick={() => setActivePanel('notificationSettings')}
                    >
                        알림 설정
                    </Tab>
                    <Slider activeTab={activePanel} />
                </div>
            </TabContainer>

            {/* 패널 내용 */}
            <div className='w-full mt-8' style={{ maxHeight: '720px' }}>
                {activePanel === 'accountSettings' && (
                    <>
                        <Card className='h-full'>
                            <CardHeader className='text-xl font-bold'>
                                <p className='pl-8 pt-4'>내 프로필</p>
                            </CardHeader>
                            <CardContent className='flex flex-col'>
                                <div className='grid grid-cols-12 items-center p-8 pt-0 w-full mb-4'>
                                    <p className='font-bold col-span-2'>이미지</p>
                                    <div className='col-span-8'>
                                        <img
                                            src={selectedImage}
                                            alt="프로필"
                                            className='h-32 w-36 rounded-md cursor-pointer'
                                            onClick={triggerFileInput}
                                        />
                                        <input
                                            id="imageInput"
                                            type="file"
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <div className='col-span-2'></div>
                                </div>

                                <div className='grid grid-cols-12 items-center p-8 pt-0 w-full my-4 mt-12'>
                                    <p className='font-bold col-span-2'>닉네임</p>
                                    <p className='font-bold col-span-8'>{nickname}</p>
                                    <div className='col-span-2 flex justify-end'>
                                        <Dialog>
                                            <DialogTrigger className='bg-transparent'>
                                                <Button>설정</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>닉네임 수정</DialogTitle>
                                                    <DialogDescription>새로운 닉네임을 입력해주세요!</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="nickname" className="text-right">
                                                            닉네임
                                                        </Label>
                                                        <Input
                                                            id="nickname"
                                                            placeholder='새로운 닉네임'
                                                            className="col-span-3"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit">Save changes</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className='w-full mt-4' style={{ maxHeight: '720px', height: '280px' }}>
                            <Card className='h-full mb-42'>
                                <CardHeader className='text-lg font-bold'>
                                    <p className='pl-8 pt-4'>기본 정보</p>
                                </CardHeader>
                                <CardContent className='flex flex-col'>
                                    <div className='grid grid-cols-12 items-center p-8 pt-0 pb-0 w-full mb-4'>
                                        <p className='font-bold col-span-2'>이메일</p>
                                        <p className='font-bold col-span-8'>{email}</p>
                                        <div className='col-span-2 flex justify-end'>
                                            <Dialog>
                                                <DialogTrigger className='bg-transparent w-0 h-0 mb-4'>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>이메일 수정</DialogTitle>
                                                        <DialogDescription>수정할 이메일을 적어주세요</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="name" className="text-right">
                                                                이메일
                                                            </Label>
                                                            <Input id="email" placeholder='example@example'
                                                                className="col-span-3" />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit">Save changes</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-12 items-center p-8 pt-0 pb-0 w-full mb-4'>
                                        <p className='font-bold col-span-2'>비밀번호</p>
                                        <p className='font-bold text-gray-300 col-span-8'>비밀번호를 설정해주세요</p>
                                        <div className='col-span-2 flex justify-end'>
                                            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                                <DialogTrigger className='bg-transparent w-0 h-0 mb-4'>
                                                    <Button>설정</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>비밀번호 설정</DialogTitle>
                                                        <DialogDescription>신중하게 변경하세요!</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="password" className="text-right">
                                                                비밀번호
                                                            </Label>
                                                            <Input
                                                                id="password"
                                                                type="password"
                                                                value={password}
                                                                onChange={(e) => setPassword(e.target.value)}
                                                                placeholder="8~12자리 비밀번호"
                                                                className="col-span-3" />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="confirmPassword" className="text-right">
                                                                비밀번호 확인
                                                            </Label>
                                                            <Input id="confirmPassword"
                                                                type="password"
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                placeholder="비밀번호 재입력"
                                                                className="col-span-3" />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handlePasswordChange} >Save changes</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-12 items-center p-8 pt-0 pb-0 w-full mb-4'>
                                        <p className='font-bold col-span-2'>전화번호</p>
                                        <p className='font-bold col-span-8'>{phone}</p>
                                        <div className='col-span-2 flex justify-end'>
                                            <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
                                                <DialogTrigger className='bg-transparent w-0 h-0 mb-4'>
                                                    <Button>설정</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>전화번호 수정</DialogTitle>
                                                        <DialogDescription>전화번호를 적어주세요!</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="phone" className="text-right">
                                                                전화번호
                                                            </Label>
                                                            <Input type="tel"
                                                                value={phoneNumber}
                                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                                id="phone" placeholder='- 없이 작성하세요'
                                                                className="col-span-3" />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button onClick={handlePhoneNumberChange} >Save changes</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {activePanel === 'notificationSettings' && <NotificationPanel />}
            </div>
        </div>
    );
};

export default MyPageSettingPanel;
