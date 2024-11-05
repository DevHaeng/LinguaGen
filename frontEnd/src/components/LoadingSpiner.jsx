import React, { useState, useEffect } from 'react';
import Lottie from 'react-lottie';
import styled from 'styled-components';
import LoadingAnimation from '../assets/LottieAnimation/LoadingSpiner.json';

const LoadingContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  min-height: 100vh;
`;

const LoadingWrapper = styled.div`
  width: 24rem;
  height: 24rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 768px) {
    width: 20rem;
    height: 20rem;
    padding: 1.5rem;
  }
`;

const LottieWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
`;

const LoadingText = styled.p`
  margin-top: 2rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: #4B5563;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: LoadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  };

  return (
    <LoadingContainer>
      <LoadingWrapper>
        <LottieWrapper>
          <Lottie 
            options={defaultOptions}
            isClickToPauseDisabled={true}
            style={{ 
              width: '100%',
              height: '100%',
              maxWidth: '400px',
              maxHeight: '400px'
            }}
          />
        </LottieWrapper>
        {isLoading && (
          <LoadingText>
            Loading...
          </LoadingText>
        )}
      </LoadingWrapper>
    </LoadingContainer>
  );
};

export default LoadingSpinner;