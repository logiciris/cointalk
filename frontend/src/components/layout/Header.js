import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, InputGroup, Dropdown, Badge } from 'react-bootstrap';
import { logout } from '../../redux/actions/authActions';
import LanguageSelector from '../common/LanguageSelector';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenus, setUserMenus] = useState([]);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // 서버에서 메뉴 권한 정보 가져오기
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMenuPermissions();
    } else {
      // 로그아웃 상태일 때 메뉴 초기화
      setUserMenus([]);
      setHasAdminAccess(false);
    }
  }, [isAuthenticated, user]);

  const fetchMenuPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('토큰이 없음');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/auth/menu-permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('서버 메뉴 권한:', data);
        setUserMenus(data.menus || []);
        setHasAdminAccess(data.hasAdminAccess || false);
      } else {
        console.error('메뉴 권한 요청 실패:', response.status);
      }
    } catch (error) {
      console.error('메뉴 권한 확인 오류:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색 페이지로 이동하여 검색 실행
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 인증되지 않은 사용자를 위한 헤더
  if (!isAuthenticated) {
    return (
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-icon">₿</span>
            <span>CoinTalk</span>
          </Link>

          <Form onSubmit={handleSearch} className="search-bar">
            <InputGroup>
              <Form.Control
                placeholder="코인, 사용자 또는 주제 검색..."
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroup.Text style={{ cursor: 'pointer' }} onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
            </InputGroup>
          </Form>

          <div className="nav-actions">
            <LanguageSelector />
            <Link to="/login" className="nav-icon ms-2">
              <i className="bi bi-box-arrow-in-right"></i>
              <span style={{ marginLeft: '5px' }}>로그인</span>
            </Link>
            <Link to="/register" className="nav-icon">
              <i className="bi bi-person-plus"></i>
              <span style={{ marginLeft: '5px' }}>회원가입</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // 인증된 사용자를 위한 헤더
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">₿</span>
          <span>CoinTalk</span>
        </Link>

        <Form onSubmit={handleSearch} className="search-bar">
          <InputGroup>
            <Form.Control
              placeholder="코인, 사용자 또는 주제 검색..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroup.Text style={{ cursor: 'pointer' }} onClick={handleSearch}>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
          </InputGroup>
        </Form>

        <div className="nav-actions">
          <LanguageSelector />
          
          {/* 통합 알림 */}
          <Dropdown align="end" className="ms-2">
            <Dropdown.Toggle variant="link" className="notification-icon">
              <i className="bi bi-bell-fill" style={{ color: '#ffeaa7' }}></i>
              <span className="notification-dot"></span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="notifications-menu">
              <Dropdown.Header>
                <strong>알림</strong>
                <small className="text-muted ms-2">5개의 새 알림</small>
              </Dropdown.Header>
              
              {/* 좋아요 알림 */}
              <Dropdown.Item href="#" className="notification-item">
                <div className="notification-icon-small like">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <div className="notification-content">
                  <span className="notification-text"><strong>김철수</strong>님이 당신의 게시물을 좋아합니다</span>
                  <small className="notification-time">2분 전</small>
                </div>
              </Dropdown.Item>
              
              {/* 댓글 알림 */}
              <Dropdown.Item href="#" className="notification-item">
                <div className="notification-icon-small comment">
                  <i className="bi bi-chat-fill"></i>
                </div>
                <div className="notification-content">
                  <span className="notification-text"><strong>박영희</strong>님이 댓글을 남겼습니다: "좋은 정보네요!"</span>
                  <small className="notification-time">5분 전</small>
                </div>
              </Dropdown.Item>
              
              {/* 팔로우 알림 */}
              <Dropdown.Item href="#" className="notification-item">
                <div className="notification-icon-small follow">
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <div className="notification-content">
                  <span className="notification-text"><strong>이민수</strong>님이 당신을 팔로우하기 시작했습니다</span>
                  <small className="notification-time">10분 전</small>
                </div>
              </Dropdown.Item>
              
              {/* 메시지 알림 */}
              <Dropdown.Item href="#" className="notification-item">
                <div className="notification-icon-small message">
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div className="notification-content">
                  <span className="notification-text"><strong>정지원</strong>님이 메시지를 보냈습니다</span>
                  <small className="notification-time">15분 전</small>
                </div>
              </Dropdown.Item>
              
              {/* 좋아요 알림 */}
              <Dropdown.Item href="#" className="notification-item">
                <div className="notification-icon-small like">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <div className="notification-content">
                  <span className="notification-text"><strong>최유진</strong>님이 당신의 댓글을 좋아합니다</span>
                  <small className="notification-time">30분 전</small>
                </div>
              </Dropdown.Item>
              
              <Dropdown.Divider />
              <Dropdown.Item href="/notifications" className="text-center text-primary">
                <i className="bi bi-list-ul me-2"></i>모든 알림 보기
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* 프로필 드롭다운 */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="profile-toggle">
              <div className="profile-section">
                <span className="profile-avatar">
                  {user?.username?.substring(0, 1).toUpperCase() || 'U'}
                </span>
                <span className="profile-username d-none d-md-inline">
                  {user?.username}
                </span>
                <i className="bi bi-chevron-down profile-arrow"></i>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="profile-menu">
              <Dropdown.Header>
                <div className="dropdown-user-info">
                  <strong>{user?.username}</strong>
                  <small className="text-muted d-block">{user?.email}</small>
                </div>
              </Dropdown.Header>
              
              <Dropdown.Divider />
              
              {/* 서버에서 받은 메뉴들 */}
              {userMenus.map((menu, index) => (
                <Dropdown.Item key={index} as={Link} to={menu.path}>
                  <i className={`${menu.icon} me-2`}></i>{menu.name}
                </Dropdown.Item>
              ))}
              
              <Dropdown.Divider />
              
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>로그아웃
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
