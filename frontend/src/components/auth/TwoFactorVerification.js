import React, { useState, useEffect } from 'react';
import { Alert, Card, Form, Button, InputGroup, Modal } from 'react-bootstrap';
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaCopy, FaCheckCircle } from 'react-icons/fa';
import authService from '../../services/authService';

const TwoFactorVerification = ({ sessionId, onVerificationSuccess, onCancel, userInfo }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.verifyTwoFactor(sessionId, code, trustDevice);

      // 🚨 취약점: 클라이언트에서 검증 결과를 신뢰
      // 개발자 도구에서 response.verification.isValid를 true로 변경하면 우회 가능
      if (response.success && response.verification && response.verification.isValid) {
        onVerificationSuccess(response);
      } else {
        // 🚨 추가 취약점: 에러 메시지에서 힌트 제공
        setError(response.message || '인증에 실패했습니다. 올바른 코드를 입력하세요.');
        
        // 🚨 디버그 정보 노출 (개발자 도구에서 확인 가능)
        console.log('2FA Verification Failed:', {
          providedCode: code,
          sessionId: sessionId,
          response: response
        });
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setError('서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(value);
  };

  // 🚨 취약점: 클라이언트 측 우회 함수 (개발자 도구에서 호출 가능)
  window.bypassTwoFactor = () => {
    console.log('🚨 우회 시도: 2차 인증 건너뛰기');
    onVerificationSuccess({
      success: true,
      verification: { isValid: true, bypass: true },
      message: '우회된 인증'
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow">
        <Card.Header className="bg-warning text-dark text-center">
          <FaShieldAlt size={24} className="me-2" />
          <strong>2차 인증 필요</strong>
        </Card.Header>
        
        <Card.Body className="p-4">
          <div className="text-center mb-3">
            <p className="text-muted">
              <strong>{userInfo?.email}</strong>
            </p>
            <p>
              모바일 앱에서 생성된 6자리 인증 코드를 입력하세요.
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleVerify}>
            <Form.Group className="mb-3">
              <Form.Label>인증 코드</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={6}
                  style={{ 
                    fontSize: '1.2rem', 
                    textAlign: 'center',
                    letterSpacing: '0.2rem'
                  }}
                  autoComplete="off"
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Google Authenticator, Authy 등의 앱에서 코드를 확인하세요.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="이 디바이스를 30일간 신뢰하기"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isLoading || code.length !== 6}
                size="lg"
              >
                {isLoading ? '확인 중...' : '인증하기'}
              </Button>
              
              <Button 
                variant="outline-secondary" 
                onClick={onCancel}
                disabled={isLoading}
              >
                취소
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TwoFactorVerification;
