import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUser, FaLock, FaBell, FaCog, FaPalette, FaLanguage, FaBellSlash } from 'react-icons/fa';

const GeneralSettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'ko',
    notifications: {
      email: true,
      push: true,
      posts: true,
      comments: true,
      follows: true
    },
    privacy: {
      showEmail: false,
      showProfile: true,
      showActivity: true
    }
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/settings/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setSettings(prev => ({ ...prev, theme: newTheme }));
    
    // 즉시 테마 적용
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleLanguageChange = (e) => {
    setSettings(prev => ({ ...prev, language: e.target.value }));
  };

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePrivacyChange = (key) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('설정 저장 시작:', { token: token ? '있음' : '없음', settings });
      
      const response = await fetch('http://localhost:5000/api/settings/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      console.log('응답 상태:', response.status);
      const data = await response.json();
      console.log('응답 데이터:', data);

      if (data.success) {
        // 설정 저장 성공 후 사용자 정보 다시 가져오기
        try {
          const userResponse = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('업데이트된 사용자 정보:', userData.user);
            
            // isAdmin 속성이 있으면 localStorage 업데이트
            if (userData.user.isAdmin) {
              console.log('🚨 isAdmin 속성 감지! 사용자 정보 업데이트');
              localStorage.setItem('user', JSON.stringify(userData.user));
              
              // Redux store도 업데이트할 수 있다면 좋겠지만, 일단 새로고침
              setAlert({
                show: true,
                type: 'warning',
                message: '설정이 저장되었습니다. 페이지를 새로고침하여 변경사항을 확인하세요.'
              });
              
              // 3초 후 자동 새로고침
              setTimeout(() => {
                window.location.reload();
              }, 3000);
              
            } else {
              setAlert({
                show: true,
                type: 'success',
                message: '설정이 성공적으로 저장되었습니다!'
              });
            }
          }
        } catch (userError) {
          console.error('사용자 정보 업데이트 오류:', userError);
          setAlert({
            show: true,
            type: 'success',
            message: '설정이 성공적으로 저장되었습니다!'
          });
        }
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: data.message || '설정 저장에 실패했습니다.'
        });
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      setAlert({
        show: true,
        type: 'danger',
        message: '네트워크 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={3}>
          <Card>
            <Card.Header>
              <h5>설정</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                <Link to="/settings/profile" className="list-group-item list-group-item-action">
                  <FaUser className="me-2" />
                  개인정보 설정
                </Link>
                <Link to="/settings/security" className="list-group-item list-group-item-action">
                  <FaLock className="me-2" />
                  비밀번호 변경
                </Link>
                <Link to="/settings/2fa" className="list-group-item list-group-item-action">
                  <FaShieldAlt className="me-2" />
                  2차 인증
                </Link>
                <Link to="/settings/notifications" className="list-group-item list-group-item-action">
                  <FaBell className="me-2" />
                  알림 설정
                </Link>
                <div className="list-group-item list-group-item-action active">
                  <FaCog className="me-2" />
                  일반 설정
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <Card>
            <Card.Header>
              <h4><FaCog className="me-2" />일반 설정</h4>
            </Card.Header>
            <Card.Body>
              {alert.show && (
                <Alert 
                  variant={alert.type} 
                  onClose={() => setAlert({...alert, show: false})} 
                  dismissible
                >
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* 테마 설정 */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6><FaPalette className="me-2" />테마 설정</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group>
                      <Form.Label>테마 선택</Form.Label>
                      <Form.Select 
                        value={settings.theme} 
                        onChange={handleThemeChange}
                      >
                        <option value="light">라이트 모드</option>
                        <option value="dark">다크 모드</option>
                        <option value="auto">시스템 설정 따르기</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        화면 테마를 변경합니다.
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* 언어 설정 */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6><FaLanguage className="me-2" />언어 설정</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group>
                      <Form.Label>언어 선택</Form.Label>
                      <Form.Select 
                        value={settings.language} 
                        onChange={handleLanguageChange}
                      >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        인터페이스 언어를 변경합니다.
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* 알림 설정 */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6><FaBell className="me-2" />알림 설정</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Check
                      type="switch"
                      id="email-notifications"
                      label="이메일 알림"
                      checked={settings.notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      id="push-notifications"
                      label="푸시 알림"
                      checked={settings.notifications.push}
                      onChange={() => handleNotificationChange('push')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      id="post-notifications"
                      label="새 게시물 알림"
                      checked={settings.notifications.posts}
                      onChange={() => handleNotificationChange('posts')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      id="comment-notifications"
                      label="댓글 알림"
                      checked={settings.notifications.comments}
                      onChange={() => handleNotificationChange('comments')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      id="follow-notifications"
                      label="팔로우 알림"
                      checked={settings.notifications.follows}
                      onChange={() => handleNotificationChange('follows')}
                    />
                  </Card.Body>
                </Card>

                {/* 개인정보 보호 설정 */}
                <Card className="mb-4">
                  <Card.Header>
                    <h6><FaBellSlash className="me-2" />개인정보 보호</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Check
                      type="switch"
                      id="show-email"
                      label="이메일 주소 공개"
                      checked={settings.privacy.showEmail}
                      onChange={() => handlePrivacyChange('showEmail')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      id="show-profile"
                      label="프로필 공개"
                      checked={settings.privacy.showProfile}
                      onChange={() => handlePrivacyChange('showProfile')}
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      id="show-activity"
                      label="활동 내역 공개"
                      checked={settings.privacy.showActivity}
                      onChange={() => handlePrivacyChange('showActivity')}
                    />
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => window.history.back()}
                  >
                    취소
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? '저장 중...' : '설정 저장'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GeneralSettingsPage;