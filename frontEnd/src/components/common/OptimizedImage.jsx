import { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  quality = 80,
  placeholder = 'blur', // 'blur' | 'empty'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef(null);

  useEffect(() => {
    // WebP 지원 여부 확인
    const webpSupported = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;

    // 이미지 경로 설정
    const imageUrl = new URL(src, window.location.origin);
    const extension = imageUrl.pathname.split('.').pop();
    
    // WebP 지원시 WebP 형식으로 변환된 이미지 사용
    if (webpSupported && !src.endsWith('.webp')) {
      setImageSrc(`${imageUrl.pathname.replace(`.${extension}`, '.webp')}`);
    } else {
      setImageSrc(src);
    }

    // Intersection Observer 설정
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  const imageStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };

  const placeholderStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '200px', // 기본 높이 설정
    backgroundColor: '#f0f0f0',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  return (
    <div ref={imgRef} style={{ position: 'relative' }}>
      {(!isLoaded && placeholder === 'blur') && (
        <div style={placeholderStyle} />
      )}
      {(isLoaded || placeholder === 'empty') && (
        <picture>
          <source
            srcSet={imageSrc}
            type={imageSrc.endsWith('.webp') ? 'image/webp' : `image/${imageSrc.split('.').pop()}`}
          />
          <img
            src={src}
            alt={alt}
            className={`${className} optimized-image`}
            style={imageStyle}
            width={width}
            height={height}
            loading={loading}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.src = '/fallback-image.png'; // 폴백 이미지 설정
            }}
          />
        </picture>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;