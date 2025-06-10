import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUser, FaLock, FaBell, FaCog } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const ProfileSettingsPage = () => {
  const { user } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    phone: ''
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: '개인정보가 성공적으로 업데이트되었습니다!'
        });
      } else {
        const error = await response.json();
        setAlert({
          show: true,
          type: 'danger',
          message: error.message || '개인정보 업데이트에 실패했습니다.'
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
          <Card>
            <Card.Header>
              <h5>설정</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                <div className="list-group-item list-group-item-action active">
                  <FaUser className="me-2" />
                  개인정보 설정
                </div>
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
              <h4><FaUser className="me-2" />개인정보 설정</h4>
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
                <Form.Group className="mb-3">
                  <Form.Label>닉네임</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="닉네임을 입력하세요"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>핸드폰 번호</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="핸드폰 번호를 입력하세요 (예: 010-1234-5678)"
                  />
                  <Form.Text className="text-muted">
                    선택사항입니다. 01X-XXXX-XXXX 형식으로 입력해주세요.
                  </Form.Text>
                </Form.Group>

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
                    {loading ? '저장 중...' : '저장'}
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

export default ProfileSettingsPage;
