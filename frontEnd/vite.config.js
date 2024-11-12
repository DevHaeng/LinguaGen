import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'My React App',
        short_name: 'React App',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      'Cache-Control': 'public, max-age=31536000', // 1년
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // 이미지 최적화 설정 추가
    assetsInlineLimit: 4096, // 4kb 이하의 이미지는 base64로 인라인화
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query'
          ],
        },
        // 캐싱을 위한 청크 파일 이름에 해시 추가
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          else if (/\.css$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          else if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // 이미지 최적화 관련 추가 설정
    optimizeDeps: {
      include: ['@assets/**/*.{png,jpg,jpeg,gif,svg,webp}']
    },
    // 빌드 시 이미지 최적화 설정
    terserOptions: {
      compress: {
        drop_console: true,  // 콘솔 로그 제거
      },
    },
    // 이미지 압축 설정
    minify: 'terser',
    brotliSize: false,  // brotli 압축 크기 계산 비활성화로 빌드 속도 향상
  },
  // 이미지 처리를 위한 설정 추가
  optimizeDeps: {
    include: ['sharp']  // sharp 패키지 포함
  }
});