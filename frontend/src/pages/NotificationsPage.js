import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제로는 API에서 알림 목록을 가져오는 로직이 들어갈 예정
    // 테스트용 데이터
    const mockNotifications = [
      {
        id: 1,
        type: 'like',
        content: 'cryptotrader님이 회원님의 게시물을 좋아합니다.',
        sourceUser: {
          id: 102,
          username: 'cryptotrader',
          avatar: 'https://via.placeholder.com/32'
        },
        sourcePost: {
          id: 1,
          title: '비트코인 상승세, 올해 말 새로운 고점 찍을까?'
        },
        timestamp: '2025-05-15 15:30',
        isRead: false
      },
      {
        id: 2,
        type: 'comment',
        content: 'cryptotrader님이 회원님의 게시물에 댓글을 남겼습니다.',
        sourceUser: {
          id: 102,
          username: 'cryptotrader',
          avatar: 'https://via.placeholder.com/32'
        },
        sourcePost: {
          id: 1,
          title: '비트코인 상승세, 올해 말 새로운 고점 찍을까?'
        },
        timestamp: '2025-05-15 15:28',
        isRead: false
      },
      {
        id: 3,
        type: 'follow',
        content: 'defimaster님이 회원님을 팔로우합니다.',
        sourceUser: {
          id: 103,
          username: 'defimaster',
          avatar: 'https://via.placeholder.com/32'
        },
        timestamp: '2025-05-14 10:15',
        isRead: true
      },
      {
        id: 4,
        type: 'mention',
        content: 'nftcollector님이 게시물에서 회원님을 언급했습니다.',
        sourceUser: {
          id: 104,
          username: 'nftcollector',
          avatar: 'https://via.placeholder.com/32'
        },
        sourcePost: {
          id: 8,
          title: '디지털 아트의 미래: NFT의 진화'
        },
        timestamp: '2025-05-12 18:20',
        isRead: true
      }
    ];
    
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  // 알림 아이콘 매핑
  const getNotificationIcon = type => {
    switch (type) {
      case 'like':
        return 'bi-heart-fill text-danger';
      case 'comment':
        return 'bi-chat-fill text-primary';
      case 'follow':
        return 'bi-person-plus-fill text-success';
      case 'mention':
        return 'bi-at text-warning';
      case 'message':
        return 'bi-envelope-fill text-info';
      default:
        return 'bi-bell-fill';
    }
  };

  if (loading) {
    return <Container className="mt-5"><p>로딩 중...</p></Container>;
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">알림</h4>
          <button className="btn btn-sm btn-outline-primary">모두 읽음 표시</button>
        </Card.Header>
        <ListGroup variant="flush">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <ListGroup.Item
                key={notification.id}
                className={`d-flex align-items-center ${notification.isRead ? '' : 'bg-light'}`}
              >
                <div className="notification-icon me-3">
                  <i className={`bi ${getNotificationIcon(notification.type)} fs-4`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <img
                      src={notification.sourceUser.avatar}
                      alt={notification.sourceUser.username}
                      className="rounded-circle me-2"
                      width="32"
                      height="32"
                    />
                    <div>{notification.content}</div>
                  </div>
                  {notification.sourcePost && (
                    <div className="notification-post text-muted">
                      게시물: {notification.sourcePost.title}
                    </div>
                  )}
                  <div className="notification-time text-muted small">
                    {notification.timestamp}
                  </div>
                </div>
                {!notification.isRead && (
                  <span className="badge bg-primary rounded-pill">새 알림</span>
                )}
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>알림이 없습니다.</ListGroup.Item>
          )}
        </ListGroup>
      </Card>
    </Container>
  );
};

export default NotificationsPage;
