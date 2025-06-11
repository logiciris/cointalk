import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav, Table } from 'react-bootstrap';

const TradePage = () => {
  const { symbol } = useParams();
  const [coin, setCoin] = useState(null);
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState(null);
  const [wallet, setWallet] = useState({ balance: 10000, coins: {} });
  const [transactions, setTransactions] = useState([]);

  // Mock coin data
  const mockCoins = {
    BTC: { name: 'Bitcoin', price: 45000, change24h: 2.5, logo: '₿' },
    ETH: { name: 'Ethereum', price: 3000, change24h: -1.2, logo: 'Ξ' },
    BNB: { name: 'Binance Coin', price: 400, change24h: 0.8, logo: 'BNB' },
    ADA: { name: 'Cardano', price: 1.2, change24h: 3.1, logo: 'ADA' },
    SOL: { name: 'Solana', price: 120, change24h: -2.3, logo: 'SOL' }
  };

  useEffect(() => {
    if (mockCoins[symbol]) {
      setCoin(mockCoins[symbol]);
    }
    
    // Load wallet from localStorage
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }

    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [symbol]);

  const calculateTotal = () => {
    if (!quantity || !coin) return '0.00';
    return (parseFloat(quantity) * coin.price).toFixed(2);
  };

  const getPortfolioValue = () => {
    let total = wallet.balance;
    for (const [coinSymbol, amount] of Object.entries(wallet.coins)) {
      if (mockCoins[coinSymbol]) {
        total += amount * mockCoins[coinSymbol].price;
      }
    }
    return total;
  };

  const handleTrade = () => {
    const qty = parseFloat(quantity);
    const total = parseFloat(calculateTotal());

    if (!qty || qty <= 0) {
      setAlert({ type: 'danger', message: '올바른 수량을 입력하세요.' });
      return;
    }

    if (tradeType === 'buy') {
      if (total > wallet.balance) {
        setAlert({ type: 'danger', message: '잔고가 부족합니다.' });
        return;
      }

      const newWallet = {
        ...wallet,
        balance: wallet.balance - total,
        coins: {
          ...wallet.coins,
          [symbol]: (wallet.coins[symbol] || 0) + qty
        }
      };

      setWallet(newWallet);
      localStorage.setItem('wallet', JSON.stringify(newWallet));
      
      setAlert({ type: 'success', message: `${qty} ${symbol} 매수 완료!` });
    } else {
      const holdings = wallet.coins[symbol] || 0;
      if (qty > holdings) {
        setAlert({ type: 'danger', message: '보유 수량이 부족합니다.' });
        return;
      }

      const newWallet = {
        ...wallet,
        balance: wallet.balance + total,
        coins: {
          ...wallet.coins,
          [symbol]: holdings - qty
        }
      };

      setWallet(newWallet);
      localStorage.setItem('wallet', JSON.stringify(newWallet));
      
      setAlert({ type: 'success', message: `${qty} ${symbol} 매도 완료!` });
    }

    // Add transaction record
    const newTransaction = {
      id: Date.now(),
      type: tradeType,
      symbol,
      quantity: qty,
      price: coin.price,
      total,
      date: new Date().toISOString()
    };

    const newTransactions = [newTransaction, ...transactions];
    setTransactions(newTransactions);
    localStorage.setItem('transactions', JSON.stringify(newTransactions));

    // Reset form
    setQuantity('');
    setAmount('');
  };

  if (!coin) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">코인을 찾을 수 없습니다.</Alert>
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
                    <span className="h4 mb-0 me-3">${coin.price.toLocaleString()}</span>
                    <span className={`badge ${coin.change24h >= 0 ? 'bg-success' : 'bg-danger'}`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                    </span>
                  </div>
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
                                setQuantity(e.target.value);
                                setAmount(calculateTotal());
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
                                setAmount(e.target.value);
                                const qty = parseFloat(e.target.value) / coin.price;
                                setQuantity(qty.toFixed(8));
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="mb-3 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between mb-2">
                          <span>가격:</span>
                          <span>${coin.price.toLocaleString()}</span>
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
                  <span className="fw-bold text-primary">${getPortfolioValue().toFixed(2)}</span>
                </div>
              </div>

              <div className="d-flex justify-content-between text-success">
                <span>수익/손실:</span>
                <span className="fw-bold">
                  ${(getPortfolioValue() - 10000).toFixed(2)} 
                  ({(((getPortfolioValue() - 10000) / 10000) * 100).toFixed(2)}%)
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
                    setQuantity((quickAmount / coin.price).toFixed(8));
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
                    setQuantity((quickAmount / coin.price).toFixed(8));
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
                    setAmount((sellQty * coin.price).toFixed(2));
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
                    setAmount((holdings * coin.price).toFixed(2));
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