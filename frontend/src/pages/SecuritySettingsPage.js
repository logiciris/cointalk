import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUser, FaLock, FaBell, FaCog, FaKey } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const SecuritySettingsPage = () => {
  const { user } = useSelector(state => state.auth);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({
        show: true,
        type: 'danger',
        message: '새 비밀번호가 일치하지 않습니다.'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setAlert({
        show: true,
        type: 'danger',
        message: '새 비밀번호는 최소 6자 이상이어야 합니다.'
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: '비밀번호가 성공적으로 변경되었습니다.'
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setAlert({
          show: true,
          type: 'danger',
          message: result.message || '비밀번호 변경에 실패했습니다.'
        });
      }
    } catch (error) {
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
          {/* 사이드바 메뉴 */}
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
                <div className="list-group-item list-group-item-action active">
                  <FaLock className="me-2" />
                  비밀번호 변경
                </div>
                <Link to="/settings/2fa" className="list-group-item list-group-item-action">
                  <FaShieldAlt className="me-2" />
                  2차 인증
                </Link>
                <Link to="/settings/notifications" className="list-group-item list-group-item-action">
                  <FaBell className="me-2" />
                  알림 설정
                </Link>
                <Link to="/settings/general" className="list-group-item list-group-item-action">
                  <FaCog className="me-2" />
                  일반 설정
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <Card>
            <Card.Header>
              <h4><FaLock className="me-2" />비밀번호 변경</h4>
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

              {/* 비밀번호 변경 섹션 */}
              <Card className="mb-4">
                <Card.Header>
                  <h5><FaKey className="me-2" />비밀번호 변경</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handlePasswordChange}>
                    <Form.Group className="mb-3">
                      <Form.Label>현재 비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="현재 비밀번호를 입력하세요"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>새 비밀번호</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                        required
                      />
                      <Form.Text className="text-muted">
                        비밀번호는 최소 6자 이상이어야 합니다.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>새 비밀번호 확인</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="새 비밀번호를 다시 입력하세요"
                        required
                      />
                    </Form.Group>

                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? '변경 중...' : '비밀번호 변경'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

              {/* 보안 권장사항 */}
              <Card>
                <Card.Header>
                  <h5>보안 권장사항</h5>
                </Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      정기적으로 비밀번호를 변경하세요
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      2차 인증을 활성화하세요
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-exclamation-circle-fill text-warning me-2"></i>
                      공용 컴퓨터에서는 로그아웃을 잊지 마세요
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-exclamation-circle-fill text-warning me-2"></i>
                      의심스러운 활동이 있으면 즉시 비밀번호를 변경하세요
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SecuritySettingsPage;
