import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button } from 'react-bootstrap';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제로는 API에서 대화 목록을 가져오는 로직이 들어갈 예정
    // 테스트용 데이터
    const mockConversations = [
      {
        id: 1,
        user: {
          id: 102,
          username: 'cryptotrader',
          avatar: 'https://via.placeholder.com/40'
        },
        lastMessage: '네, 좋은 생각입니다. 한번 살펴보겠습니다.',
        lastMessageTime: '2025-05-15 14:32',
        unread: 0
      },
      {
        id: 2,
        user: {
          id: 103,
          username: 'defimaster',
          avatar: 'https://via.placeholder.com/40'
        },
        lastMessage: 'DeFi 프로젝트에 대해 더 이야기해 볼까요?',
        lastMessageTime: '2025-05-14 09:15',
        unread: 2
      },
      {
        id: 3,
        user: {
          id: 104,
          username: 'nftcollector',
          avatar: 'https://via.placeholder.com/40'
        },
        lastMessage: '새로운 NFT 컬렉션을 확인해 보셨나요?',
        lastMessageTime: '2025-05-12 18:45',
        unread: 0
      }
    ];
    
    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
    
    // 실제로는 API에서 메시지 내용을 가져오는 로직이 들어갈 예정
    // 테스트용 데이터
    const mockMessages = [
      {
        id: 1,
        senderId: 101, // 현재 사용자
        receiverId: 102,
        content: '안녕하세요! 비트코인 차트 분석에 대한 의견이 궁금합니다.',
        timestamp: '2025-05-15 14:25'
      },
      {
        id: 2,
        senderId: 102,
        receiverId: 101,
        content: '안녕하세요! 현재 비트코인은 상승 추세에 있는 것 같습니다. RSI와 MACD 지표를 보면 긍정적인 신호가 많이 보이네요.',
        timestamp: '2025-05-15 14:28'
      },
      {
        id: 3,
        senderId: 101,
        receiverId: 102,
        content: 'EMA 200선도 지지선 역할을 하고 있어서 좋아 보이네요. 다음 주요 저항선은 어디로 보시나요?',
        timestamp: '2025-05-15 14:30'
      },
      {
        id: 4,
        senderId: 102,
        receiverId: 101,
        content: '네, 좋은 생각입니다. 한번 살펴보겠습니다.',
        timestamp: '2025-05-15 14:32'
      }
    ];
    
    setMessages(mockMessages);
    setLoading(false);
  }, []);

  const handleConversationSelect = conversation => {
    setSelectedConversation(conversation);
    // 실제로는 API에서 해당 대화의 메시지를 가져오는 로직이 들어갈 예정
  };

  const handleSendMessage = e => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // 실제로는 API로 메시지 전송하는 로직이 들어갈 예정
    const newMsg = {
      id: messages.length + 1,
      senderId: 101, // 현재 사용자
      receiverId: selectedConversation.user.id,
      content: newMessage,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  if (loading) {
    return <Container className="mt-5"><p>로딩 중...</p></Container>;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="conversation-list">
            <Card.Header>
              <h4 className="mb-0">메시지</h4>
            </Card.Header>
            <ListGroup variant="flush">
              {conversations.map(conversation => (
                <ListGroup.Item
                  key={conversation.id}
                  action
                  active={selectedConversation && selectedConversation.id === conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className="d-flex align-items-center"
                >
                  <img
                    src={conversation.user.avatar}
                    alt={conversation.user.username}
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong>{conversation.user.username}</strong>
                      <small className="text-muted">{conversation.lastMessageTime.split(' ')[0]}</small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-truncate">{conversation.lastMessage}</span>
                      {conversation.unread > 0 && (
                        <span className="badge bg-primary rounded-pill">{conversation.unread}</span>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="message-area">
            <Card.Header className="d-flex align-items-center">
              {selectedConversation && (
                <>
                  <img
                    src={selectedConversation.user.avatar}
                    alt={selectedConversation.user.username}
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <h5 className="mb-0">{selectedConversation.user.username}</h5>
                </>
              )}
            </Card.Header>
            <Card.Body className="message-body">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.senderId === 101 ? 'sent' : 'received'}`}
                >
                  <div className={`message-bubble ${message.senderId === 101 ? 'bg-primary text-white' : 'bg-light'}`}>
                    <p className="mb-0">{message.content}</p>
                    <small className={`timestamp ${message.senderId === 101 ? 'text-white-50' : 'text-muted'}`}>
                      {message.timestamp.split(' ')[1]}
                    </small>
                  </div>
                </div>
              ))}
            </Card.Body>
            <Card.Footer>
              <Form onSubmit={handleSendMessage}>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <i className="bi bi-send"></i>
                  </Button>
                </div>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MessagesPage;
