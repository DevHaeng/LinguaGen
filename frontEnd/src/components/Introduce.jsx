import React, { useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

const Card = ({ index, role, name, github, email, skills }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  // 부드러운 애니메이션을 위한 스프링 설정
  const springConfig = { 
    damping: 20, 
    stiffness: 150, 
    mass: 1,
    restDelta: 0.001 // 더 부드러운 복귀를 위한 설정
  };
  
  const rotateXSpring = useSpring(0, springConfig);
  const rotateYSpring = useSpring(0, springConfig);
  const scaleSpring = useSpring(1, springConfig);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // 카드 내에서의 마우스 상대 위치 계산 (-1 to 1)
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = (e.clientY - rect.top) / rect.height * 2 - 1;
    
    // 최대 15도 회전
    rotateXSpring.set(-y * 20);
    rotateYSpring.set(x * 20);
    
    // 마스 위치를 퍼센트로 변환 (그라데이션 효과용)
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    scaleSpring.set(1.02); // 약간의 확대 효과
  };

  const handleMouseLeave = () => {
    // 모든 값을 초기 상태로 부드럽게 복귀
    rotateXSpring.set(0, {
      damping: 20,
      stiffness: 150,
      mass: 1,
      restDelta: 0.001
    });
    rotateYSpring.set(0, {
      damping: 20,
      stiffness: 150,
      mass: 1,
      restDelta: 0.001
    });
    scaleSpring.set(1, {
      damping: 20,
      stiffness: 150,
      mass: 1,
      restDelta: 0.001
    });
    setMousePosition({ x: 50, y: 50 }); // 그라데이션 효과도 중앙으로 복귀
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const getFlippedPosition = (index) => {
    switch(index) {
      case 0:
        return { x: 'calc(50vw - 350px)', y: 'calc(50vh - 475px)' };
      case 1:
        return { x: 'calc(50vw - 740px)', y: 'calc(50vh - 475px)' };
      case 2:
        return { x: 'calc(50vw - 1130px)', y: 'calc(50vh - 475px)' };
      case 3:
        return { x: 'calc(50vw - 1520px)', y: 'calc(50vh - 475px)' };
      default:
        return { x: 0, y: 0 };
    }
  };

  const position = getFlippedPosition(index);

  return (
    <div className="relative w-full h-[650px]">
      {/* 배경 오버레이 */}
      <motion.div
        animate={{
          opacity: isFlipped ? 1 : 0,
          pointerEvents: isFlipped ? 'auto' : 'none',
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setIsFlipped(false)}
      />

      {/* 카드 컨테이너 */}
      <motion.div
        ref={cardRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          x: isFlipped ? position.x : 0,
          y: isFlipped ? position.y : 0,
          opacity: 1,
          zIndex: isFlipped ? 50 : 0,
        }}
        transition={{
          duration: 0.7,
          type: "spring",
          damping: 30,
          stiffness: 100
        }}
        className='relative w-full h-[650px] rounded-xl cursor-pointer overflow-visible'
        style={{
          transformStyle: "preserve-3d",
          perspective: "1400px",
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 회전하는 카드 부 컨테이너 */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            rotateX: rotateXSpring,
            scale: scaleSpring,
          }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{
            duration: 0.7,
            type: "spring",
            damping: 30,
            stiffness: 100
          }}
        >
          {/* 앞면 */}
          <motion.div
            className="absolute w-full h-full rounded-xl"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: 'translateZ(1px)',
              background: `linear-gradient(
                135deg,
                rgba(192, 192, 192, 0.4) 0%,
                rgba(255, 255, 255, 0.6) 50%,
                rgba(192, 192, 192, 0.4) 100%
              )`,
            }}
          >
            {/* 기존 광택 효과 */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                background: `radial-gradient(
                  circle at ${mousePosition.x}% ${mousePosition.y}%,
                  rgba(255, 255, 255, 0.3) 0%,
                  rgba(255, 255, 255, 0.1) 30%,
                  transparent 60%
                )`,
                transform: 'translateZ(1px)',
                mixBlendMode: 'overlay',
              }}
            />

            {/* 기존 메탈릭 효과 */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                background: `linear-gradient(
                  ${45 + (mousePosition.x / 5)}deg,
                  rgba(192, 192, 192, 0.3) 0%,
                  rgba(255, 255, 255, 0.4) 25%,
                  rgba(255, 255, 255, 0.5) 50%,
                  rgba(255, 255, 255, 0.4) 75%,
                  rgba(192, 192, 192, 0.3) 100%
                )`,
                opacity: 0.6,
                transform: 'translateZ(2px)',
                mixBlendMode: 'overlay',
              }}
            />

            {/* 기존 카드 앞면 내용 */}
            <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center rounded-xl">
              <h2 className="text-4xl font-bold mb-4 tracking-wider"
                  style={{
                    background: `linear-gradient(to right, #2c3e50 0%, #3498db 50%, #2c3e50 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    transform: 'translateZ(20px)',
                  }}>
                {role}
              </h2>
              <p className="text-2xl text-black/90 mt-4 font-bold" 
                 style={{ transform: 'translateZ(20px)' }}>
                {name}
              </p>
            </div>
          </motion.div>

          {/* 뒷면 */}
          <motion.div
            className="absolute w-full h-full rounded-xl"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: 'rotateY(180deg) translateZ(1px)',
              background: `linear-gradient(
                135deg,
                rgba(192, 192, 192, 1) 0%,
                rgba(255, 255, 255, 1) 50%,
                rgba(192, 192, 192, 1) 100%
              )`,
            }}
          >
            <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">About Me</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  GitHub: {" "}
                  <a 
                    href={`https://github.com/${github}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="info-link"
                  >
                    github.com/{github}
                  </a>
                </p>
                <p>
                  Email: {" "}
                  <a 
                    href={`mailto:${email}`}
                    className="info-link"
                  >
                    {email}
                  </a>
                </p>
                <p>Position: {role}</p>
                
                {/* Skills 섹션 수정 */}
                <div className="mt-6">
                  <h4 className="text-xl font-bold mb-4"
                      style={{
                        background: 'linear-gradient(to right, #2c3e50, #3498db)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                    Skills
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <img 
                          src={`/skill-icons/${skill.toLowerCase()}.svg`} 
                          alt={skill}
                          className="w-8 h-8 mb-2"
                        />
                        <span className="text-sm text-gray-600">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// CSS 애니메이션 추가
const styles = `
  @keyframes flicker {
    0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
      opacity: 0.99;
      text-shadow: 
        0 0 4px #fff,
        0 0 11px #fff,
        0 0 19px #fff,
        0 0 40px #3498db,
        0 0 80px #3498db,
        0 0 90px #3498db,
        0 0 100px #3498db,
        0 0 150px #3498db;
    }
    20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
      opacity: 0.4;
      text-shadow: none;
    }
  }

  .neon-static {
    color: #fff;
    text-shadow: 
      0 0 4px #fff,
      0 0 11px #fff,
      0 0 19px #fff,
      0 0 40px #3498db,
      0 0 80px #3498db,
      0 0 90px #3498db,
      0 0 100px #3498db,
      0 0 150px #3498db;
    display: inline-block;
  }

  .neon-flicker {
    color: #fff;
    animation: flicker 2s infinite alternate;
    transition: all 0.3s ease;
    display: inline-block;
  }

  .neon-flicker:hover {
    animation: none;
    opacity: 0.8;
    text-shadow: 
      0 0 2px #fff,
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px #3498db,
      0 0 35px #3498db,
      0 0 40px #3498db,
      0 0 50px #3498db;
  }

  .info-link {
    color: #4a5568;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .info-link:hover {
    color: #3498db;
  }

  .skill-icon {
    transition: transform 0.3s ease;
  }

  .skill-icon:hover {
    transform: scale(1.1);
  }
`;

const Introduce = () => {
  const teamMembers = [
    { 
      role: "Front-End", 
      name: "이성도",
      github: "scarpula",
      email: "dltjdeh7745@naver.com",
      skills: ["React", "Vite", "TailwindCSS", "Shadcn UI", "Docker", "Redis", "React-Query", "Zustand"]
    },
    { 
      role: "Back-End", 
      name: "김민",
      github: "kim-min-min",
      email: "kaner05@naver.com",
      skills: ["Java", "SpringBoot", "MySQL", "Redis", "Docker", "AWS"]
    },
    { 
      role: "Back-End", 
      name: "정수형",
      github: "DevHaeng",
      email: "inttype96@gmail.com",
      skills: ["Java", "SpringBoot", "MySQL", "Redis", "Docker", "AWS","JPA"]
    },
    { 
      role: "Back-End", 
      name: "류훈민",
      github: "hunmin",
      email: "hunmin@email.com",
      skills: ["Java", "SpringBoot", "MySQL", "Redis", "Docker", "AWS","JPA"]
    }
  ];

  return (
    <>
      <style>{styles}</style>
      <div className='w-full min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 md:p-20 lg:p-20'>
        <h1 className="text-5xl font-bold mb-20 text-center tracking-wider"
            style={{
              letterSpacing: '0.15em',
            }}>
          <span className="neon-static">T</span>
          <span className="neon-flicker">ea</span>
          <span className="neon-static">m-S</span>
          <span className="neon-flicker">qu</span>
          <span className="neon-static">ad</span>
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {teamMembers.map((member, index) => (
            <Card 
              key={index} 
              index={index} 
              {...member}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Introduce;