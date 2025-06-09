import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container, Card, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { register, clearErrors } from '../redux/actions/authActions';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error, isAuthenticated, message } = useSelector(state => state.auth);

  const { username, email, password, confirmPassword, phone } = formData;

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

  // 비밀번호 강도 계산
  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength += 25;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // 실시간 유효성 검사
    validateField(e.target.name, e.target.value);
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'username':
        if (value.length < 3) {
          errors.username = '사용자명은 최소 3자 이상이어야 합니다.';
        } else if (value.length > 20) {
          errors.username = '사용자명은 최대 20자까지 가능합니다.';
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          errors.username = '사용자명은 영문과 숫자만 포함할 수 있습니다.';
        } else {
          delete errors.username;
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = '올바른 이메일 형식을 입력해주세요.';
        } else {
          delete errors.email;
        }
        break;
      
      case 'password':
        if (value.length < 6) {
          errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
        } else {
          delete errors.password;
        }
        break;
      
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        } else {
          delete errors.confirmPassword;
        }
        break;
      
      case 'phone':
        const phoneRegex = /^01[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}$/;
        if (value && !phoneRegex.test(value.replace(/-/g, ''))) {
          errors.phone = '올바른 핸드폰 번호 형식을 입력해주세요. (예: 010-1234-5678)';
        } else {
          delete errors.phone;
        }
        break;
      
      default:
        break;
    }

    setValidationErrors(errors);
  };

  const getPasswordStrengthVariant = () => {
    if (passwordStrength <= 25) return 'danger';
    if (passwordStrength <= 50) return 'warning';
    if (passwordStrength <= 75) return 'info';
    return 'success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return '약함';
    if (passwordStrength <= 50) return '보통';
    if (passwordStrength <= 75) return '강함';
    return '매우 강함';
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // 모든 필드 유효성 검사
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    // 유효성 검사 오류가 있으면 중단
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (password !== confirmPassword) {
      setValidationErrors({ confirmPassword: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    try {
      const result = await dispatch(register({
        username,
        email,
        password,
        phone
      }));
      
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
    }
  };

  return (
    <Container className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">회원가입</h2>
              
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
                  <Form.Label>사용자명</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="사용자명을 입력하세요"
                    name="username"
                    value={username}
                    onChange={onChange}
                    required
                    disabled={loading}
                    isInvalid={!!validationErrors.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.username}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    영문과 숫자만 사용, 3~20자 사이로 입력해주세요.
                  </Form.Text>
                </Form.Group>

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
                    isInvalid={!!validationErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>핸드폰 번호</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="핸드폰 번호를 입력하세요 (예: 010-1234-5678)"
                    name="phone"
                    value={phone}
                    onChange={onChange}
                    disabled={loading}
                    isInvalid={!!validationErrors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.phone}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    선택사항입니다. 01X-XXXX-XXXX 형식으로 입력해주세요.
                  </Form.Text>
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
                      isInvalid={!!validationErrors.password}
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
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                  
                  {/* 비밀번호 강도 표시 */}
                  {password && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between">
                        <small>비밀번호 강도</small>
                        <small>{getPasswordStrengthText()}</small>
                      </div>
                      <ProgressBar 
                        variant={getPasswordStrengthVariant()} 
                        now={passwordStrength} 
                        style={{ height: '8px' }}
                      />
                    </div>
                  )}
                  
                  <Form.Text className="text-muted">
                    최소 6자 이상, 대문자와 숫자 포함 권장
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>비밀번호 확인</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      required
                      disabled={loading}
                      isInvalid={!!validationErrors.confirmPassword}
                    />
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={loading || Object.keys(validationErrors).length > 0}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}회원가입 중...
                    </>
                  ) : (
                    '회원가입'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default RegisterPage;
