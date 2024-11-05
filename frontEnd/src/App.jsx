import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageLoader from './components/PageLoader.jsx';
import LandingPage from './components/LandingPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import MainPage from './components/MainPage.jsx';
import DashBoard from './components/DashBoard/DashBoard.jsx';
import MyPage from './components/MyPage/MyPage.jsx';
import Community from './components/Community/Community.jsx';
import DailyQuiz from './components/DailyQuiz.jsx';
import User from './components/Test/User.jsx';
import RankingPage from './components/RankingPage.jsx';
import DungeonCanvas from './components/Game/DungeonCanvas.jsx';
import MountainCanvas from './components/Game/MountainCanvas.jsx';
import RuinsCanvas from './components/Game/RuinsCanvas.jsx';
import Writing from './components/Community/Writing.jsx';
import WelcomeMessage from './components/WelcomeMessage.jsx';

import './styles/global.css';

// Lazy loading components

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path='/mypage' element={<MyPage />} />
          <Route path='/community' element={<Community />} />
          <Route path="/community/writing" element={<Writing />} />
          <Route path='/dailyQuiz' element={<DailyQuiz />} />
          <Route path="/users/:id" element={<User />} />
          <Route path='/ranking' element={<RankingPage />} />
          <Route path='/Test' element={<User />} />
          <Route path='/dungeon' element={<DungeonCanvas />} />
          <Route path='/mountain' element={<MountainCanvas />} />
          <Route path='/ruins' element={<RuinsCanvas />} />
          <Route path='/loading' element={<PageLoader />} />
          <Route path='/demo' element={<WelcomeMessage />} />
          <Route path="/community/:board" element={<Community />} />
          <Route path="/community/:board/detailview/:idx" element={<Community />} />
          <Route path="/community/:board/detailview" element={<Community />} />
          <Route path='/community/:board/writing' element={<Community />} />
        </Routes>
    </Router>
  );
}

export default App;
