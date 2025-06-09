import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../hooks/useTranslation';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  
  // localStorage에서 사용자 정보 가져오기 (Redux에 없을 경우)
  let currentUser = user;
  if (!currentUser) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
  }
  
  // 임시 코인 데이터
  const coins = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 58432.21, change: 2.4 },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3521.08, change: -1.2 },
    { id: 3, name: 'Cardano', symbol: 'ADA', price: 2.85, change: 5.7 },
    { id: 4, name: 'Solana', symbol: 'SOL', price: 158.64, change: 8.3 },
    { id: 5, name: 'Ripple', symbol: 'XRP', price: 1.12, change: -0.8 }
  ];

  return (
    <div className="sidebar">
      <nav>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <i className="bi bi-house nav-icon-menu"></i> {t('nav.home', '홈')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/posts" className={`nav-link ${location.pathname.startsWith('/posts') ? 'active' : ''}`}>
              <i className="bi bi-file-text nav-icon-menu"></i> {t('nav.posts', '게시물')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/explore" className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}>
              <i className="bi bi-compass nav-icon-menu"></i> {t('nav.search', '탐색')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/coins" className={`nav-link ${location.pathname === '/coins' ? 'active' : ''}`}>
              <i className="bi bi-currency-bitcoin nav-icon-menu"></i> {t('nav.coins', '코인')}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/saved" className={`nav-link ${location.pathname === '/saved' ? 'active' : ''}`}>
              <i className="bi bi-bookmark nav-icon-menu"></i> {t('nav.saved', '저장됨')}
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to={currentUser ? `/profile/${currentUser.username}` : '/profile'} 
              className={`nav-link ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
            >
              <i className="bi bi-person nav-icon-menu"></i> {t('nav.profile', '프로필')}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="coin-ticker">
        <div className="sidebar-title">{t('coins.live_prices', '실시간 코인 시세')}</div>
        {coins.map(coin => (
          <div key={coin.id} className="coin-item">
            <div className="coin-info">
              <div className="coin-logo">
                {coin.symbol === 'BTC' && '₿'}
                {coin.symbol === 'ETH' && 'Ξ'}
                {coin.symbol === 'ADA' && '₳'}
                {coin.symbol === 'SOL' && '◎'}
                {coin.symbol === 'XRP' && '✕'}
              </div>
              <span className="coin-name">{coin.symbol}</span>
            </div>
            <div className="coin-price-info">
              <div className="coin-price">${coin.price.toLocaleString()}</div>
              <div className={`price-change ${coin.change >= 0 ? 'price-up' : 'price-down'}`}>
                {coin.change >= 0 ? '+' : ''}{coin.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
