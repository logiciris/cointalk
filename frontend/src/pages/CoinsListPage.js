import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, InputGroup, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const CoinsListPage = () => {
  const { t } = useTranslation();
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [loading, setLoading] = useState(true);

  // 임시 코인 데이터 (나중에 실제 API로 교체)
  const mockCoins = [
    { 
      id: 1, 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      price: 58432.21, 
      change24h: 2.4, 
      marketCap: 1120000000000, 
      volume24h: 45300000000,
      logo: '₿',
      followers: 1243
    },
    { 
      id: 2, 
      name: 'Ethereum', 
      symbol: 'ETH', 
      price: 3521.08, 
      change24h: -1.2, 
      marketCap: 420000000000, 
      volume24h: 21600000000,
      logo: 'Ξ',
      followers: 892
    },
    { 
      id: 3, 
      name: 'Cardano', 
      symbol: 'ADA', 
      price: 2.85, 
      change24h: 5.7, 
      marketCap: 92000000000, 
      volume24h: 6700000000,
      logo: '₳',
      followers: 567
    },
    { 
      id: 4, 
      name: 'Solana', 
      symbol: 'SOL', 
      price: 158.64, 
      change24h: 8.3, 
      marketCap: 48000000000, 
      volume24h: 5200000000,
      logo: '◎',
      followers: 445
    },
    { 
      id: 5, 
      name: 'Ripple', 
      symbol: 'XRP', 
      price: 1.12, 
      change24h: -0.8, 
      marketCap: 52000000000, 
      volume24h: 3900000000,
      logo: '✕',
      followers: 334
    },
    { 
      id: 6, 
      name: 'Dogecoin', 
      symbol: 'DOGE', 
      price: 0.385, 
      change24h: 12.7, 
      marketCap: 55000000000, 
      volume24h: 2800000000,
      logo: '🐕',
      followers: 678
    }
  ];

  useEffect(() => {
    // API 호출 시뮬레이션
    setTimeout(() => {
      setCoins(mockCoins);
      setLoading(false);
    }, 500);
  }, []);

  // 검색 필터링
  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 정렬
  const sortedCoins = [...filteredCoins].sort((a, b) => {
    switch (sortBy) {
      case 'marketCap':
        return b.marketCap - a.marketCap;
      case 'volume':
        return b.volume24h - a.volume24h;
      case 'change':
        return b.change24h - a.change24h;
      case 'price':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('coins.title', '암호화폐 목록')}</h2>
        <div className="d-flex gap-2">
          <InputGroup style={{ width: '300px' }}>
            <FormControl
              placeholder="코인 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <select 
            className="form-select" 
            style={{ width: '150px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="marketCap">시가총액</option>
            <option value="volume">거래량</option>
            <option value="change">24시간 변화율</option>
            <option value="price">가격</option>
          </select>
        </div>
      </div>

      <Card>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>코인</th>
                <th className="text-end">가격</th>
                <th className="text-end">24시간</th>
                <th className="text-end">시가총액</th>
                <th className="text-end">거래량(24h)</th>
                <th className="text-end">팔로워</th>
                <th className="text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {sortedCoins.map((coin, index) => (
                <tr key={coin.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="coin-logo me-3" style={{ fontSize: '24px' }}>
                        {coin.logo}
                      </div>
                      <div>
                        <div className="fw-bold">{coin.name}</div>
                        <small className="text-muted">{coin.symbol}</small>
                      </div>
                    </div>
                  </td>
                  <td className="text-end fw-bold">
                    ${coin.price.toLocaleString()}
                  </td>
                  <td className={`text-end fw-bold ${coin.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                  </td>
                  <td className="text-end">
                    ${formatNumber(coin.marketCap)}
                  </td>
                  <td className="text-end">
                    ${formatNumber(coin.volume24h)}
                  </td>
                  <td className="text-end">
                    {coin.followers.toLocaleString()}
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <Button 
                        as={Link} 
                        to={`/coin/${coin.symbol}/action`} 
                        variant="primary" 
                        size="sm"
                      >
                        상세 보기
                      </Button>
                      <Button 
                        as={Link} 
                        to={`/trade/${coin.symbol}`} 
                        variant="outline-success" 
                        size="sm"
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
    </Container>
  );
};

export default CoinsListPage;