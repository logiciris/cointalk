import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Tab, Nav } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CoinPage = () => {
  const { symbol } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartPeriod, setChartPeriod] = useState('7d');

  // 차트 데이터 생성 함수
  const generateChartData = (period) => {
    const basePrice = 58432.21;
    const days = period === '1d' ? 24 : period === '7d' ? 7 : period === '1m' ? 30 : 365;
    const interval = period === '1d' ? 'hour' : 'day';
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      if (period === '1d') {
        date.setHours(date.getHours() - (days - 1 - i));
      } else {
        date.setDate(date.getDate() - (days - 1 - i));
      }
      
      const randomChange = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + randomChange * (i + 1) / days);
      const volume = Math.random() * 2000000000 + 1000000000;
      
      return {
        date: period === '1d' ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('ko-KR'),
        price: Math.round(price * 100) / 100,
        volume: Math.round(volume),
        timestamp: date.getTime()
      };
    });
  };

  useEffect(() => {
    // 실제로는 API에서 코인 정보를 가져오는 로직이 들어갈 예정
    // 테스트용 데이터
    const mockCoin = {
      id: 1,
      name: 'Bitcoin',
      symbol: symbol || 'BTC',
      description: '비트코인은 2009년 사토시 나카모토에 의해 만들어진 최초의 암호화폐로, 분산형 디지털 화폐를 목표로 합니다. 중앙 은행이나 단일 관리자 없이 운영되며, 사용자 간 직접 거래가 가능한 P2P 네트워크입니다.',
      logoUrl: 'https://via.placeholder.com/100',
      website: 'https://bitcoin.org',
      priceData: {
        current: 58432.21,
        change24h: 2.4,
        high24h: 58934.87,
        low24h: 56721.45,
        marketCap: 1120000000000,
        volume24h: 45300000000
      },
      relatedPosts: [
        {
          id: 1,
          title: '비트코인 상승세, 올해 말 새로운 고점 찍을까?',
          author: 'bitcoinenthusiast',
          date: '2025-05-15',
          likes: 42,
          comments: 15
        },
        {
          id: 5,
          title: '비트코인 반감기와 가격 영향 분석',
          author: 'bitcoinenthusiast',
          date: '2025-04-28',
          likes: 38,
          comments: 22
        }
      ],
      followers: 1243,
      chartData: generateChartData('7d')
    };
    
    setCoin(mockCoin);
    setLoading(false);
  }, [symbol]);

  // 차트 기간 변경 시 데이터 업데이트
  const handlePeriodChange = (period) => {
    setChartPeriod(period);
    if (coin) {
      setCoin({
        ...coin,
        chartData: generateChartData(period)
      });
    }
  };

  if (loading) {
    return <Container className="mt-5"><p>로딩 중...</p></Container>;
  }

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={coin.logoUrl}
                  alt={coin.name}
                  className="me-3"
                  width="64"
                  height="64"
                />
                <div>
                  <h2 className="mb-0">{coin.name} ({coin.symbol})</h2>
                  <a href={coin.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <small>{coin.website}</small>
                  </a>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <h3 className="mb-0">${coin.priceData.current.toLocaleString()}</h3>
              <div className="mb-2 ${coin.priceData.change24h >= 0 ? 'text-success' : 'text-danger'}`">
                {coin.priceData.change24h >= 0 ? '+' : ''}{coin.priceData.change24h}%
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-primary">팔로우 ({coin.followers})</Button>
                <Button variant="success" href={`/trade/${coin.symbol}`}>거래하기</Button>
                <Button variant="info" href={`/coin/${coin.symbol}/chat`}>채팅방</Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Card>
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="overview">개요</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="chart">차트</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="market">시장 정보</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="posts">관련 게시물</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <h4>코인 소개</h4>
                <p>{coin.description}</p>
              </Tab.Pane>
              
              <Tab.Pane eventKey="chart">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>가격 차트</h4>
                    <div className="btn-group" role="group">
                      {['1d', '7d', '1m', '1y'].map(period => (
                        <button
                          key={period}
                          type="button"
                          className={`btn btn-sm ${chartPeriod === period ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handlePeriodChange(period)}
                        >
                          {period === '1d' ? '1일' : period === '7d' ? '7일' : period === '1m' ? '1개월' : '1년'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">가격 추이</h5>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={coin.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            domain={['dataMin - 1000', 'dataMax + 1000']}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${value.toLocaleString()}`, '가격']}
                            labelFormatter={(label) => `시간: ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#007bff" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Body>
                      <h5 className="mb-3">거래량</h5>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={coin.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${(value / 1000000).toFixed(2)}M`, '거래량']}
                            labelFormatter={(label) => `시간: ${label}`}
                          />
                          <Bar dataKey="volume" fill="#28a745" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card.Body>
                  </Card>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="market">
                <Row>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h5>시가총액</h5>
                        <h4>${(coin.priceData.marketCap / 1000000000).toFixed(2)}B</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h5>24시간 거래량</h5>
                        <h4>${(coin.priceData.volume24h / 1000000000).toFixed(2)}B</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h5>24시간 최고가</h5>
                        <h4>${coin.priceData.high24h.toLocaleString()}</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Body>
                        <h5>24시간 최저가</h5>
                        <h4>${coin.priceData.low24h.toLocaleString()}</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="posts">
                {coin.relatedPosts.length > 0 ? (
                  coin.relatedPosts.map(post => (
                    <div key={post.id} className="border-bottom mb-3 pb-3">
                      <h5>{post.title}</h5>
                      <div className="d-flex justify-content-between text-muted">
                        <span>작성자: {post.author} • {post.date}</span>
                        <div>
                          <span className="me-3">
                            <i className="bi bi-heart"></i> {post.likes}
                          </span>
                          <span>
                            <i className="bi bi-chat"></i> {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>관련 게시물이 없습니다.</p>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </Container>
  );
};

export default CoinPage;
