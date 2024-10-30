import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useStore from '../../store/useStore';
import '../../App.css';
import Word3D from '../Word3D';
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
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Frame,
  LifeBuoy,
  LogOut,
  Map,
  MoreHorizontal as MoreHorizontalIcon,
  PieChart,
  Send,
  Settings2,
  Share,
  Sparkles,
  SquareTerminal,
  Trash2,
  BotMessageSquare,
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
          url: "#",
        },
        {
          title: "Reading",
          url: "#",
        },
        {
          title: "ETC",
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
      name: "Room_1",
      url: "#",
      icon: BotMessageSquare ,
    },
    {
      name: "Room_2",
      url: "#",
      icon: BotMessageSquare ,
    },
    {
      name: "Room_3",
      url: "#",
      icon: BotMessageSquare ,
    },
  ],
}

const canvases = [DungeonCanvas, RuinsCanvas, MountainCanvas];

const MainContainer = ({ selectedGame }) => {
  const { cards, loading, loadMoreCards, isLoggedIn } = useStore();
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [overscrollShadow, setOverscrollShadow] = useState(0);
  const [canvasValue, setCanvasValue] = useState(null);
  const navigate = useNavigate();
  const [position, setPosition] = React.useState("Listening")
  const [activeMenu, setActiveMenu] = useState('Listening');
  const [selectedMenu, setSelectedMenu] = useState('Listening');
  const [visibleCards, setVisibleCards] = useState([]);

  // 예시 단어 목록 (실제로는 API나 상태에서 가져와야 합니다)
  const wrongWords = [
    { english: 'apple', korean: '사과' },
    { english: 'banana', korean: '바나나' },
    { english: 'cherry', korean: '체리' },
    { english: 'date', korean: '대추' },
    { english: 'elderberry', korean: '엘더베리' },
    { english: 'fig', korean: '무화과' },
  ];

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

  const handleStartGame = useCallback(() => {
    console.log('Selected Game:', selectedGame);
    const randomCanvas = canvases[Math.floor(Math.random() * canvases.length)];
    console.log('Random Canvas Selected:', randomCanvas.name);
    setCanvasValue(randomCanvas);

    // /loading 경로로 이동
    navigate('/loading');

    // 5초 후에 준비된 Canvas로 이동
    setTimeout(() => {
      if (randomCanvas === DungeonCanvas) {
        navigate('/dungeon');
      } else if (randomCanvas === MountainCanvas) {
        navigate('/mountain');
      } else if (randomCanvas === RuinsCanvas) {
        navigate('/ruins');
      }
    }, 3000);
  }, [selectedGame, navigate]);

  const handleMenuClick = (title) => {
    setSelectedMenu(title);
  };

  const renderInsetContent = () => {
    if (selectedMenu === 'Reading') {
      return (
        <div
          ref={scrollContainerRef}
          className="w-full h-[calc(100vh-200px)] pb-20 overflow-y-auto flex justify-center border-t-2 pt-12 relative custom-scrollbar"
          style={{
            boxShadow: `inset 0 ${overscrollShadow}px ${overscrollShadow}px -${overscrollShadow / 2}px rgba(0, 0, 0, 0.1), inset 0 ${overscrollShadow / 2}px ${overscrollShadow / 2}px -${overscrollShadow / 4}px rgba(0, 0, 0, 0.05)`,
          }}
        >
          <div className="w-1/2 grid grid-cols-1 gap-8 pb-8">
            {visibleCards.map((card, index) => (
              <Card key={index} className="w-full" style={{ userSelect: 'none' }}>
                <CardHeader>
                  <CardTitle>{card.date}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row">
                  <div className="flex flex-col w-1/2 text-center">
                    <p className="mb-2">{card.category}</p>
                    <p className="mb-2">{card.level}</p>
                    <p className="mb-2">{card.score}</p>
                    <p className="mb-2">{card.rank}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="btnAnimation btnPush btnLightBlue w-full h-26 mt-2 p-4 flex items-center justify-center ml-12 rounded-md text-black font-bold"
                        style={{ backgroundColor: '#e3eef1', border: 'none', outline: 'none' }}
                      >
                        틀린 단어 보기
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] h-[600px] overflow-y-auto">
                      <DialogHeader className="h-20">
                        <DialogTitle>틀린 단어 노트</DialogTitle>
                        <DialogDescription>틀린 단어를 확인하세요~</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 mb-16 text-center">
                        {wrongWords.map((word, index) => (
                          <React.Fragment key={index}>
                            <div className="bg-gray-100 p-2 rounded">{word.english}</div>
                            <div className="bg-gray-100 p-2 rounded">{word.korean}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
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
    }
    
    // 다른 메뉴들의 컨텐츠
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start mx-12 bg-white rounded-lg">
      {isLoggedIn ? (
        <>
          <div className="w-full flex justify-between mb-4 mt-4">
            <div className='w-40 h-14 ml-4'></div>
            <Button onClick={handleStartGame} className="w-40 h-14 text-white rounded-md font-bold text-xl hover:scale-125 transition-all duration-500 jua-regular">
              게임 시작하기
            </Button>
            <div className='w-40 flex items-center justify-center'>
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

          <div ref={containerRef} className="w-full h-[calc(100vh-200px)] relative flex">
            {/* 메인 컨텐츠 영역 */}
            <div className="flex-1 p-4 overflow-hidden">
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
                      <SidebarGroupLabel>Learning</SidebarGroupLabel>
                      <SidebarMenu>
                        {data.navMain[0].items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                              asChild 
                              isActive={selectedMenu === item.title}
                              onClick={() => handleMenuClick(item.title)}
                            >
                              <a href={item.url}>
                                <span>{item.title}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroup>
                    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                      <SidebarGroupLabel>ChatBot</SidebarGroupLabel>
                      <SidebarMenu>
                        {data.projects.map((item) => (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton asChild>
                              <a href={item.url}>
                                <item.icon />
                                <span>{item.name}</span>
                              </a>
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction showOnHover>
                                  <MoreHorizontalIcon />
                                  <span className="sr-only">More</span>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-48"
                                side="bottom"
                                align="end"
                              >
                                <DropdownMenuItem>
                                  <Folder className="text-muted-foreground" />
                                  <span>Save Chatting</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share className="text-muted-foreground" />
                                  <span>Share Chatting</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Trash2 className="text-muted-foreground" />
                                  <span>Delete Chatting</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>
                        ))}
                        <SidebarMenuItem>
                          <SidebarMenuButton>
                            <MoreHorizontalIcon />
                            <span>More</span>
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
                            <BreadcrumbLink href="#">
                              Learning
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          {selectedMenu && (
                            <>
                              <BreadcrumbSeparator className="hidden md:block" />
                              <BreadcrumbItem>
                                <BreadcrumbPage>{selectedMenu}</BreadcrumbPage>
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