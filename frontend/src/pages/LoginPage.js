import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { login, clearErrors } from '../redux/actions/authActions';
import TwoFactorVerification from '../components/auth/TwoFactorVerification';
import authService from '../services/authService';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error, isAuthenticated, message } = useSelector(state => state.auth);

  const { email, password } = formData;

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 에러 초기화
  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // 기본 유효성 검사
    if (!email || !password) {
      return;
    }

    try {
      // 직접 authService 사용하여 로그인 시도
      const result = await authService.login(email, password);
      
      if (result.success) {
        if (result.requiresTwoFactor) {
          // 2차 인증이 필요한 경우
          setTwoFactorData({
            sessionId: result.sessionId,
            user: result.user
          });
          setShowTwoFactor(true);
        } else {
          // 일반 로그인 성공
          dispatch(login(email, password));
          navigate('/');
        }
      } else {
        // 로그인 실패
        dispatch(clearErrors());
        // 에러를 Redux 상태에 설정할 수 있지만, 여기서는 직접 처리
        alert(result.message);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
    }
  };

  // 2차 인증 성공 처리
  const handleTwoFactorSuccess = (response) => {
    console.log('2FA Success:', response);
    
    // 🚨 취약점: 클라이언트에서 검증 우회 가능
    // 개발자 도구에서 response.verification.isValid = true로 변경하여 우회
    if (response.verification && response.verification.isValid) {
      // Redux 상태 업데이트
      dispatch(login(email, password));
      setShowTwoFactor(false);
      navigate('/');
    } else {
      alert('2차 인증에 실패했습니다.');
    }
  };

  // 2차 인증 취소 처리
  const handleTwoFactorCancel = () => {
    setShowTwoFactor(false);
    setTwoFactorData(null);
  };

  // 2차 인증 화면이 표시되어야 하는 경우
  if (showTwoFactor && twoFactorData) {
    return (
      <TwoFactorVerification
        sessionId={twoFactorData.sessionId}
        userInfo={twoFactorData.user}
        onVerificationSuccess={handleTwoFactorSuccess}
        onCancel={handleTwoFactorCancel}
      />
    );
  }

  return (
    <Container className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">로그인</h2>
              
              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearErrors())}>
                  {error}
                </Alert>
              )}
              
              {message && (
                <Alert variant="success" dismissible onClose={() => dispatch(clearErrors())}>
                  {message}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>이메일</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>비밀번호</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      name="password"
                      value={password}
                      onChange={onChange}
                      required
                      disabled={loading}
                    />
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent'
                      }}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </Button>
                  </div>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={loading || !email || !password}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}로그인 중...
                    </>
                  ) : (
                    '로그인'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  계정이 없으신가요? <Link to="/register">회원가입</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default LoginPage;
