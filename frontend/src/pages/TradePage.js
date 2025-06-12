import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav, Table } from 'react-bootstrap';

const TradePage = () => {
  const { symbol } = useParams();
  const [coin, setCoin] = useState(null);
  const [realTimePrice, setRealTimePrice] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1320);
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState(null);
  const [wallet, setWallet] = useState({ balance: 10000, coins: {} });
  const [portfolioData, setPortfolioData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // 코인 기본 정보 (로고, 이름)
  const coinInfo = {
    BTC: { name: 'Bitcoin', logo: '₿' },
    ETH: { name: 'Ethereum', logo: 'Ξ' },
    BNB: { name: 'Binance Coin', logo: 'BNB' },
    ADA: { name: 'Cardano', logo: 'ADA' },
    SOL: { name: 'Solana', logo: 'SOL' },
    DOGE: { name: 'Dogecoin', logo: '🐕' }
  };

  useEffect(() => {
    if (coinInfo[symbol]) {
      setCoin(coinInfo[symbol]);
      loadRealTimePrice();
    }
    
    // 백엔드에서 지갑 정보 로드
    loadWalletInfo();
    loadTransactions();
    
    // 30초마다 실시간 가격 업데이트
    const priceInterval = setInterval(() => {
      loadRealTimePrice();
    }, 30000);
    
    return () => clearInterval(priceInterval);
  }, [symbol]);

  const loadRealTimePrice = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/prices/realtime/${symbol}`);
      const result = await response.json();
      
      if (result.success) {
        setRealTimePrice(result.data.price);
        setExchangeRate(result.data.exchangeRate);
      }
    } catch (error) {
      console.error('실시간 가격 로드 오류:', error);
    }
  };

  const loadWalletInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/portfolio', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        const portfolio = result.data.portfolio;
        const balance = result.data.wallet.balance;
        
        // 포트폴리오 데이터 저장
        setPortfolioData(portfolio);
        
        // 보유 코인을 객체로 변환
        const coins = {};
        portfolio.holdings.forEach(holding => {
          coins[holding.symbol] = holding.amount;
        });

        setWallet({ balance, coins });
      }
    } catch (error) {
      console.error('지갑 정보 로드 오류:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/portfolio/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        // 백엔드 형식을 프론트엔드 형식으로 변환
        const formattedTransactions = result.data.transactions.map(tx => ({
          id: tx.created_at,
          type: tx.transaction_type,
          symbol: tx.symbol,
          quantity: tx.amount,
          price: tx.price,
          total: tx.total_value,
          date: tx.created_at
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('거래 내역 로드 오류:', error);
    }
  };

  const calculateTotal = () => {
    if (!quantity || !realTimePrice) return '0.00';
    return (parseFloat(quantity) * realTimePrice).toFixed(2);
  };

  const getPortfolioValue = () => {
    let total = wallet.balance;
    for (const [coinSymbol, amount] of Object.entries(wallet.coins)) {
      if (realTimePrice && coinSymbol === symbol) {
        total += amount * realTimePrice;
      }
    }
    return total;
  };

  const handleTrade = async () => {
    const qty = parseFloat(quantity);
    const total = parseFloat(calculateTotal());

    if (!qty || qty <= 0) {
      setAlert({ type: 'danger', message: '올바른 수량을 입력하세요.' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAlert({ type: 'danger', message: '로그인이 필요합니다.' });
        return;
      }

      if (tradeType === 'buy') {
        // 백엔드 API로 매수 요청
        const response = await fetch('http://localhost:5000/api/portfolio/buy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            symbol: symbol,
            coinName: coin.name,
            amount: qty,
            price: realTimePrice
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setAlert({ type: 'success', message: `${qty} ${symbol} 매수 완료!` });
          // 포트폴리오 페이지 새로고침을 위해 이벤트 발생
          window.dispatchEvent(new Event('portfolio-updated'));
        } else {
          setAlert({ type: 'danger', message: result.message || '매수 실패' });
        }
      } else {
        // 백엔드 API로 매도 요청
        const response = await fetch('http://localhost:5000/api/portfolio/sell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            symbol: symbol,
            amount: qty,
            price: realTimePrice
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setAlert({ type: 'success', message: `${qty} ${symbol} 매도 완료!` });
          // 포트폴리오 페이지 새로고침을 위해 이벤트 발생
          window.dispatchEvent(new Event('portfolio-updated'));
        } else {
          setAlert({ type: 'danger', message: result.message || '매도 실패' });
        }
      }

      // Reset form
      setQuantity('');
      setAmount('');
      
      // 지갑 정보 새로고침
      loadWalletInfo();
      
    } catch (error) {
      console.error('거래 오류:', error);
      setAlert({ type: 'danger', message: '거래 중 오류가 발생했습니다.' });
    }
  };

  if (!coin || !realTimePrice) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
          <div className="mt-2">실시간 가격을 불러오는 중...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{coin.name} 거래</h2>
        <Button variant="outline-secondary" href="/portfolio">
          포트폴리오로 돌아가기
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex align-items-center">
                <span className="me-3" style={{ fontSize: '24px' }}>{coin.logo}</span>
                <div>
                  <h5 className="mb-0">{coin.name}</h5>
                  <div className="d-flex align-items-center">
                    <span className="h4 mb-0 me-3">${realTimePrice.toLocaleString()}</span>
                    <span className="badge bg-success">실시간</span>
                  </div>
                  <small className="text-muted">₩{(realTimePrice * exchangeRate).toLocaleString()}</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Tab.Container defaultActiveKey="trade">
                <Nav variant="pills" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="trade">거래</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="history">거래 내역</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="trade">
                    <Form>
                      <div className="mb-3">
                        <div className="btn-group w-100" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name="tradeType"
                            id="buy"
                            checked={tradeType === 'buy'}
                            onChange={() => setTradeType('buy')}
                          />
                          <label className="btn btn-outline-success" htmlFor="buy">
                            매수
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name="tradeType"
                            id="sell"
                            checked={tradeType === 'sell'}
                            onChange={() => setTradeType('sell')}
                          />
                          <label className="btn btn-outline-danger" htmlFor="sell">
                            매도
                          </label>
                        </div>
                      </div>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>수량</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.00000001"
                              placeholder="0.00000000"
                              value={quantity}
                              onChange={(e) => {
                                const newQuantity = e.target.value;
                                setQuantity(newQuantity);
                                if (newQuantity && realTimePrice) {
                                  const total = (parseFloat(newQuantity) * realTimePrice).toFixed(2);
                                  setAmount(total);
                                } else {
                                  setAmount('');
                                }
                              }}
                            />
                            <Form.Text className="text-muted">
                              {tradeType === 'sell' && (
                                `보유: ${(wallet.coins[symbol] || 0).toFixed(8)} ${symbol}`
                              )}
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>총 금액 (USD)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => {
                                const newAmount = e.target.value;
                                setAmount(newAmount);
                                if (newAmount && realTimePrice) {
                                  const qty = (parseFloat(newAmount) / realTimePrice).toFixed(8);
                                  setQuantity(qty);
                                } else {
                                  setQuantity('');
                                }
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between mb-2">
                          <span>실시간 가격:</span>
                          <span>${realTimePrice.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>수량:</span>
                          <span>{quantity || '0'} {symbol}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold">
                          <span>총액:</span>
                          <span>${calculateTotal()}</span>
                        </div>
                      </div>

                      <Button
                        variant={tradeType === 'buy' ? 'success' : 'danger'}
                        size="lg"
                        className="w-100"
                        onClick={handleTrade}
                        disabled={!amount || !quantity}
                      >
                        {tradeType === 'buy' ? '매수' : '매도'} 주문
                      </Button>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="history">
                    {transactions.length > 0 ? (
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>날짜</th>
                            <th>타입</th>
                            <th>수량</th>
                            <th>가격</th>
                            <th>총액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.slice(0, 10).map(tx => (
                            <tr key={tx.id}>
                              <td>{new Date(tx.date).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${tx.type === 'buy' ? 'bg-success' : 'bg-danger'}`}>
                                  {tx.type === 'buy' ? '매수' : '매도'}
                                </span>
                              </td>
                              <td>{tx.quantity.toFixed(8)} {tx.symbol}</td>
                              <td>${tx.price.toLocaleString()}</td>
                              <td>${tx.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center text-muted py-4">
                        아직 거래 내역이 없습니다.
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>지갑 정보</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>USD 잔고:</span>
                  <span className="fw-bold">${wallet.balance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>{symbol} 보유:</span>
                  <span className="fw-bold">{(wallet.coins[symbol] || 0).toFixed(8)}</span>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>총 포트폴리오 가치:</span>
                  <span className="fw-bold text-primary">
                    ${portfolioData ? portfolioData.totalValue.toFixed(2) : getPortfolioValue().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-between text-success">
                <span>수익/손실:</span>
                <span className="fw-bold">
                  {portfolioData ? (
                    <>
                      ${portfolioData.totalProfit.toFixed(2)} 
                      ({portfolioData.totalProfitPercent.toFixed(2)}%)
                    </>
                  ) : (
                    <>
                      ${(getPortfolioValue() - 10000).toFixed(2)} 
                      ({(((getPortfolioValue() - 10000) / 10000) * 100).toFixed(2)}%)
                    </>
                  )}
                </span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>빠른 거래</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-success" 
                  onClick={() => {
                    const quickAmount = wallet.balance * 0.25;
                    setAmount(quickAmount.toFixed(2));
                    setQuantity((quickAmount / realTimePrice).toFixed(8));
                    setTradeType('buy');
                  }}
                >
                  25% 매수
                </Button>
                <Button 
                  variant="outline-success"
                  onClick={() => {
                    const quickAmount = wallet.balance * 0.5;
                    setAmount(quickAmount.toFixed(2));
                    setQuantity((quickAmount / realTimePrice).toFixed(8));
                    setTradeType('buy');
                  }}
                >
                  50% 매수
                </Button>
                <Button 
                  variant="outline-danger"
                  onClick={() => {
                    const holdings = wallet.coins[symbol] || 0;
                    const sellQty = holdings * 0.5;
                    setQuantity(sellQty.toFixed(8));
                    setAmount((sellQty * realTimePrice).toFixed(2));
                    setTradeType('sell');
                  }}
                >
                  50% 매도
                </Button>
                <Button 
                  variant="outline-danger"
                  onClick={() => {
                    const holdings = wallet.coins[symbol] || 0;
                    setQuantity(holdings.toFixed(8));
                    setAmount((holdings * realTimePrice).toFixed(2));
                    setTradeType('sell');
                  }}
                >
                  전량 매도
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TradePage;