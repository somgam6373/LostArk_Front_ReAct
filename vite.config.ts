import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // 만약 백엔드 엔드포인트가 '/equipment'라면 직접 등록도 가능합니다.
          '/equipment': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/stat':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/arkgrid':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/engravings':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/gems':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/avatars':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/cards':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/arkpassive':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/siblings': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/combat-skills': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/markets': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },

          '/goldCalculator':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          },
          '/skillcode':{
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          }
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
