import * as THREE from 'three'
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Plane, useAspect, useTexture } from '@react-three/drei'
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing'
import Fireflies from './Fireflies.jsx'
import bgUrl from '../assets/LandingAssets/bg.jpg'
import starsUrl from '../assets/LandingAssets/stars.png'
import groundUrl from '../assets/LandingAssets/ground.png'
import bearUrl from '../assets/LandingAssets/DevilishCat.png'
import leaves1Url from '../assets/LandingAssets/leaves1.png'
import leaves2Url from '../assets/LandingAssets/leaves2.png'
import layerMaterial from './materials/layerMaterial.jsx'
import './LandingPage.css'
import { TypeAnimation } from 'react-type-animation'
import useStore from '../store/useStore.js'
import { useNavigate } from 'react-router-dom'

function Scene({ dof }) {
  const scaleN = useAspect(1600, 1000, 1.05)
  const scaleW = useAspect(2200, 1000, 1.05)
  const textures = useTexture([bgUrl, starsUrl, groundUrl, bearUrl, leaves1Url, leaves2Url])
  const group = useRef()
  const layersRef = useRef([])
  const [movement] = useState(() => new THREE.Vector3())
  const [temp] = useState(() => new THREE.Vector3())
  const layers = useMemo(() => [
    { texture: textures[0], z: 0, factor: 0.005, scale: scaleW },
    { texture: textures[1], z: 10, factor: 0.005, scale: scaleW },
    { texture: textures[2], z: 20, scale: scaleW },
    {
      texture: textures[3],
      z: 30,
      scaleFactor: 0.8,
      scale: [scaleN[0] * 0.45, scaleN[1] * 0.45, 1],
      position: [-55.5, -12, 30]
    },
    { texture: textures[4], factor: 0.03, scaleFactor: 1, z: 40, wiggle: 0.6, scale: scaleW },
    { texture: textures[5], factor: 0.04, scaleFactor: 1.3, z: 49, wiggle: 1, scale: scaleW },
  ], [textures, scaleN, scaleW])

  useFrame((state, delta) => {
    movement.lerp(temp.set(state.mouse.x, state.mouse.y * 0.2, 0), 0.2)
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, state.mouse.x * 20, 0.2)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.mouse.y / 10, 0.2)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -state.mouse.x / 2, 0.2)
    layersRef.current[4].uniforms.time.value = layersRef.current[5].uniforms.time.value += delta
  }, 1)

  return (
    <group ref={group}>
      <Fireflies count={20} radius={80} colors={['orange']} />
      {layers.map(({ scale, texture, ref, factor = 0, scaleFactor = 1, wiggle = 0, z, position }, i) => (
        <Plane scale={scale} args={[1, 1, wiggle ? 10 : 1, wiggle ? 10 : 1]} position={position || [0, 0, z]} key={i} ref={ref}>
          <layerMaterial movement={movement} textr={texture} factor={factor} ref={(el) => (layersRef.current[i] = el)} wiggle={wiggle} scale={scaleFactor} />
        </Plane>
      ))}
    </group>
  )
}

function Effects() {
  const ref = useRef()
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <DepthOfField ref={ref} target={[0, 0, 30]} bokehScale={8} focalLength={0.1} width={1024} />
      <Vignette />
    </EffectComposer>
  )
}

const LandingPage = () => {
  const navigate = useNavigate()
  const {
    isLeaving,
    setIsLeaving,
  } = useStore()
  const [language, setLanguage] = useState('Korean');

  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Key pressed:', event.code);
      
      if (event.key === 'HangulMode' || 
          event.code === 'Lang1' || 
          event.code === 'Lang2' ||
          (event.altKey && event.code === 'AltRight') ||
          event.code === 'CapsLock' ||
          event.code === 'Process') {
        console.log('Language toggle triggered');
        setLanguage(prev => prev === 'Korean' ? 'English' : 'Korean');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'Korean' ? 'English' : 'Korean');
  };

  const handleStartClick = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      navigate('/demo')
    }, 1000) // 페이드 아웃 효과를 위한 시간 조정
  }, [setIsLeaving, navigate])

  const handleLoginClick = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const handleIntroduceClick = useCallback(() => {
    navigate('/introduce')
  }, [navigate])

  return (
    <div className="landing-page">
      <div id="canvasWrapper" className={`${isLeaving ? 'fade-out' : ''}`}>
        <Canvas
          orthographic
          camera={{ zoom: 5, position: [0, 0, 200], far: 300, near: 50 }}
          gl={{ outputEncoding: THREE.sRGBEncoding, toneMapping: THREE.ACESFilmicToneMapping, antialias: false }}
        >
          <Scene />
          <Effects />
        </Canvas>
      </div>
      <div id="overlay">
        <div id="bg main"></div>
        <div id="stars main"></div>
        <div id="ground main"></div>
        <div id="bear main"></div>
        <div id="leaves1 main"></div>
        <div id="leaves2 main"></div>
      </div>
      <div className='absolute top-4 left-4 w-auto h-full bg-transparent z-10 flex flex-col justify-between items-start'>
        <p className='text-white text-5xl kanit-semibold'>LinguaGen</p>
        <p className='text-white text-xl kanit-semibold mb-8'>made by Team-Squad</p>
      </div>
      <div 
        className='absolute bottom-4 right-4 w-auto h-auto bg-transparent z-10 
                   flex flex-col justify-end items-end cursor-pointer
                   hover:opacity-80 transition-opacity duration-200'
        onClick={handleLanguageToggle}
      >
        <p className='text-white text-xl kanit-semibold'>
          {"</"}{language}{">"}
        </p>
      </div>

      <div className="absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2 
                      w-full lg:w-[30rem] h-auto z-10
                      top-0 flex flex-col justify-center items-center 
                      min-h-screen lg:min-h-0
                      px-4 lg:px-0
                      bg-gradient-to-b from-black/70 to-black/70 lg:bg-none
                      backdrop-blur-sm lg:backdrop-blur-none">
        <TypeAnimation
          sequence={[
            'LinguaGen', 1000,
            'Study English', 1000,
            'AI-Powered', 1000,
          ]}
          wrapper="h2"
          cursor={true}
          repeat={Infinity}
          className="text-white text-2xl press-start-2p-regular"
          style={{
            fontSize: '1.7em',
            background: 'linear-gradient(30deg, #c850c0, #ffcc70)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.3',
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        />
        <div className='mt-10 bg-zinc-800/90 lg:bg-zinc-800 p-8 rounded-lg 
                        shadow-lg flex flex-col justify-start items-center 
                        gap-8 w-full lg:w-[24rem] h-auto z-10 
                        backdrop-blur-sm lg:backdrop-blur-none
                        max-w-[24rem]'>
          <button onClick={handleStartClick} 
                  className="custom-btn btn-12 flex justify-center items-center 
                            text-xl w-full lg:w-64 h-16">
            <span>Tutorial</span>
            <span>튜토리얼</span>
          </button>
          <button onClick={handleLoginClick} 
                  className="custom-btn btn-12 flex justify-center items-center 
                            text-xl w-full lg:w-64 h-16">
            <span>Login</span>
            <span>로그인 하러 가기</span>
          </button>
          <button onClick={handleIntroduceClick} 
                  className="custom-btn btn-12 flex justify-center items-center 
                            text-xl w-full lg:w-64 h-16">
            <span>Introduce</span>
            <span>Contact Us</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
