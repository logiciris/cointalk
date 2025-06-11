import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const CoinChatPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [coin, setCoin] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // 사용자 레벨 계산
  const getUserLevel = (user) => {
    const messageCount = messages.filter(m => m.author === user.username).length;
    if (messageCount < 10) return 'newbie';
    if (messageCount < 50) return 'trader';
    return 'expert';
  };

  const getLevelBadge = (level) => {
    const badges = {
      newbie: { variant: 'secondary', text: '뉴비' },
      trader: { variant: 'primary', text: '트레이더' },
      expert: { variant: 'warning', text: '전문가' }
    };
    return badges[level] || badges.newbie;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 코인 정보 설정
    setCoin({
      symbol: symbol,
      name: symbol === 'BTC' ? 'Bitcoin' : symbol === 'ETH' ? 'Ethereum' : symbol,
      price: 58432.21,
      logo: symbol === 'BTC' ? '₿' : symbol === 'ETH' ? 'Ξ' : '🪙'
    });

    // 기존 메시지 로드
    const savedMessages = localStorage.getItem(`chat_${symbol}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // 초기 샘플 메시지
      const sampleMessages = [
        {
          id: 1,
          author: 'cryptoexpert',
          message: `${symbol} 차트가 상승 삼각형을 그리고 있네요. 곧 돌파할 것 같습니다!`,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'text'
        },
        {
          id: 2,
          author: 'trader123',
          message: '저도 같은 생각입니다. 지지선이 계속 올라오고 있어서 긍정적이에요.',
          timestamp: new Date(Date.now() - 240000).toISOString(),
          type: 'text'
        },
        {
          id: 3,
          author: 'moonshot',
          message: '🚀🚀🚀 투더문!',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          type: 'text'
        }
      ];
      setMessages(sampleMessages);
    }

    // 온라인 사용자 시뮬레이션
    setOnlineUsers([
      { username: 'cryptoexpert', level: 'expert' },
      { username: 'trader123', level: 'trader' },
      { username: 'moonshot', level: 'newbie' },
      { username: 'hodler', level: 'trader' }
    ]);

    // 실시간 메시지 시뮬레이션 (10초마다)
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% 확률로 새 메시지
        const randomUsers = ['cryptomaster', 'bitcoinfan', 'altcoinhunter', 'defiking'];
        const randomMessages = [
          `${symbol} 호재 뉴스가 나왔네요!`,
          '지금이 매수 타이밍인 것 같습니다.',
          '차트 분석 결과 상승 신호가 보입니다.',
          '다들 어떻게 보시나요?',
          '이 가격에서 추가 매수 고민 중입니다.',
          '기술적 분석상 저항선 돌파 임박!',
          '펀더멘털이 정말 강하네요.',
          '장기 보유 전략으로 갑니다!'
        ];

        const newMsg = {
          id: Date.now(),
          author: randomUsers[Math.floor(Math.random() * randomUsers.length)],
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date().toISOString(),
          type: 'text'
        };

        setMessages(prev => {
          const updated = [...prev, newMsg];
          localStorage.setItem(`chat_${symbol}`, JSON.stringify(updated));
          return updated;
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [symbol, user, navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      author: user.username,
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_${symbol}`, JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!coin) {
    return <Container className="mt-4"><div className="text-center">로딩 중...</div></Container>;
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <span className="me-3" style={{ fontSize: '24px' }}>{coin.logo}</span>
          <div>
            <h2>{coin.name} ({coin.symbol}) 채팅방</h2>
            <small className="text-muted">실시간 토론 • {onlineUsers.length}명 온라인</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate(`/coin/${symbol}`)}>
            코인 정보
          </Button>
          <Button variant="outline-success" onClick={() => navigate(`/trade/${symbol}`)}>
            거래하기
          </Button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-9">
          <Card style={{ height: '600px' }}>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">실시간 채팅</h5>
                <Badge bg="success">{messages.length}개 메시지</Badge>
              </div>
            </Card.Header>
            <Card.Body className="d-flex flex-column p-0">
              <div 
                className="flex-grow-1 overflow-auto p-3" 
                style={{ maxHeight: '480px' }}
                id="chatMessages"
              >
                {messages.map(message => (
                  <div key={message.id} className="mb-3">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                          {message.author.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <strong className="me-2">{message.author}</strong>
                          <Badge 
                            bg={getLevelBadge(getUserLevel({ username: message.author })).variant}
                            className="me-2"
                          >
                            {getLevelBadge(getUserLevel({ username: message.author })).text}
                          </Badge>
                          <small className="text-muted">
                            {formatTime(message.timestamp)}
                          </small>
                        </div>
                        <div className="message-content">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-top p-3">
                <Form onSubmit={sendMessage}>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder={`${coin.symbol} 채팅방에 메시지를 입력하세요...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      maxLength={500}
                    />
                    <Button type="submit" variant="primary" disabled={!newMessage.trim()}>
                      전송
                    </Button>
                  </div>
                  <small className="text-muted">
                    {newMessage.length}/500 • 예의를 지켜주세요
                  </small>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-3">
          <Card>
            <Card.Header>
              <h6 className="mb-0">온라인 사용자 ({onlineUsers.length})</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {onlineUsers.map(user => (
                  <ListGroup.Item key={user.username} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle me-2" 
                           style={{ width: '8px', height: '8px' }}></div>
                      <span>{user.username}</span>
                    </div>
                    <Badge bg={getLevelBadge(user.level).variant}>
                      {getLevelBadge(user.level).text}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">채팅방 규칙</h6>
            </Card.Header>
            <Card.Body>
              <ul className="small mb-0">
                <li>투자 조언이 아닌 개인 의견입니다</li>
                <li>욕설, 도배, 스팸은 금지됩니다</li>
                <li>타인을 존중해주세요</li>
                <li>투자는 본인 책임입니다</li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

// 메시지가 추가될 때마다 스크롤을 아래로
React.useEffect(() => {
  const chatContainer = document.getElementById('chatMessages');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
});

export default CoinChatPage;