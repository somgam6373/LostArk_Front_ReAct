import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// 레이아웃 및 컴포넌트
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { SidebarAds } from './components/layout/SidebarAds';
import { FloatingBanner } from './components/layout/FloatingBanner';

// 페이지 컴포넌트
import HomePage from './pages/HomePage';
import RaidPage from './pages/RaidPage';
import AuctionPage from './pages/auctionPage';
import ProfilePage from './pages/ProfilePage'; // 새로 만든 프로필 페이지
import { Simulator } from './components/simulator/Simulator';

// 타입 및 상수
import { MOCK_CHARACTER } from './constants';

// 애니메이션 래퍼 (페이지 전환 효과용)
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
);

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#09090b';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [theme]);

  return (
      <BrowserRouter>
        <div className={`min-h-screen transition-colors duration-500 font-sans text-[16px] ${theme === 'dark' ? 'dark text-white' : 'text-slate-900'}`}>

          <Header
              theme={theme}
              setTheme={setTheme}
              setIsMenuOpen={setIsMenuOpen}
          />

          <div className="pt-44 pb-64 px-12 mx-auto flex gap-20 transition-all duration-500 max-w-[1920px]">
            {/* 왼쪽 사이드바 */}
            <div className="hidden 2xl:block w-72 shrink-0">
              <SidebarAds side="left" />
            </div>

            <main className="flex-1 w-full min-h-[80vh] relative z-10">
              <AnimatePresence mode="wait">
                <Routes>
                  {/* 1. 홈 페이지 */}
                  <Route path="/" element={
                    <PageWrapper>
                      <HomePage />
                    </PageWrapper>
                  } />

                  {/* 2. 캐릭터 프로필 페이지 (URL 파라미터 사용 권장) */}
                  <Route path="/profile" element={
                    <PageWrapper>
                      <ProfilePage />
                    </PageWrapper>
                  } />

                  {/* 3. 레이드 페이지 */}
                  <Route path="/raid" element={
                    <PageWrapper>
                      <RaidPage />
                    </PageWrapper>
                  } />

                  {/* 4. 시뮬레이터 */}
                  <Route path="/simulator" element={
                    <PageWrapper>
                      <Simulator character={MOCK_CHARACTER} />
                    </PageWrapper>
                  } />

                  {/* 5. 경매 계산기 */}
                  <Route path="/auction" element={
                    <PageWrapper>
                      <AuctionPage />
                    </PageWrapper>
                  } />
                </Routes>
              </AnimatePresence>
            </main>

            {/* 오른쪽 사이드바 */}
            <div className="hidden 2xl:block w-72 shrink-0">
              <SidebarAds side="right" />
            </div>
          </div>

          <Footer />
          <FloatingBanner />
        </div>
      </BrowserRouter>
  );
}