import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const CoinActionPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // 상태 관리
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeForm, setTradeForm] = useState({
    type: 'buy',
    orderType: 'market',
    amount: '',
    price: ''
  });
  const [priceAlert, setPriceAlert] = useState({
    targetPrice: '',
    direction: 'above'
  });

  // 모의 코인 데이터
  const mockCoinData = {
    BTC: {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67234.50,
      change24h: 2.34,
      volume24h: 28500000000,
      marketCap: 1320000000000,
      high24h: 68500.00,
      low24h: 65800.00,
      rsi: 58.2,
      support: 65000,
      resistance: 70000
    },
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3456.78,
      change24h: -1.23,
      volume24h: 15200000000,
      marketCap: 415000000000,
      high24h: 3520.00,
      low24h: 3398.00,
      rsi: 45.7,
      support: 3300,
      resistance: 3600
    },
    ADA: {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.4567,
      change24h: 5.67,
      volume24h: 1200000000,
      marketCap: 16000000000,
      high24h: 0.4650,
      low24h: 0.4320,
      rsi: 65.3,
      support: 0.42,
      resistance: 0.48
    }
  };

  useEffect(() => {
    loadCoinData();
    
    // 5초마다 가격 업데이트 (실시간 시뮬레이션)
    const interval = setInterval(() => {
      updatePrice();
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  const loadCoinData = () => {
    setLoading(true);
    
    // 실제로는 API 호출
    setTimeout(() => {
      const data = mockCoinData[symbol?.toUpperCase()];
      if (data) {
        setCoinData(data);
      }
      setLoading(false);
    }, 500);
  };

  const updatePrice = () => {
    if (!coinData) return;
    
    // 가격 변동 시뮬레이션 (±2% 랜덤)
    const variation = (Math.random() - 0.5) * 0.04; // -2% ~ +2%
    const newPrice = coinData.price * (1 + variation);
    
    setCoinData(prev => ({
      ...prev,
      price: newPrice,
      change24h: prev.change24h + (variation * 100)
    }));
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!tradeForm.amount) {
      alert('거래 수량을 입력해주세요.');
      return;
    }

    if (tradeForm.orderType === 'limit' && !tradeForm.price) {
      alert('지정가를 입력해주세요.');
      return;
    }

    const tradingPrice = tradeForm.orderType === 'market' ? coinData.price : parseFloat(tradeForm.price);
    const amount = parseFloat(tradeForm.amount);
    const totalValue = tradingPrice * amount;

    const confirmMessage = `${tradeForm.type === 'buy' ? '매수' : '매도'} 주문을 실행하시겠습니까?\n` +
          `코인: ${symbol}\n` +
          `수량: ${amount}\n` +
          `가격: $${tradingPrice.toFixed(4)}\n` +
          `총 금액: $${totalValue.toLocaleString()}\n` +
          `수수료: $${(totalValue * 0.005).toFixed(2)} (0.5%)`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/portfolio/${tradeForm.type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          symbol: symbol,
          coinName: coinData.name,
          amount: amount,
          price: tradingPrice
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`${tradeForm.type === 'buy' ? '매수' : '매도'} 주문이 성공적으로 처리되었습니다!\n` +
              `총 ${tradeForm.type === 'buy' ? '지불' : '수령'} 금액: $${result.data[tradeForm.type === 'buy' ? 'totalWithFee' : 'netRevenue'].toLocaleString()}`);
        
        // 폼 초기화
        setTradeForm(prev => ({ ...prev, amount: '', price: '' }));
      } else {
        alert(`거래 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('Trade error:', error);
      alert('거래 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAlertSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!priceAlert.targetPrice) {
      alert('알림 가격을 입력해주세요.');
      return;
    }

    alert(`가격 알림이 설정되었습니다.\n` +
          `${symbol} 가격이 $${priceAlert.targetPrice} ${priceAlert.direction === 'above' ? '이상' : '이하'}일 때 알림`);
    
    setPriceAlert({ targetPrice: '', direction: 'above' });
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num?.toFixed(2);
  };

  const formatPrice = (price) => {
    if (price >= 1) return price?.toFixed(2);
    return price?.toFixed(4);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        {/* 스켈레톤 헤더 */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="placeholder-glow">
              <span className="placeholder col-4" style={{ height: '2rem' }}></span>
            </div>
            <div className="placeholder-glow mt-2">
              <span className="placeholder col-3" style={{ height: '1.5rem' }}></span>
              <span className="placeholder col-2 ms-2" style={{ height: '1.5rem' }}></span>
            </div>
          </div>
          <div className="placeholder-glow">
            <span className="placeholder col-12" style={{ width: '120px', height: '38px' }}></span>
          </div>
        </div>

        {/* 스켈레톤 카드들 */}
        <Row>
          {[1, 2, 3, 4].map(index => (
            <Col md={6} key={index} className="mb-4">
              <Card>
                <Card.Header>
                  <div className="placeholder-glow">
                    <span className="placeholder col-4"></span>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                  </div>
                  <div className="mt-3 placeholder-glow">
                    <span className="placeholder col-12" style={{ height: '120px' }}></span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 중앙 로딩 인디케이터 */}
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="text-center p-4 bg-white rounded shadow">
            <div className="d-flex justify-content-center mb-3">
              <div className="spinner-grow text-primary me-1" role="status" style={{ width: '1rem', height: '1rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-primary me-1" role="status" style={{ width: '1rem', height: '1rem', animationDelay: '0.1s' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow text-primary" role="status" style={{ width: '1rem', height: '1rem', animationDelay: '0.2s' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <small className="text-muted fw-medium">데이터 로딩 중</small>
          </div>
        </div>
      </Container>
    );
  }

  if (!coinData) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          지원하지 않는 코인입니다. ({symbol})
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/coins')}>
          코인 목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>{coinData.name} ({coinData.symbol})</h1>
          <div className="d-flex align-items-center">
            <h2 className="mb-0 me-3">${formatPrice(coinData.price)}</h2>
            <Badge bg={coinData.change24h >= 0 ? 'success' : 'danger'}>
              {coinData.change24h >= 0 ? '+' : ''}{coinData.change24h?.toFixed(2)}%
            </Badge>
          </div>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/coins')}>
          코인 목록으로
        </Button>
      </div>

      <Row>
        {/* 실시간 거래 정보 */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">📊 실시간 거래 정보</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="mb-3">
                    <small className="text-muted">24시간 최고가</small>
                    <div className="fw-bold">${formatPrice(coinData.high24h)}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">24시간 최저가</small>
                    <div className="fw-bold">${formatPrice(coinData.low24h)}</div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="mb-3">
                    <small className="text-muted">24시간 거래량</small>
                    <div className="fw-bold">${formatNumber(coinData.volume24h)}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">시가총액</small>
                    <div className="fw-bold">${formatNumber(coinData.marketCap)}</div>
                  </div>
                </Col>
              </Row>
              
              {/* 간단한 차트 영역 */}
              <div className="mt-3 p-3 bg-light rounded">
                <div className="text-center text-muted">
                  <i className="bi bi-graph-up fs-1"></i>
                  <div>실시간 차트 (개발 예정)</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 거래 액션 */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">💰 빠른 거래</h5>
            </Card.Header>
            <Card.Body>
              {!isAuthenticated && (
                <Alert variant="warning" className="mb-3">
                  거래하려면 로그인이 필요합니다.
                </Alert>
              )}
              
              <Form onSubmit={handleTradeSubmit}>
                <Row className="mb-3">
                  <Col xs={6}>
                    <Form.Check
                      type="radio"
                      name="tradeType"
                      label="매수"
                      value="buy"
                      checked={tradeForm.type === 'buy'}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, type: e.target.value }))}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Check
                      type="radio"
                      name="tradeType"
                      label="매도"
                      value="sell"
                      checked={tradeForm.type === 'sell'}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, type: e.target.value }))}
                    />
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>주문 타입</Form.Label>
                  <Form.Select 
                    value={tradeForm.orderType}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, orderType: e.target.value }))}
                  >
                    <option value="market">시장가</option>
                    <option value="limit">지정가</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>수량 ({coinData.symbol})</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    value={tradeForm.amount}
                    onChange={(e) => setTradeForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </Form.Group>

                {tradeForm.orderType === 'limit' && (
                  <Form.Group className="mb-3">
                    <Form.Label>지정가 (USD)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder={formatPrice(coinData.price)}
                      value={tradeForm.price}
                      onChange={(e) => setTradeForm(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </Form.Group>
                )}

                {tradeForm.amount && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <small className="text-muted">예상 거래 금액:</small>
                    <div className="fw-bold">
                      ${(tradeForm.orderType === 'market' 
                        ? coinData.price * parseFloat(tradeForm.amount || 0)
                        : parseFloat(tradeForm.price || 0) * parseFloat(tradeForm.amount || 0)
                      ).toLocaleString()}
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant={tradeForm.type === 'buy' ? 'success' : 'danger'} 
                  className="w-100"
                  disabled={!isAuthenticated}
                >
                  {tradeForm.type === 'buy' ? '매수' : '매도'} 주문
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* 분석 도구 */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">📈 간단 분석</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>RSI (14)</span>
                  <span className="fw-bold">{coinData.rsi}</span>
                </div>
                <div className="progress">
                  <div 
                    className={`progress-bar ${
                      coinData.rsi > 70 ? 'bg-danger' : 
                      coinData.rsi < 30 ? 'bg-success' : 'bg-warning'
                    }`}
                    style={{ width: `${coinData.rsi}%` }}
                  ></div>
                </div>
                <small className="text-muted">
                  {coinData.rsi > 70 ? '과매수' : coinData.rsi < 30 ? '과매도' : '중립'}
                </small>
              </div>

              <Row>
                <Col xs={6}>
                  <div className="text-center p-2 border rounded">
                    <small className="text-muted d-block">지지선</small>
                    <span className="fw-bold text-success">${formatPrice(coinData.support)}</span>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-2 border rounded">
                    <small className="text-muted d-block">저항선</small>
                    <span className="fw-bold text-danger">${formatPrice(coinData.resistance)}</span>
                  </div>
                </Col>
              </Row>

              <div className="mt-3">
                <small className="text-muted">간단 분석:</small>
                <div className="mt-1">
                  {coinData.price < coinData.support && <Badge bg="danger" className="me-1">지지선 이탈</Badge>}
                  {coinData.price > coinData.resistance && <Badge bg="success" className="me-1">저항선 돌파</Badge>}
                  {coinData.rsi > 70 && <Badge bg="warning" className="me-1">과매수</Badge>}
                  {coinData.rsi < 30 && <Badge bg="info" className="me-1">과매도</Badge>}
                  {coinData.change24h > 5 && <Badge bg="success" className="me-1">강세</Badge>}
                  {coinData.change24h < -5 && <Badge bg="danger" className="me-1">약세</Badge>}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* 가격 알림 */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">🔔 가격 알림</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAlertSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>알림 조건</Form.Label>
                  <Form.Select 
                    value={priceAlert.direction}
                    onChange={(e) => setPriceAlert(prev => ({ ...prev, direction: e.target.value }))}
                  >
                    <option value="above">가격이 다음 이상일 때</option>
                    <option value="below">가격이 다음 이하일 때</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>목표 가격 (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder={formatPrice(coinData.price)}
                    value={priceAlert.targetPrice}
                    onChange={(e) => setPriceAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                  />
                  <Form.Text className="text-muted">
                    현재가: ${formatPrice(coinData.price)}
                  </Form.Text>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="outline-primary" 
                  className="w-100"
                  disabled={!isAuthenticated}
                >
                  알림 설정
                </Button>
              </Form>

              {!isAuthenticated && (
                <div className="text-center mt-2">
                  <small className="text-muted">로그인 후 알림 설정 가능</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CoinActionPage;