import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useStore from '../../store/useStore';
import '../../App.css';
import Word3D from '../Word3D';
import { Player } from '@lottiefiles/react-lottie-player';
import ClickAnimation from '../../assets/LottieAnimation/ClickAnimation.json';
import { useNavigate } from 'react-router-dom';
import DungeonCanvas from '../Game/DungeonCanvas';
import RuinsCanvas from '../Game/RuinsCanvas';
import MountainCanvas from '../Game/MountainCanvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarProvider, SidebarTrigger, SidebarMenuItem, SidebarMenuButton, SidebarMenu, SidebarHeader,SidebarMenuAction , SidebarMenuSub , SidebarMenuSubItem , SidebarFooter , SidebarInset, SidebarMenuSubButton} from '@/components/ui/sidebar';
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  LifeBuoy,
  LogOut,
  MoreHorizontal as MoreHorizontalIcon,
  Send,
  Settings2,
  Share,
  Sparkles,
  Trash2,
  BotMessageSquare,
  Headphones,
  Plus,
  BookCheck
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import axios from "axios";
import LearningInsetContent from './LearningInsetContent';
import ChatInsetContent from './ChatInsetContent';
import CreateCustom from './CreateCustom';
import ListCustom from './ListCustom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FatiguePopup from './FatiguePopup';

// 추가된 데이터 객체
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Learning",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Listening",
          icon: Headphones,
          url: "#",
        },
        {
          title: "Reading",
          icon: BookOpen,
          url: "#",
        },
        {
          title: "ETC",
          icon: Command,
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "New Chat",
      icon: BotMessageSquare,
      url: "#",
    }
  ],
}

const canvases = [DungeonCanvas, RuinsCanvas, MountainCanvas];

const MainContainer = ({ selectedGame }) => {
  const { cards, loading, loadMoreCards, isLoggedIn, fatigue } = useStore();
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [overscrollShadow, setOverscrollShadow] = useState(0);
  const [canvasValue, setCanvasValue] = useState(null);
  const navigate = useNavigate();
  const [position, setPosition] = React.useState("Listening")
  const [activeMenu, setActiveMenu] = useState('Listening');
  const [selectedMenu, setSelectedMenu] = useState('Reading');
  const [visibleCards, setVisibleCards] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const playerRef = useRef(null);
  const [showFatiguePopup, setShowFatiguePopup] = useState(false);

  // 예시 단어 목록 (실제로는 API나 상태에서 가져와야 합니다)
  const wrongWords = [
    { english: 'apple', korean: '사과' },
    { english: 'banana', korean: '바나나' },
    { english: 'cherry', korean: '체리' },
    { english: 'date', korean: '대추' },
    { english: 'elderberry', korean: '엘더베리' },
    { english: 'fig', korean: '무화과' },
  ];

  // 대화방 상태와 현재 활성 대화방을 관리하는 상태
  const [chatRooms, setChatRooms] = useState({
    'New Chat': []
  });
  const [activeRoomId, setActiveRoomId] = useState('New Chat');

  // 새 채팅방 추가 함수
  const addNewChatRoom = () => {
    const newRoomId = `Chat ${Object.keys(chatRooms).length + 1}`;
    const timestamp = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    setChatRooms(prev => ({
      ...prev,
      [newRoomId]: [{
        sender: 'bot',
        text: "Hello! I'm here to help you with your English! What would you like to talk about today?",
        timestamp
      }]
    }));
    setActiveRoomId(newRoomId);
  };

  // 메시지 전송 함수 수정
  const sendMessage = async (message) => {
    try {
      const timestamp = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // 사용자 메시지 추가
      setChatRooms(prev => ({
        ...prev,
        [activeRoomId]: [
          ...(prev[activeRoomId] || []),
          { sender: 'user', text: message, timestamp }
        ]
      }));

      // API 호출
      const response = await axios.post('/api/chat/message', {
        roomId: activeRoomId,
        message: message
      });

      console.log('Bot response:', response.data); // 응답 구조 확인

      // 봇 응답 추가 (response.data.response에서 메시지 추출)
      const botTimestamp = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      setChatRooms(prev => ({
        ...prev,
        [activeRoomId]: [
          ...(prev[activeRoomId] || []),
          {
            sender: 'bot',
            text: response.data.response,  // response 객체에서 메시지 추출
            timestamp: botTimestamp
          }
        ]
      }));

    } catch (error) {
      console.error('메시지 전송 오류:', error);
      console.error('Response data:', error.response?.data);

      // 에러 발생 시 사용자에 알림
      setChatRooms(prev => ({
        ...prev,
        [activeRoomId]: [
          ...(prev[activeRoomId] || []),
          {
            sender: 'bot',
            text: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            timestamp: new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })
          }
        ]
      }));
    }
  };

  // 대화방 선택 함수
  const handleRoomSelect = (roomId) => {
    setActiveRoomId(roomId);
    setSelectedMenu('ChatBot'); // ChatBot 메뉴 선택 태로 변경
  };

  // 대화방 삭제 함수
  const handleDeleteChatting = async (roomId) => {
    try {
      // 백엔드에 대화방 삭제 요청
      await axios.delete(`/api/chat/room/${roomId}`);

      // 프론트엔드 상태에서 채팅방 완전히 삭제
      setChatRooms(prevRooms => {
        const newRooms = { ...prevRooms };
        delete newRooms[roomId];
        return newRooms;
      });

      // 삭제된 채팅방이 현재 활성화된 채팅방이었다면
      if (activeRoomId === roomId) {
        // 다른 채팅방이 있으면 첫 번째 채팅방으로, 없으면 'New Chat'으로 설정
        const remainingRooms = Object.keys(chatRooms).filter(id => id !== roomId);
        if (remainingRooms.length > 0) {
          setActiveRoomId(remainingRooms[0]);
        } else {
          // 모든 채팅방이 삭제되었을 때 'New Chat' 생성
          setChatRooms(prev => ({
            'New Chat': []
          }));
          setActiveRoomId('New Chat');
        }
      }
    } catch (error) {
      console.error("대화 삭제 오류:", error);
    }
  };

  const handleRenameRoom = (roomId, newName) => {
    if (!newName.trim()) return;
    
    setChatRooms(prev => {
      const messages = prev[roomId];
      const newRooms = { ...prev };
      delete newRooms[roomId];
      return {
        ...newRooms,
        [newName]: messages
      };
    });
    
    if (activeRoomId === roomId) {
      setActiveRoomId(newName);
    }
    setEditingRoomId(null);
    setNewRoomName('');
  };

  useEffect(() => {
    if (cards.length === 0) {
      loadMoreCards(); // 초기 카드 로드
    }
  }, [loadMoreCards]);

  useEffect(() => {
    setVisibleCards(cards.slice(0, 3)); // 초기 카드 3개 설정
  }, [cards]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isLoggedIn || selectedMenu !== 'Reading') return;

    const handleScroll = () => {
      // 스크롤이 바닥에 도달했는지 확인
      const isBottom =
          Math.abs(
              container.scrollHeight - container.scrollTop - container.clientHeight
          ) < 1;

      if (isBottom && !loading) {
        console.log('Loading more cards...'); // 디버깅용
        loadMoreCards();
      }

      // 오버스크롤 그림자 효과
      if (container.scrollTop <= 0) {
        const overscrollAmount = Math.abs(container.scrollTop);
        setOverscrollShadow(Math.min(overscrollAmount + 10, 100));
      } else {
        setOverscrollShadow(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading, isLoggedIn, selectedMenu, loadMoreCards]);

  useEffect(() => {
    // cards 배열이 업데이트될 때마다 visibleCards를 업데이트
    setVisibleCards(cards.slice(0, visibleCards.length + 3));
  }, [cards]);

  // 컴포넌트 마운트/언마운트 시 애니메이션 상태 초기화
  useEffect(() => {
    return () => {
      setShowAnimation(false);
      setIsExiting(false);
      setAnimationPosition({ x: 0, y: 0 });
    };
  }, []);

  const handleStartGame = useCallback(async () => {
    try {
      const userId = sessionStorage.getItem("id");

      // 피로도 5 증가 API 호출
      const response = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/game/start`,
          { userId, amount: 5 },
          { withCredentials: true }
      );

      if (response.status === 200) {
        const randomCanvas = canvases[Math.floor(Math.random() * canvases.length)];
        setCanvasValue(randomCanvas);

        // 상태 초기화
        setShowAnimation(false);
        setIsExiting(false);
        setAnimationPosition({ x: 0, y: 0 });

        navigate('/loading');

        const timer = setTimeout(() => {
          if (randomCanvas === DungeonCanvas) {
            navigate('/dungeon');
          } else if (randomCanvas === MountainCanvas) {
            navigate('/mountain');
          } else if (randomCanvas === RuinsCanvas) {
            navigate('/ruins');
          }
        }, 3000);

        return () => clearTimeout(timer);
      } else {
        console.error('Failed to increase fatigue:', response.statusText);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, [navigate]);

  const handleMenuClick = (title) => {
    setSelectedMenu(title);
  };

  const renderInsetContent = () => {
    switch (selectedMenu) {
      case 'Reading':
        return (
          <LearningInsetContent
            scrollContainerRef={scrollContainerRef}
            overscrollShadow={overscrollShadow}
            visibleCards={visibleCards}
            wrongWords={wrongWords}
            loading={loading}
          />
        );
      case 'ChatBot':
        return (
          <ChatInsetContent
            activeRoomId={activeRoomId}
            chatRooms={chatRooms}
            addNewChatRoom={addNewChatRoom}
            sendMessage={sendMessage}
          />
        );
      case 'Create':
        return <CreateCustom />;
      case 'List':
        return <ListCustom />;
      default:
        return null;
    }
  };

  const handleButtonClick = (e) => {
    const userPlan = sessionStorage.getItem("plan");

    // 피로도가 100%일 때
    if (fatigue >= 100 && userPlan !== "pro") {
      setShowFatiguePopup(true);
      return;
    }

    if (showAnimation || isExiting) return;

    const buttonRect = e.currentTarget.getBoundingClientRect();
    setAnimationPosition({
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2
    });

    setShowAnimation(true);
    setIsExiting(false);

    setTimeout(() => {
      setShowAnimation(false);
      setIsExiting(true);
      
      setTimeout(() => {
        handleStartGame();
      }, 500);
    }, 1000);
  };

  return (
      <div className={`w-full h-auto flex flex-col items-center justify-start bg-white rounded-lg
      transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      >
        {isLoggedIn ? (
            <>
              <div className="w-full grid grid-cols-7 gap-4 py-4 pb-0">
                <div className='w-40 h-14 col-span-2'></div>
                <div className="relative w-40 h-14 col-span-1 col-start-4">
                  <Button
                      onClick={handleButtonClick}
                      className="w-full h-full text-white rounded-md font-bold text-xl hover:scale-125 transition-all duration-500 jua-regular"
                      disabled={showAnimation || isExiting}
                  >
                    게임 시작하기
                  </Button>

                  {showAnimation && (
                      <div
                          className="fixed pointer-events-none"
                          style={{
                            left: animationPosition.x - 100,
                            top: animationPosition.y - 100,
                            width: '200px',
                            height: '200px',
                            zIndex: 100
                          }}
                      >
                        <Player
                          ref={playerRef}
                          autoplay
                          keepLastFrame={false}
                          src={ClickAnimation}
                          style={{ width: '200px', height: '200px' }}
                          onComplete={() => {
                            setShowAnimation(false);
                          }}
                        />
                      </div>
                  )}
                </div>
                <div className='col-start-5 col-span-1 flex items-start justify-start pl-6'>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <img src="src/assets/imgs/info.png" alt="info" className="w-6 h-6" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>게임을 진행할 때 마다 5의 피로도가 증가합니다.</p>
                        <p>게임에서 승리할 경우 5의 피로도가 더 증가합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className='w-40 col-start-6 flex items-center justify-center'>
                  <DropdownMenu className='mr-4 w-40'>
                    <DropdownMenuTrigger asChild className='mr-4'>
                      <Button variant="outline" className='kanit-regular'>{position}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel className='kanit-regular'>Selected Game</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup className='jua-regular' value={position} onValueChange={setPosition}>
                        <DropdownMenuRadioItem value="Listening">리스닝</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Reading">리딩</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="ETC">기타</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div ref={containerRef} className="w-full h-[calc(100vh-150px)] relative flex">
                {/* 메인 컨텐츠 영역 */}
                <div className="flex-1 p-4 overflow-hidden h-full">
                  <SidebarProvider>
                    <Sidebar variant="inset">
                      <SidebarHeader>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                              <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                  <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                  <span className="truncate font-semibold">LinguaGen</span>
                                  <span className="truncate text-xs">AI platform</span>
                                </div>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarHeader>
                      <SidebarContent>
                        <SidebarGroup>
                          
                          <SidebarGroupLabel>
                            Learning
                          </SidebarGroupLabel>
                          <SidebarMenu>
                            {data.navMain[0].items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                  <SidebarMenuButton
                                      asChild
                                      isActive={selectedMenu === item.title}
                                      onClick={() => handleMenuClick(item.title)}
                                  >
                                    <a href={item.url}>
                                      <item.icon />
                                      <span className='ml-2'>{item.title}</span>
                                    </a>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                          <SidebarGroupLabel>ChatBot</SidebarGroupLabel>
                          <SidebarMenu>
                            {Object.keys(chatRooms).map((roomId) => (
                                <SidebarMenuItem key={roomId}>
                                  <SidebarMenuButton asChild onClick={() => handleRoomSelect(roomId)}>
                                    <a href="#" className="flex items-center">
                                      <BotMessageSquare className="h-4 w-4 mr-2" />
                                      {editingRoomId === roomId ? (
                                        <input
                                          type="text"
                                          value={newRoomName}
                                          onChange={(e) => setNewRoomName(e.target.value)}
                                          onBlur={() => handleRenameRoom(roomId, newRoomName)}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              handleRenameRoom(roomId, newRoomName);
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          autoFocus
                                          className="bg-background border rounded px-1 py-0.5 text-sm"
                                        />
                                      ) : (
                                        <span>{roomId}</span>
                                      )}
                                    </a>
                                  </SidebarMenuButton>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <SidebarMenuAction showOnHover>
                                        <MoreHorizontalIcon />
                                        <span className="sr-only">More</span>
                                      </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48" side="bottom" align="end">
                                      <DropdownMenuItem>
                                        <Folder className="text-muted-foreground" />
                                        <span>Save Chatting</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        setEditingRoomId(roomId);
                                        setNewRoomName(roomId);
                                      }}>
                                        <Share className="text-muted-foreground" />
                                        <span>Rename</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleDeleteChatting(roomId)}>
                                        <Trash2 className="text-muted-foreground" />
                                        <span>Delete Chatting</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </SidebarMenuItem>
                            ))}

                            <SidebarMenuItem>
                              <SidebarMenuButton onClick={addNewChatRoom}>
                                <Plus className="h-4 w-4 mr-2" />
                                <span>New Chat</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                          <SidebarGroupLabel>Custom</SidebarGroupLabel>
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <SidebarMenuButton
                                  asChild
                                  isActive={selectedMenu === 'Create'}
                                  onClick={() => handleMenuClick('Create')}
                                  data-button-id="create-button" // 식별자 추가
                              >
                                <a href="#">
                                  <BookCheck className="h-4 w-4 mr-2" />
                                  <span>Create</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton
                                asChild
                                isActive={selectedMenu === 'List'}
                                onClick={() => handleMenuClick('List')}
                              >
                                <a href="#">
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  <span>List</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup className="mt-auto">
                          <SidebarGroupContent>
                            <SidebarMenu>
                              {data.navSecondary.map((item) => (
                                  <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="sm">
                                      <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                      </a>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </SidebarGroup>
                      </SidebarContent>
                      <SidebarFooter>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                  <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={data.user.avatar}
                                        alt={data.user.name}
                                    />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                  </Avatar>
                                  <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                  {data.user.name}
                                </span>
                                    <span className="truncate text-xs">
                                  {data.user.email}
                                </span>
                                  </div>
                                  <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                  side="bottom"
                                  align="end"
                                  sideOffset={4}
                              >
                                <DropdownMenuLabel className="p-0 font-normal">
                                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                      <AvatarImage
                                          src={data.user.avatar}
                                          alt={data.user.name}
                                      />
                                      <AvatarFallback className="rounded-lg">
                                        CN
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                  <span className="truncate font-semibold">
                                    {data.user.name}
                                  </span>
                                      <span className="truncate text-xs">
                                    {data.user.email}
                                  </span>
                                    </div>
                                  </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                  <DropdownMenuItem>
                                    <Sparkles />
                                    Upgrade to Pro
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                  <DropdownMenuItem>
                                    <BadgeCheck />
                                    Account
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <CreditCard />
                                    Billing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Bell />
                                    Notifications
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <LogOut />
                                  Log out
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarFooter>
                    </Sidebar>
                    <SidebarInset>
                      <header className="flex h-16 shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-4">
                          <SidebarTrigger className="-ml-1" />
                          <Separator orientation="vertical" className="mr-2 h-4" />
                          <Breadcrumb>
                            <BreadcrumbList>
                              <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#" onClick={() => handleMenuClick('Reading')}>
                                  {selectedMenu === 'ChatBot' ? 'ChatBot' : 
                                   (selectedMenu === 'Create' || selectedMenu === 'List') ? 'Custom' : 'Learning'}
                                </BreadcrumbLink>
                              </BreadcrumbItem>
                              {selectedMenu && (
                                  <>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                      <BreadcrumbPage>
                                        {selectedMenu === 'ChatBot' ? activeRoomId : 
                                         selectedMenu === 'Create' ? 'Create Question' :
                                         selectedMenu === 'List' ? 'My Questions' : selectedMenu}
                                      </BreadcrumbPage>
                                    </BreadcrumbItem>
                                  </>
                              )}
                            </BreadcrumbList>
                          </Breadcrumb>
                        </div>
                      </header>
                      {renderInsetContent()}
                    </SidebarInset>
                  </SidebarProvider>
                </div>
              </div>

              {showFatiguePopup && (
                <FatiguePopup onClose={() => setShowFatiguePopup(false)} />
              )}

            </>
        ) : (
            <div className="w-full h-[calc(100vh-200px)] flex flex-col items-center justify-center">
              <h2 className="text-sm font-bold mb-8 mt-12 text-gray-400">* 로그인을 해야 게임을 할 수 있습니다 *</h2>
              <div className="w-[800px] h-[800px] bg-transparent flex items-center justify-center">
                <Word3D />
              </div>
            </div>
        )}
      </div>
  );
};

export default MainContainer;
