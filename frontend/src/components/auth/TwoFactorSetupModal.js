import React, { useState } from 'react';
import { Modal, Button, Alert, Form, InputGroup } from 'react-bootstrap';
import { FaShieldAlt, FaCopy, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TwoFactorSetupModal = ({ show, onHide, twoFactorCode, backupCodes, userInfo, onContinue }) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(twoFactorCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    const backupText = backupCodes.join('\n');
    navigator.clipboard.writeText(backupText);
  };

  const handleContinue = () => {
    if (confirmed) {
      onContinue();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      backdrop="static" 
      keyboard={false}
      centered
    >
      <Modal.Header className="bg-success text-white">
        <Modal.Title>
          <FaShieldAlt className="me-2" />
          회원가입 완료 - 2차 인증 설정
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <Alert variant="success" className="mb-4">
          <FaCheckCircle className="me-2" />
          <strong>축하합니다!</strong> {userInfo?.username}님의 계정이 성공적으로 생성되었습니다.
        </Alert>

        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>중요!</strong> 보안을 위해 2차 인증이 자동으로 활성화되었습니다. 
          아래 인증 코드를 반드시 안전한 곳에 저장해주세요.
        </Alert>

        <div className="mb-4">
          <h5 className="text-primary">🔐 귀하의 2차 인증 코드</h5>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              value={twoFactorCode}
              readOnly
              style={{ 
                fontSize: '1.5rem', 
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#f8f9fa',
                color: '#0d6efd'
              }}
            />
            <Button 
              variant="outline-primary" 
              onClick={handleCopyCode}
              className="d-flex align-items-center"
            >
              {copied ? <FaCheckCircle className="me-1" /> : <FaCopy className="me-1" />}
              {copied ? '복사됨!' : '복사'}
            </Button>
          </InputGroup>
          <small className="text-muted">
            로그인 시 이 6자리 숫자를 입력하세요.
          </small>
        </div>

        {backupCodes && backupCodes.length > 0 && (
          <div className="mb-4">
            <h6 className="text-info">🔑 백업 코드 (응급시 사용)</h6>
            <div 
              style={{ 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #dee2e6',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontFamily: 'monospace'
              }}
            >
              {backupCodes.map((code, index) => (
                <div key={index}>{code}</div>
              ))}
            </div>
            <div className="mt-2">
              <Button 
                variant="outline-info" 
                size="sm"
                onClick={handleCopyBackupCodes}
              >
                <FaCopy className="me-1" />
                백업 코드 복사
              </Button>
            </div>
            <small className="text-muted d-block mt-1">
              인증 앱을 사용할 수 없을 때 이 코드들을 사용할 수 있습니다.
            </small>
          </div>
        )}

        <Alert variant="info" className="mb-4">
          <h6>📱 로그인 방법:</h6>
          <ol className="mb-0">
            <li>이메일과 비밀번호를 입력하세요</li>
            <li>2차 인증 화면에서 위의 <strong>{twoFactorCode}</strong>를 입력하세요</li>
            <li>로그인이 완료됩니다</li>
          </ol>
        </Alert>

        <Form.Check
          type="checkbox"
          id="confirm-saved"
          label="위의 2차 인증 코드를 안전한 곳에 저장했습니다"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mb-3"
        />

        <Alert variant="danger" className="small">
          <strong>⚠️ 주의:</strong> 이 코드를 분실하면 계정에 로그인할 수 없게 됩니다. 
          반드시 안전한 곳에 보관하세요.
        </Alert>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={handleContinue}
          disabled={!confirmed}
          className="px-4"
        >
          계속하기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TwoFactorSetupModal;
