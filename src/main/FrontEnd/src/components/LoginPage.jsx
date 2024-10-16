import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import '../App.css';
import Stars from './Stars';
import Overlay from './Overlay';
import useStore from '../store/useStore';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function LoginPage() {
  // 로그인 관련 상태 관리
  const [fadeIn, setFadeIn] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false); // 회원가입 폼 표시 여부
  const [showSignupNext, setShowSignupNext] = useState(false); // SignupNext 표시 여부
  const navigate = useNavigate();
  const { setIsLoggedIn } = useStore();

  const validUser = {
    id: "test",
    password: "test"
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (id === validUser.id && password === validUser.password) {
      setIsLoggedIn(true);
      setError("");
      navigate('/main');
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleSignupToggle = () => {
    setShowSignup(!showSignup); // 회원가입 폼 표시 토글
  };

  const handleNextSignup = () => {
    setShowSignupNext(true); // Next 버튼 누르면 SignupNext로 이동
  };

  const handlePreviousSignup = () => {
    setShowSignupNext(false); // 이전 버튼 누르면 Signup 페이지로 돌아가게 함
  };

  useState(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <div
      style={{ width: '100vw' }}
      className={`login-page-container w-full h-screen grid lg:grid-cols-2 ${fadeIn ? 'fade-in' : ''} overflow-scroll lg:overflow-hidden`}>

      <div className="flex items-center justify-center py-12 bg-white">
        {showSignupNext ? (
          <SignupNext onPreviousSignup={handlePreviousSignup} />
        ) : showSignup ? (
          <Signup onSignupToggle={handleSignupToggle} onNextSignup={handleNextSignup} />
        ) : (
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">로그인</h1>
              <p className="text-sm text-gray-500">
                {error && <span className="text-red-500">{error}</span>}
              </p>
            </div>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="id">아이디</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="ID"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="PASSWORD"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                로그인
              </Button>
              <Button variant="outline" className="w-full">
                Google 로 로그인하기
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              아직 계정이 없으신가요?{" "}
              <span onClick={handleSignupToggle} className="underline cursor-pointer">
                회원가입
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="relative w-full h-full" style={{ backgroundColor: '#12071f' }}>
        <Stars className="w-full h-full" />
        <Overlay />
      </div>
    </div>
  );
}

// Signup 컴포넌트
function Signup({ onSignupToggle, onNextSignup }) {
  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">회원가입</h1>
      </div>
      <form className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" placeholder="example@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="대문자, 소문자 포함 8자리 이상"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">비밀번호 확인</Label>
          <Input id="confirm-password" type="password" placeholder="비밀번호 확인" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">전화번호</Label>
          <Input id="phone" type="tel" placeholder="전화번호 입력" required />
        </div>
        <div className="grid gap-2">
          <div className="flex gap-2">
            <Input id="address" type="text" placeholder="주소" />
            <Button variant="outline">주소 검색</Button>
          </div>
          <Input id="detailed-address" type="text" placeholder="상세 주소" />
        </div>
        <Button type="button" className="w-full" onClick={onNextSignup}>
          Next
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        <span onClick={onSignupToggle} className="underline cursor-pointer">
          로그인으로 돌아가기
        </span>
      </div>
    </div>
  );
}

// SignupNext 컴포넌트
function SignupNext({ onPreviousSignup }) {
  const [sliderValue, setSliderValue] = useState(33); // 초기 값 33

  const getTier = () => {
    if (sliderValue < 49) return "Bronze";
    if (sliderValue < 80) return "Silver";
    return "Gold";
  };

  return (
    <div className="flex justify-center items-center w-2/3 h-auto">
      <div className='w-full h-auto p-12 flex flex-col justify-center items-center mt-16'>
        <p className='font-bold text-xl'>좋아하는 관심사를 골라주세요</p>
        <ToggleGroup type="multiple" variant='outline' className='grid grid-cols-6 mt-12 gap-4'>
          <ToggleGroupItem value='movie' className='col-span-2'>영화</ToggleGroupItem>
          <ToggleGroupItem value='dailySpeech' className='col-span-2'>일상회화</ToggleGroupItem>
          <ToggleGroupItem value='travel' className='col-span-2'>여행</ToggleGroupItem>
          <ToggleGroupItem value='business' className='col-start-2 col-span-2'>비지니스</ToggleGroupItem>
          <ToggleGroupItem value='drama' className='col-start-4 col-span-2'>드라마</ToggleGroupItem>
          <ToggleGroupItem value='anime' className='col-span-2'>애니</ToggleGroupItem>
          <ToggleGroupItem value='normal' className='col-start-3 col-span-2'>일반</ToggleGroupItem>
          <ToggleGroupItem value='literature' className='col-start-5 col-span-2'>문학</ToggleGroupItem>
        </ToggleGroup>

        <div className='mt-20 flex flex-col justify-center items-center w-full'>
          <p className='font-bold text-xl'>당신의 실력을 알려주세요</p>
          <div className='w-full h-[350px] flex flex-col justify-start items-center'>
            <div className='w-full flex flex-row justify-between mt-24'>
              <div className='flex flex-col justify-center items-center'>
                <TooltipProvider >
                  <Tooltip >
                  <TooltipTrigger className='bg-transparent'>
                    <img src="src/assets/imgs/info.png" alt="이미지를 불러올 수 없습니다." className='w-4 h-4 mb-4' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>브론즈</p>
                  </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p>Bronze</p>
                <img src="src/assets/imgs/down.png" alt="이미지를 불러올 수 없습니다" className='w-8 h-8 mt-4' />
              </div>
              <div className='flex flex-col justify-center items-center'>
              <TooltipProvider >
                  <Tooltip >
                  <TooltipTrigger className='bg-transparent'>
                    <img src="src/assets/imgs/info.png" alt="이미지를 불러올 수 없습니다." className='w-4 h-4 mb-4' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>실버</p>
                  </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p>Silver</p>
                <img src="src/assets/imgs/down.png" alt="이미지를 불러올 수 없습니다" className='w-8 h-8 mt-4' />
              </div>
              <div className='flex flex-col justify-center items-center'>
              <TooltipProvider >
                  <Tooltip >
                  <TooltipTrigger className='bg-transparent'>
                    <img src="src/assets/imgs/info.png" alt="이미지를 불러올 수 없습니다." className='w-4 h-4 mb-4' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>골드</p>
                  </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p>Gold</p>
                <img src="src/assets/imgs/down.png" alt="이미지를 불러올 수 없습니다" className='w-8 h-8 mt-4' />
              </div>
            </div>
            <Slider
              defaultValue={[33]}
              value={[sliderValue]}
              max={100}
              step={1}
              className='mt-4'
              onValueChange={(value) => setSliderValue(value[0])}
            />
            <p className='mt-4'>{getTier()}</p>
          </div>
          <div className='w-full h-auto flex flex-row justify-center gap-4'>
            <Button onClick={onPreviousSignup}>이전</Button>
            <Button>가입 완료</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
