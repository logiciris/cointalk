import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Nav, Tab, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import searchService from '../services/searchService';

const ExplorePage = () => {
  const { t } = useTranslation();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedCoin, setSelectedCoin] = useState('all');

  // 인기 코인 목록
  const popularCoins = [
    { symbol: 'ALL', name: '전체', icon: '🌐' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'ADA', name: 'Cardano', icon: '₳' },
    { symbol: 'SOL', name: 'Solana', icon: '◎' },
    { symbol: 'XRP', name: 'Ripple', icon: '✕' }
  ];

  // 모의 데이터 - 실제로는 API에서 가져옴
  const mockTrendingPosts = [
    {
      id: 1,
      title: '비트코인 새로운 고점 돌파 가능성',
      author: 'cryptoanalyst',
      authorInitials: 'CA',
      createdAt: '2025-05-28',
      likes: 156,
      comments: 23,
      views: 892,
      tags: ['분석', '비트코인', '예측']
    },
    {
      id: 2,
      title: '이더리움 스테이킹 수익률 분석',
      author: 'ethtrader',
      authorInitials: 'ET',
      createdAt: '2025-05-27',
      likes: 134,
      comments: 18,
      views: 756,
      tags: ['이더리움', 'PoS', '수익률']
    },
    {
      id: 3,
      title: 'DeFi 프로토콜 최신 동향 정리',
      author: 'defimaster',
      authorInitials: 'DM',
      createdAt: '2025-05-27',
      likes: 98,
      comments: 15,
      views: 623,
      tags: ['DeFi', '프로토콜', '동향']
    }
  ];

  const mockTrendingHashtags = [
    { tag: '비트코인', count: 234 },
    { tag: '이더리움', count: 189 },
    { tag: '알트코인', count: 156 },
    { tag: 'DeFi', count: 134 },
    { tag: '스테이킹', count: 98 },
    { tag: '분석', count: 87 }
  ];

  const mockActiveUsers = [
    { username: 'cryptoking', initials: 'CK', posts: 12, followers: 1234 },
    { username: 'blockchainboss', initials: 'BB', posts: 8, followers: 987 },
    { username: 'coinmaster', initials: 'CM', posts: 6, followers: 756 }
  ];

  // 컴포넌트 마운트 시 트렌딩 데이터 로드
  useEffect(() => {
    loadTrendingData();
    loadTrendingTags();
    loadActiveUsers();
  }, []);

  const loadTrendingData = () => {
    setTrendingPosts(mockTrendingPosts);
  };

  const loadTrendingTags = async () => {
    try {
      const result = await searchService.getTrendingTags(6);
      
      if (result.success) {
        setTrendingHashtags(result.data.tags || []);
      } else {
        console.error('인기 태그 로드 실패:', result.message);
        // 실패 시 모의 데이터 사용
        setTrendingHashtags(mockTrendingHashtags);
      }
    } catch (error) {
      console.error('인기 태그 로드 오류:', error);
      setTrendingHashtags(mockTrendingHashtags);
    }
  };

  const loadActiveUsers = async () => {
    try {
      const result = await searchService.getActiveUsers(3, 7);
      
      if (result.success) {
        setActiveUsers(result.data.users || []);
      } else {
        console.error('활발한 사용자 로드 실패:', result.message);
        // 실패 시 모의 데이터 사용
        setActiveUsers(mockActiveUsers);
      }
    } catch (error) {
      console.error('활발한 사용자 로드 오류:', error);
      setActiveUsers(mockActiveUsers);
    }
  };

  // 검색 기능
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    setLoading(true);
    try {
      console.log('검색 시작:', searchKeyword);
      
      // 실제 API 호출
      const result = await searchService.searchAll(searchKeyword, 1, 10);
      
      console.log('검색 결과:', result);
      
      if (result.success) {
        setSearchResults(result.data.posts || []);
        setActiveTab('search');
      } else {
        console.error('검색 실패:', result.message);
        setSearchResults([]);
        // 에러 상황에서도 검색 탭으로 이동하여 "결과 없음" 표시
        setActiveTab('search');
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
      setActiveTab('search');
    } finally {
      setLoading(false);
    }
  };

  // 정렬 변경 핸들러
  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    
    // 현재 검색어가 있다면 새로운 정렬로 재검색
    if (searchKeyword.trim()) {
      setLoading(true);
      try {
        const result = await searchService.searchAll(searchKeyword, 1, 10);
        
        if (result.success) {
          let sortedResults = [...result.data.posts];
          
          // 클라이언트 사이드에서 정렬 (백엔드에서 정렬을 지원하지 않으므로)
          switch (newSort) {
            case 'popular':
              sortedResults.sort((a, b) => (b.likes || 0) - (a.likes || 0));
              break;
            case 'relevant':
              // 관련도는 현재 구현하지 않음 (검색 엔진 필요)
              break;
            case 'latest':
            default:
              sortedResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              break;
          }
          
          setSearchResults(sortedResults);
        }
      } catch (error) {
        console.error('정렬 변경 중 오류:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 코인 필터 변경 핸들러
  const handleCoinFilter = (coin) => {
    setSelectedCoin(coin);
    // 실제로는 필터링 적용
  };

  return (
    <Container fluid className="explore-page">
      <Row>
        <Col md={12}>
          {/* 헤더 */}
          <div className="explore-header mb-4">
            <h1 className="page-title">{t('explore.title', '탐색')}</h1>
            <p className="text-muted">새로운 콘텐츠와 트렌드를 발견해보세요</p>
          </div>

          {/* 검색 바 */}
          <Card className="search-card mb-4">
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="align-items-center">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="게시물, 해시태그 검색..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      size="lg"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                      <option value="latest">최신순</option>
                      <option value="popular">인기순</option>
                      <option value="relevant">관련도순</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Select value={selectedCoin} onChange={(e) => handleCoinFilter(e.target.value)}>
                      {popularCoins.map(coin => (
                        <option key={coin.symbol} value={coin.symbol.toLowerCase()}>
                          {coin.icon} {coin.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={1}>
                    <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                      {loading ? <div className="spinner-border spinner-border-sm" /> : <i className="bi bi-search"></i>}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* 탭 네비게이션 */}
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Card>
              <Card.Header>
                <Nav variant="tabs" className="border-0">
                  <Nav.Item>
                    <Nav.Link eventKey="trending">
                      <i className="bi bi-fire me-2"></i>트렌딩
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="search">
                      <i className="bi bi-search me-2"></i>검색 결과
                      {searchResults.length > 0 && (
                        <Badge bg="primary" className="ms-2">{searchResults.length}</Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="hashtags">
                      <i className="bi bi-hash me-2"></i>인기 태그
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="users">
                      <i className="bi bi-people me-2"></i>활발한 사용자
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  {/* 트렌딩 탭 */}
                  <Tab.Pane eventKey="trending">
                    <div className="trending-section">
                      <div className="section-header mb-3">
                        <h5>🔥 인기 급상승 게시물</h5>
                        <small className="text-muted">최근 24시간 기준</small>
                      </div>
                      
                      <Row>
                        {trendingPosts.map(post => (
                          <Col md={12} key={post.id} className="mb-3">
                            <Card className="post-card h-100">
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <Link to={`/posts/${post.id}`} className="text-decoration-none">
                                      <h6 className="card-title">{post.title}</h6>
                                    </Link>
                                    
                                    <div className="d-flex align-items-center mb-2">
                                      <div className="author-avatar me-2">
                                        {post.authorInitials}
                                      </div>
                                      <span className="text-muted small">{post.author}</span>
                                      <span className="text-muted small ms-2">• {post.createdAt}</span>
                                    </div>

                                    <div className="post-tags mb-2">
                                      {post.tags.map(tag => (
                                        <Badge key={tag} bg="light" text="dark" className="me-1">
                                          #{tag}
                                        </Badge>
                                      ))}
                                    </div>

                                    <div className="post-stats">
                                      <span className="me-3">
                                        <i className="bi bi-heart text-danger"></i> {post.likes}
                                      </span>
                                      <span className="me-3">
                                        <i className="bi bi-chat"></i> {post.comments}
                                      </span>
                                      <span>
                                        <i className="bi bi-eye"></i> {post.views}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Tab.Pane>

                  {/* 검색 결과 탭 */}
                  <Tab.Pane eventKey="search">
                    {searchResults.length > 0 ? (
                      <div className="search-results">
                        <div className="section-header mb-3">
                          <h5>검색 결과: "{searchKeyword}"</h5>
                          <small className="text-muted">{searchResults.length}개 결과</small>
                        </div>
                        
                        <Row>
                          {searchResults.map(post => (
                            <Col md={12} key={post.id} className="mb-3">
                              <Card className="post-card">
                                <Card.Body>
                                  <Link to={`/posts/${post.id}`} className="text-decoration-none">
                                    <h6 className="card-title">{post.title}</h6>
                                  </Link>
                                  
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="author-avatar me-2">
                                      {post.username ? post.username.substring(0, 1).toUpperCase() : 'U'}
                                    </div>
                                    <span className="text-muted small">{post.username || 'Unknown'}</span>
                                    <span className="text-muted small ms-2">• {new Date(post.created_at).toLocaleDateString()}</span>
                                  </div>

                                  {post.content && (
                                    <p className="text-muted small mb-2">
                                      {post.content.length > 100 
                                        ? post.content.substring(0, 100) + '...'
                                        : post.content
                                      }
                                    </p>
                                  )}

                                  <div className="post-stats">
                                    <span className="me-3">
                                      <i className="bi bi-heart text-danger"></i> {post.likes || 0}
                                    </span>
                                    <span className="me-3">
                                      <i className="bi bi-chat"></i> {post.comment_count || 0}
                                    </span>
                                    <span>
                                      <i className="bi bi-eye"></i> {post.views || 0}
                                    </span>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    ) : (
                      <Alert variant="info">
                        <i className="bi bi-search me-2"></i>
                        {searchKeyword ? `"${searchKeyword}"에 대한 검색 결과가 없습니다.` : '검색어를 입력하여 게시물을 찾아보세요.'}
                      </Alert>
                    )}
                  </Tab.Pane>

                  {/* 인기 태그 탭 */}
                  <Tab.Pane eventKey="hashtags">
                    <div className="hashtags-section">
                      <div className="section-header mb-3">
                        <h5># 인기 해시태그</h5>
                        <small className="text-muted">최근 7일 기준</small>
                      </div>
                      
                      <Row>
                        {trendingHashtags.map((hashtag, index) => (
                          <Col md={4} key={hashtag.tag || hashtag.tag} className="mb-3">
                            <Card className="hashtag-card text-center">
                              <Card.Body>
                                <div className="hashtag-rank mb-2">
                                  <Badge bg="primary">#{hashtag.rank || index + 1}</Badge>
                                </div>
                                <h6 className="hashtag-name">#{hashtag.tag}</h6>
                                <p className="text-muted mb-0">
                                  {hashtag.post_count || hashtag.count}개 게시물
                                </p>
                                {hashtag.latest_post && (
                                  <small className="text-muted d-block mt-1">
                                    최근: {new Date(hashtag.latest_post).toLocaleDateString()}
                                  </small>
                                )}
                                <Button variant="outline-primary" size="sm" className="mt-2">
                                  탐색하기
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Tab.Pane>

                  {/* 활발한 사용자 탭 */}
                  <Tab.Pane eventKey="users">
                    <div className="users-section">
                      <div className="section-header mb-3">
                        <h5>👥 활발한 사용자</h5>
                        <small className="text-muted">최근 7일 활동 기준</small>
                      </div>
                      
                      <Row>
                        {activeUsers.map(user => (
                          <Col md={4} key={user.username || user.id} className="mb-3">
                            <Card className="user-card text-center">
                              <Card.Body>
                                <div className="user-avatar mb-3">
                                  {user.username ? user.username.substring(0, 1).toUpperCase() : (user.initials || 'U')}
                                </div>
                                <h6 className="username">{user.username}</h6>
                                <div className="user-stats">
                                  <div className="stat">
                                    <strong>{user.stats ? user.stats.posts : (user.posts || 0)}</strong>
                                    <small className="d-block text-muted">게시물</small>
                                  </div>
                                  <div className="stat">
                                    <strong>{user.stats ? user.stats.activity_score : (user.followers || 0)}</strong>
                                    <small className="d-block text-muted">활동점수</small>
                                  </div>
                                </div>
                                {user.stats && (
                                  <div className="additional-stats mt-2">
                                    <small className="text-muted">
                                      댓글 {user.stats.comments} • 좋아요 {user.stats.likes_received}
                                    </small>
                                  </div>
                                )}
                                <Button variant="outline-primary" size="sm" className="mt-2">
                                  프로필 보기
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default ExplorePage;