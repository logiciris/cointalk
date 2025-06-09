import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useTranslation } from '../hooks/useTranslation';

const HomePage = () => {
  const { t } = useTranslation();
  // 임시 게시물 데이터
  const posts = [
    {
      id: 1,
      author: {
        id: 101,
        username: 'bitcoinenthusiast',
        avatar: null, // 아바타 이미지 대신 이니셜 사용
        initials: 'BE'
      },
      title: '비트코인 상승세, 올해 말 새로운 고점 찍을까?',
      content: '최근 비트코인 가격이 지속적인 상승세를 보이고 있습니다. 이번 상승세는 기관 투자자들의 관심 증가와 규제 환경 개선으로 인한 것으로 보입니다. 연말까지 새로운 역사적 고점을 기록할 수 있을까요?',
      date: '2025-05-15',
      tags: ['시세분석', '비트코인', '예측'],
      relatedCoins: ['BTC'],
      likes: 42,
      comments: 15,
      views: 230
    },
    {
      id: 2,
      author: {
        id: 102,
        username: 'cryptotrader',
        avatar: null,
        initials: 'CT'
      },
      title: '이더리움 2.0 업그레이드가 가져올 변화',
      content: '이더리움 2.0 업그레이드가 드디어 완료되었습니다. 지분 증명 방식으로의 전환은 네트워크의 효율성과 확장성을 크게 개선할 것으로 기대됩니다. 이로 인해 DeFi 생태계와 NFT 시장에는 어떤 변화가 생길까요?',
      date: '2025-05-14',
      tags: ['이더리움', '업그레이드', 'PoS'],
      relatedCoins: ['ETH'],
      likes: 37,
      comments: 23,
      views: 185
    },
    {
      id: 3,
      author: {
        id: 103,
        username: 'defimaster',
        avatar: null,
        initials: 'DM'
      },
      title: '탈중앙화 금융(DeFi)의 미래와 도전 과제',
      content: '탈중앙화 금융(DeFi)은 전통적인 금융 시스템을 크게 변화시킬 잠재력을 가지고 있습니다. 그러나 확장성 문제, 보안 취약점, 규제 불확실성과 같은 여러 도전 과제가 있습니다. DeFi가 이러한 문제를 어떻게 해결할 수 있을까요?',
      date: '2025-05-13',
      tags: ['DeFi', '금융', '블록체인'],
      relatedCoins: ['ETH', 'AAVE', 'UNI'],
      likes: 29,
      comments: 18,
      views: 142
    }
  ];

  // 임시 트렌딩 코인 데이터
  const trendingCoins = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 58432.21, change: 2.4, icon: '₿' },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 3521.08, change: -1.2, icon: 'Ξ' },
    { id: 3, name: 'Solana', symbol: 'SOL', price: 158.64, change: 8.3, icon: '◎' }
  ];

  return (
    <div className="home-page">
      {/* 환영 배너 */}
      <div className="welcome-banner">
        <h1>{t('common.welcome', 'CoinTalk에 오신 것을 환영합니다')}</h1>
        <p>암호화폐 커뮤니티와 함께 최신 트렌드, 분석, 뉴스를 공유하세요.</p>
        <div className="banner-actions">
          <Button variant="light" className="me-3">지금 시작하기</Button>
          <Button variant="outline-light">더 알아보기</Button>
        </div>
      </div>

      <div className="container-fluid px-0">
        <div className="row g-3">
          <div className="col-md-8">
            {/* 인기 게시물 섹션 */}
            <div className="posts-section">
              <div className="section-header">
                <div className="section-title">{t('posts.title', '인기 게시물')}</div>
                <Link to="/posts" className="section-link">모두 보기</Link>
              </div>
              
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        {post.author.initials}
                      </div>
                      <span className="author-name">{post.author.username}</span>
                    </div>
                    <div className="post-date">{post.date}</div>
                  </div>
                  <Link to={`/posts/${post.id}`}>
                    <h3 className="post-title">{post.title}</h3>
                  </Link>
                  <div className="post-excerpt">{post.content.substring(0, 150)}...</div>
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="post-tag">#{tag}</span>
                    ))}
                    {post.relatedCoins.map(coin => (
                      <span key={coin} className="post-tag coin">${coin}</span>
                    ))}
                  </div>
                  <div className="post-stats">
                    <div className="post-stat">
                      <i className="bi bi-heart stat-icon"></i> {post.likes}
                    </div>
                    <div className="post-stat">
                      <i className="bi bi-chat stat-icon"></i> {post.comments}
                    </div>
                    <div className="post-stat">
                      <i className="bi bi-eye stat-icon"></i> {post.views}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-md-4 d-flex flex-column">
            {/* 트렌딩 코인 섹션 */}
            <div className="trending-section flex-grow-1">
              <div className="section-header">
                <div className="section-title">인기 급상승 코인</div>
                <Link to="/coins" className="section-link">전체보기</Link>
              </div>
              <div className="trending-coins">
                {trendingCoins.map(coin => (
                  <Link to={`/coin/${coin.symbol}`} key={coin.id}>
                    <div className="trend-card">
                      <div className="trend-coin">
                        <div className="trend-logo">{coin.icon}</div>
                        <div className="trend-details">
                          <div className="trend-name">{coin.name}</div>
                          <div className="trend-symbol">{coin.symbol}</div>
                        </div>
                      </div>
                      <div className="trend-data">
                        <div className="trend-price">${coin.price.toLocaleString()}</div>
                        <div className={`trend-change ${coin.change >= 0 ? 'price-up' : 'price-down'}`}>
                          {coin.change >= 0 ? '+' : ''}{coin.change}%
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* 새 게시물 작성 버튼을 트렌딩 섹션 내부로 이동 */}
              <div className="d-grid gap-2 mt-auto pt-4">
                <Button variant="primary" size="lg">
                  <i className="bi bi-plus-circle me-2"></i>{t('posts.create', '새 게시물 작성')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
