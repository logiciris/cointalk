import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUser, FaLock, FaBell, FaCog } from 'react-icons/fa';

const SettingsPage = () => {
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
              <h4>계정 설정</h4>
            </Card.Header>
            <Card.Body>
              <p>왼쪽 메뉴에서 설정할 항목을 선택하세요.</p>
              
              <div className="mt-4">
                <h5>빠른 설정</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Card className="h-100">
                      <Card.Body className="text-center">
                        <FaShieldAlt size={40} className="text-warning mb-3" />
                        <h6>2차 인증</h6>
                        <p className="text-muted small">
                          계정 보안을 강화하세요
                        </p>
                        <Button as={Link} to="/settings/2fa" variant="outline-primary" size="sm">
                          설정하기
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <Card className="h-100">
                      <Card.Body className="text-center">
                        <FaUser size={40} className="text-info mb-3" />
                        <h6>개인정보 설정</h6>
                        <p className="text-muted small">
                          개인정보를 수정하세요
                        </p>
                        <Button as={Link} to="/settings/profile" variant="outline-primary" size="sm">
                          수정하기
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsPage;
