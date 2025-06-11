import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PortfolioPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addCoinForm, setAddCoinForm] = useState({
    symbol: '',
    amount: '',
    avgPrice: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    
    loadPortfolio();
    
    // 30초마다 포트폴리오 업데이트
    const interval = setInterval(() => {
      updatePrices();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadPortfolio = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setPortfolio(result.data.portfolio);
      } else {
        console.error('포트폴리오 로드 실패:', result.message);
        // 실패 시 빈 포트폴리오로 설정
        setPortfolio({
          totalValue: 0,
          totalInvested: 0,
          totalProfit: 0,
          totalProfitPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          holdings: []
        });
      }
    } catch (error) {
      console.error('포트폴리오 로드 오류:', error);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  const updatePrices = () => {
    // 실제 API에서 가격을 가져오므로 포트폴리오 전체를 다시 로드
    loadPortfolio();
  };

  const handleAddCoin = async (e) => {
    e.preventDefault();
    
    if (!addCoinForm.symbol || !addCoinForm.amount || !addCoinForm.avgPrice) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/portfolio/add-coin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          symbol: addCoinForm.symbol,
          coinName: getCoinName(addCoinForm.symbol),
          amount: addCoinForm.amount,
          avgPrice: addCoinForm.avgPrice
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${addCoinForm.symbol} ${addCoinForm.amount}개가 포트폴리오에 추가되었습니다.`);
        
        // 폼 초기화 및 포트폴리오 새로고침
        setAddCoinForm({ symbol: '', amount: '', avgPrice: '' });
        setShowAddForm(false);
        loadPortfolio();
      } else {
        alert(`코인 추가 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('코인 추가 오류:', error);
      alert('코인 추가 중 오류가 발생했습니다.');
    }
  };

  // 코인명 매핑 함수
  const getCoinName = (symbol) => {
    const coinNames = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum', 
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'XRP': 'Ripple',
      'DOT': 'Polkadot',
      'MATIC': 'Polygon',
      'LINK': 'Chainlink'
    };
    return coinNames[symbol.toUpperCase()] || symbol.toUpperCase();
  };

  const formatNumber = (num, decimals = 2) => {
    return num?.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (num) => {
    return `$${formatNumber(num)}`;
  };

  if (!isAuthenticated) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          포트폴리오를 보려면 로그인이 필요합니다.
          <br />
          <Button variant="link" onClick={() => navigate('/login')}>
            로그인하기
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
          <div className="mt-2">포트폴리오를 불러오는 중...</div>
        </div>
      </Container>
    );
  }

  if (!portfolio) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          아직 포트폴리오가 없습니다. 첫 번째 코인을 추가해보세요!
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>💼 내 포트폴리오</h1>
        <Button 
          variant="primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '취소' : '코인 추가'}
        </Button>
      </div>

      {/* 포트폴리오 요약 */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted mb-1">총 자산 가치</h6>
              <h3 className="mb-0">{formatCurrency(portfolio.totalValue)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted mb-1">총 수익</h6>
              <h4 className={`mb-0 ${portfolio.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(portfolio.totalProfit)}
              </h4>
              <small className={portfolio.totalProfitPercent >= 0 ? 'text-success' : 'text-danger'}>
                ({portfolio.totalProfitPercent >= 0 ? '+' : ''}{formatNumber(portfolio.totalProfitPercent)}%)
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted mb-1">24시간 변화</h6>
              <h4 className={`mb-0 ${portfolio.dayChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(portfolio.dayChange)}
              </h4>
              <small className={portfolio.dayChangePercent >= 0 ? 'text-success' : 'text-danger'}>
                ({portfolio.dayChangePercent >= 0 ? '+' : ''}{formatNumber(portfolio.dayChangePercent)}%)
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted mb-1">투자 원금</h6>
              <h4 className="mb-0">{formatCurrency(portfolio.totalInvested)}</h4>
              <small className="text-muted">수익률: {formatNumber(portfolio.totalProfitPercent)}%</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 코인 추가 폼 */}
      {showAddForm && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">코인 추가</h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleAddCoin}>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>코인 심볼</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="BTC, ETH, ADA..."
                      value={addCoinForm.symbol}
                      onChange={(e) => setAddCoinForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>보유량</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.0001"
                      placeholder="0.0000"
                      value={addCoinForm.amount}
                      onChange={(e) => setAddCoinForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>평균 매입가 ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={addCoinForm.avgPrice}
                      onChange={(e) => setAddCoinForm(prev => ({ ...prev, avgPrice: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>&nbsp;</Form.Label>
                    <div>
                      <Button type="submit" variant="success" className="w-100">
                        추가
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* 보유 코인 목록 */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">보유 코인</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>코인</th>
                <th className="text-end">보유량</th>
                <th className="text-end">평균가</th>
                <th className="text-end">현재가</th>
                <th className="text-end">가치</th>
                <th className="text-end">수익/손실</th>
                <th className="text-end">비중</th>
                <th className="text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((holding) => (
                <tr key={holding.symbol}>
                  <td>
                    <div className="fw-bold">{holding.name}</div>
                    <small className="text-muted">{holding.symbol}</small>
                  </td>
                  <td className="text-end">
                    {formatNumber(holding.amount, 4)}
                  </td>
                  <td className="text-end">
                    {formatCurrency(holding.avgPrice)}
                  </td>
                  <td className="text-end">
                    {formatCurrency(holding.currentPrice)}
                  </td>
                  <td className="text-end fw-bold">
                    {formatCurrency(holding.value)}
                  </td>
                  <td className={`text-end fw-bold ${holding.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(holding.profit)}
                    <br />
                    <small>
                      ({holding.profitPercent >= 0 ? '+' : ''}{formatNumber(holding.profitPercent)}%)
                    </small>
                  </td>
                  <td className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <div className="me-2" style={{ width: '60px' }}>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${holding.allocation}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="small">{formatNumber(holding.allocation)}%</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate(`/coin/${holding.symbol}/action`)}
                      >
                        상세
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => navigate(`/trade/${holding.symbol}`)}
                      >
                        거래
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* 간단한 분석 */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">📊 포트폴리오 분석</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>다양성</span>
                  <Badge bg="success">좋음</Badge>
                </div>
                <small className="text-muted">
                  {portfolio.holdings.length}개 코인으로 분산 투자 중
                </small>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>리스크</span>
                  <Badge bg="warning">중간</Badge>
                </div>
                <small className="text-muted">
                  비트코인 비중이 높아 변동성 있음
                </small>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span>전체 수익률</span>
                  <Badge bg={portfolio.totalProfitPercent >= 0 ? 'success' : 'danger'}>
                    {portfolio.totalProfitPercent >= 0 ? '+' : ''}{formatNumber(portfolio.totalProfitPercent)}%
                  </Badge>
                </div>
                <small className="text-muted">
                  평균 대비 우수한 성과
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">🎯 빠른 액션</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/coins')}>
                  코인 목록 보기
                </Button>
                <Button variant="outline-success" onClick={() => navigate('/trade/BTC')}>
                  빠른 거래 (BTC)
                </Button>
                <Button variant="outline-info" onClick={() => setShowAddForm(true)}>
                  코인 추가하기
                </Button>
                <Button variant="outline-secondary" disabled>
                  리밸런싱 (개발 예정)
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PortfolioPage;