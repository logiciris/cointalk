import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth } from './redux/actions/authActions';

// 컴포넌트 임포트
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// 페이지 임포트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import PostsPage from './pages/PostsPage';
import CreatePostPage from './pages/CreatePostPage';
import ExplorePage from './pages/ExplorePage';
// import CoinPage from './pages/CoinPage';
import CoinsListPage from './pages/CoinsListPage';
import CoinActionPage from './pages/CoinActionPage';
import TradePage from './pages/TradePage';
// import CoinChatPage from './pages/CoinChatPage';
import PortfolioPage from './pages/PortfolioPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import AdminPage from './pages/AdminPage';

import TwoFactorSettingsPage from './pages/TwoFactorSettingsPage';

// 스타일 임포트
import './styles/App.css';
import './styles/Messages.css';

function App() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // 사용자 인증 상태 확인
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/create" element={<CreatePostPage />} />
            <Route path="/posts/:postId" element={<PostPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/coins" element={<CoinsListPage />} />
            <Route path="/coin/:symbol/action" element={<CoinActionPage />} />
            {/* <Route path="/coin/:symbol" element={<CoinPage />} /> */}
            <Route path="/trade/:symbol" element={<TradePage />} />
            {/* <Route path="/coin/:symbol/chat" element={<CoinChatPage />} /> */}
            <Route path="/portfolio" element={<PortfolioPage />} />}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
            <Route path="/settings/security" element={<SecuritySettingsPage />} />
            <Route path="/settings/2fa" element={<TwoFactorSettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
