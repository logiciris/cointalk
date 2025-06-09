import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Form, Modal, Badge } from 'react-bootstrap';
import { FaShieldAlt, FaQrcode, FaKey, FaCopy, FaTrash, FaCheck } from 'react-icons/fa';
import authService from '../../services/authService';

const TwoFactorSettings = () => {
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getTwoFactorStatus();
      if (response.success) {
        setTwoFactorStatus(response);
      }
    } catch (error) {
      console.error('2FA status load error:', error);
      setError('2차 인증 상태를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupStart = async () => {
    try {
      setError('');
      const response = await authService.setupTwoFactor();
      if (response.success) {
        setSetupData(response);
        setShowSetup(true);
      } else {
        setError(response.message || '2차 인증 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      setError('2차 인증 설정 중 오류가 발생했습니다.');
    }
  };

  const handleSetupConfirm = async (e) => {
    e.preventDefault();
    
    if (confirmCode.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    try {
      setError('');
      const response = await authService.confirmTwoFactor(confirmCode);
      if (response.success) {
        setSuccess('2차 인증이 성공적으로 설정되었습니다!');
        setShowSetup(false);
        setSetupData(null);
        setConfirmCode('');
        loadTwoFactorStatus();
      } else {
        setError(response.message || '인증 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('2FA confirm error:', error);
      setError('2차 인증 확인 중 오류가 발생했습니다.');
    }
  };

  const handleDisable = async () => {
    try {
      setError('');
      const response = await authService.disableTwoFactor(disablePassword);
      if (response.success) {
        setSuccess('2차 인증이 비활성화되었습니다.');
        setShowDisableModal(false);
        setDisablePassword('');
        loadTwoFactorStatus();
      } else {
        setError(response.message || '2차 인증 비활성화에 실패했습니다.');
      }
    } catch (error) {
      console.error('2FA disable error:', error);
      setError('2차 인증 비활성화 중 오류가 발생했습니다.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('클립보드에 복사되었습니다!');
      setTimeout(() => setSuccess(''), 3000);
    });
  };

  if (isLoading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">로딩중...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <FaShieldAlt className="me-2" />
                2차 인증 설정
              </h4>
            </Card.Header>
            
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              <div className="mb-4">
                <h5>현재 상태</h5>
                <p className="mb-2">
                  2차 인증: {' '}
                  <Badge bg={twoFactorStatus?.twoFactorEnabled ? 'success' : 'warning'}>
                    {twoFactorStatus?.twoFactorEnabled ? '활성화됨' : '비활성화됨'}
                  </Badge>
                </p>
                
                {twoFactorStatus?.twoFactorEnabled && twoFactorStatus.enabledAt && (
                  <p className="text-muted small">
                    활성화 날짜: {new Date(twoFactorStatus.enabledAt).toLocaleString()}
                  </p>
                )}
              </div>

              {!twoFactorStatus?.twoFactorEnabled ? (
                <div>
                  <h5>2차 인증 설정</h5>
                  <p className="text-muted">
                    계정의 보안을 강화하기 위해 2차 인증을 설정하세요. 
                    Google Authenticator, Authy 등의 앱이 필요합니다.
                  </p>
                  
                  <Button variant="primary" onClick={handleSetupStart}>
                    <FaShieldAlt className="me-2" />
                    2차 인증 설정하기
                  </Button>
                </div>
              ) : (
                <div>
                  <h5>신뢰할 수 있는 디바이스</h5>
                  {twoFactorStatus.trustedDevices && twoFactorStatus.trustedDevices.length > 0 ? (
                    <div className="mb-3">
                      {twoFactorStatus.trustedDevices.map((device, index) => (
                        <div key={index} className="border rounded p-2 mb-2">
                          <strong>{device.device_name || '알 수 없는 디바이스'}</strong>
                          <br />
                          <small className="text-muted">
                            IP: {device.ip_address} | 
                            등록: {new Date(device.created_at).toLocaleDateString()} |
                            마지막 사용: {new Date(device.last_used).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">신뢰할 수 있는 디바이스가 없습니다.</p>
                  )}
                  
                  <Button 
                    variant="danger" 
                    onClick={() => setShowDisableModal(true)}
                  >
                    <FaTrash className="me-2" />
                    2차 인증 비활성화
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2차 인증 설정 모달 */}
      <Modal show={showSetup} onHide={() => setShowSetup(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaQrcode className="me-2" />
            2차 인증 설정
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {setupData && (
            <div>
              <div className="text-center mb-4">
                <h6>1단계: QR 코드 스캔</h6>
                <p className="text-muted">
                  Google Authenticator나 Authy 앱으로 아래 QR 코드를 스캔하세요.
                </p>
                
                {/* QR 코드 영역 (실제로는 QR 코드 라이브러리 사용) */}
                <div className="border rounded p-3 bg-light text-center mb-3">
                  <FaQrcode size={100} className="text-muted" />
                  <br />
                  <small className="text-muted">QR 코드</small>
                  <br />
                  <code>{setupData.qrCodeUrl}</code>
                </div>
                
                <p className="small text-muted">
                  QR 코드를 스캔할 수 없다면 다음 키를 수동으로 입력하세요:
                </p>
                
                <div className="input-group mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    value={setupData.secretKey} 
                    readOnly 
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => copyToClipboard(setupData.secretKey)}
                  >
                    <FaCopy />
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <h6>백업 코드</h6>
                <p className="text-muted small">
                  이 코드들을 안전한 곳에 저장하세요. 앱에 접근할 수 없을 때 사용할 수 있습니다.
                </p>
                <div className="row">
                  {setupData.backupCodes && setupData.backupCodes.map((code, index) => (
                    <div key={index} className="col-6 mb-1">
                      <code className="bg-light p-1 rounded">{code}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h6>2단계: 인증 코드 입력</h6>
                <Form onSubmit={handleSetupConfirm}>
                  <Form.Group className="mb-3">
                    <Form.Label>앱에서 생성된 6자리 코드를 입력하세요</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="000000"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      maxLength={6}
                      style={{ 
                        fontSize: '1.2rem', 
                        textAlign: 'center',
                        letterSpacing: '0.2rem'
                      }}
                    />
                  </Form.Group>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowSetup(false)}
                    >
                      취소
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={confirmCode.length !== 6}
                    >
                      <FaCheck className="me-2" />
                      설정 완료
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* 2차 인증 비활성화 모달 */}
      <Modal show={showDisableModal} onHide={() => setShowDisableModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            <FaTrash className="me-2" />
            2차 인증 비활성화
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Alert variant="warning">
            <strong>주의!</strong> 2차 인증을 비활성화하면 계정의 보안이 약해집니다.
          </Alert>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>현재 비밀번호를 입력하세요</Form.Label>
              <Form.Control
                type="password"
                placeholder="비밀번호"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDisableModal(false)}>
            취소
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDisable}
            disabled={!disablePassword}
          >
            비활성화
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TwoFactorSettings;
