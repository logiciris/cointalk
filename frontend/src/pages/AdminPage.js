import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Table,
  Button,
  Alert,
  Badge,
  Form,
  Modal,
  Spinner
} from 'react-bootstrap';
import { adminService } from '../services/adminService';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // 관리자 권한 확인
  useEffect(() => {
    // Redux에서 사용자 정보가 없으면 localStorage에서 가져오기
    let currentUser = user;
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    
    loadDashboard();
  }, [user, navigate]);

  // 대시보드 데이터 로드
  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사용자 목록 로드
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 게시물 목록 로드
  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPosts();
      setPosts(response.data.posts);
    } catch (error) {
      setError('게시물 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 목록 로드
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getComments();
      setComments(response.data.comments);
    } catch (error) {
      setError('댓글 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 시스템 설정 로드
  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemSettings();
      setSystemSettings(response.data);
    } catch (error) {
      setError('시스템 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 데이터 로드
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    
    switch (tab) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'users':
        loadUsers();
        break;
      case 'posts':
        loadPosts();
        break;
      case 'comments':
        loadComments();
        break;
      case 'settings':
        loadSystemSettings();
        break;
      default:
        break;
    }
  };

  // 사용자 역할 변경
  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setSuccess('사용자 역할이 변경되었습니다.');
      loadUsers();
    } catch (error) {
      setError('사용자 역할 변경에 실패했습니다.');
    }
  };

  // 사용자 상태 토글
  const handleUserStatusToggle = async (userId, active) => {
    try {
      await adminService.toggleUserStatus(userId, active);
      setSuccess(active ? '사용자가 활성화되었습니다.' : '사용자가 비활성화되었습니다.');
      loadUsers();
    } catch (error) {
      setError('사용자 상태 변경에 실패했습니다.');
    }
  };

  // 사용자 삭제
  const handleUserDelete = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      setSuccess('사용자가 삭제되었습니다.');
      loadUsers();
    } catch (error) {
      setError('사용자 삭제에 실패했습니다.');
    }
  };

  // 비밀번호 초기화
  const handlePasswordReset = async (userId, username) => {
    try {
      const response = await adminService.resetUserPassword(userId);
      if (response.success && response.data?.newPassword) {
        setSuccess(`${username}님의 비밀번호가 "${response.data.newPassword}"로 초기화되었습니다.`);
      } else {
        setError('비밀번호 초기화 응답을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('비밀번호 초기화에 실패했습니다.');
    }
  };

  // 삭제 확인 모달
  const showDeleteConfirm = (type, id, title) => {
    setDeleteTarget({ type, id, title });
    setShowDeleteModal(true);
  };

  // 실제 삭제 처리
  const handleDelete = async () => {
    try {
      const { type, id } = deleteTarget;
      
      if (type === 'post') {
        await adminService.deletePost(id);
        setSuccess('게시물이 삭제되었습니다.');
        loadPosts();
      } else if (type === 'comment') {
        await adminService.deleteComment(id);
        setSuccess('댓글이 삭제되었습니다.');
        loadComments();
      } else if (type === 'user') {
        await adminService.deleteUser(id);
        setSuccess('사용자가 삭제되었습니다.');
        loadUsers();
      }
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      setError('삭제에 실패했습니다.');
    }
  };

  // 시스템 설정 업데이트
  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateSystemSettings(systemSettings);
      setSuccess('시스템 설정이 업데이트되었습니다.');
    } catch (error) {
      setError('시스템 설정 업데이트에 실패했습니다.');
    }
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 대시보드 렌더링
  const renderDashboard = () => (
    <Row>
      <Col md={3} className="mb-3">
        <Card className="admin-stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="text-muted">총 사용자</h6>
                <h3 className="text-primary">{dashboardData?.userStats?.total_users || 0}</h3>
                <small className="text-success">
                  이번 주 +{dashboardData?.userStats?.new_users_week || 0}
                </small>
              </div>
              <div className="admin-stat-icon bg-primary">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} className="mb-3">
        <Card className="admin-stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="text-muted">총 게시물</h6>
                <h3 className="text-info">{dashboardData?.postStats?.total_posts || 0}</h3>
                <small className="text-success">
                  이번 주 +{dashboardData?.postStats?.new_posts_week || 0}
                </small>
              </div>
              <div className="admin-stat-icon bg-info">
                <i className="fas fa-edit"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} className="mb-3">
        <Card className="admin-stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="text-muted">총 댓글</h6>
                <h3 className="text-warning">{dashboardData?.commentStats?.total_comments || 0}</h3>
                <small className="text-success">
                  이번 주 +{dashboardData?.commentStats?.new_comments_week || 0}
                </small>
              </div>
              <div className="admin-stat-icon bg-warning">
                <i className="fas fa-comments"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} className="mb-3">
        <Card className="admin-stat-card">
          <Card.Body>
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="text-muted">관리자</h6>
                <h3 className="text-danger">{dashboardData?.userStats?.admin_users || 0}</h3>
                <small className="text-muted">활성 관리자</small>
              </div>
              <div className="admin-stat-icon bg-danger">
                <i className="fas fa-user-shield"></i>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={12}>
        <Card>
          <Card.Header>
            <h5>최근 활동</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>유형</th>
                  <th>내용</th>
                  <th>작성자</th>
                  <th>시간</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentActivity?.map((activity, index) => (
                  <tr key={index}>
                    <td>
                      <Badge bg={activity.type === 'post' ? 'primary' : 'secondary'}>
                        {activity.type === 'post' ? '게시물' : '댓글'}
                      </Badge>
                    </td>
                    <td>{activity.content}</td>
                    <td>{activity.username}</td>
                    <td>{formatDate(activity.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // 사용자 관리 렌더링
  const renderUsers = () => (
    <Card>
      <Card.Header>
        <h5>사용자 관리</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>사용자명</th>
              <th>이메일</th>
              <th>역할</th>
              <th>게시물</th>
              <th>댓글</th>
              <th>가입일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                    {user.role === 'admin' ? '관리자' : '사용자'}
                  </Badge>
                </td>
                <td>{user.post_count}</td>
                <td>{user.comment_count}</td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Form.Select 
                      size="sm" 
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                      style={{ width: '120px' }}
                    >
                      <option value="user">사용자</option>
                      <option value="admin">관리자</option>
                    </Form.Select>
                    <Button 
                      variant={user.is_active ? 'outline-warning' : 'outline-success'} 
                      size="sm"
                      onClick={() => handleUserStatusToggle(user.id, !user.is_active)}
                    >
                      {user.is_active ? '비활성화' : '활성화'}
                    </Button>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handlePasswordReset(user.id, user.username)}
                    >
                      비밀번호 초기화
                    </Button>
                    {user.role !== 'admin' && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => showDeleteConfirm('user', user.id, user.username)}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // 게시물 관리 렌더링
  const renderPosts = () => (
    <Card>
      <Card.Header>
        <h5>게시물 관리</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>작성자</th>
              <th>좋아요</th>
              <th>댓글</th>
              <th>작성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.author}</td>
                <td>{post.like_count}</td>
                <td>{post.comment_count}</td>
                <td>{formatDate(post.created_at)}</td>
                <td>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => showDeleteConfirm('post', post.id, post.title)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // 댓글 관리 렌더링
  const renderComments = () => (
    <Card>
      <Card.Header>
        <h5>댓글 관리</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>내용</th>
              <th>작성자</th>
              <th>게시물</th>
              <th>작성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {comments.map(comment => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
                <td>{comment.content.substring(0, 50)}...</td>
                <td>{comment.author}</td>
                <td>{comment.post_title}</td>
                <td>{formatDate(comment.created_at)}</td>
                <td>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => showDeleteConfirm('comment', comment.id, comment.content)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // 시스템 설정 렌더링
  const renderSettings = () => (
    <Card>
      <Card.Header>
        <h5>시스템 설정</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSettingsUpdate}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>사이트 이름</Form.Label>
                <Form.Control
                  type="text"
                  value={systemSettings.siteName || ''}
                  onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>최대 게시물 길이</Form.Label>
                <Form.Control
                  type="number"
                  value={systemSettings.maxPostLength || ''}
                  onChange={(e) => setSystemSettings({...systemSettings, maxPostLength: parseInt(e.target.value)})}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>최대 댓글 길이</Form.Label>
                <Form.Control
                  type="number"
                  value={systemSettings.maxCommentLength || ''}
                  onChange={(e) => setSystemSettings({...systemSettings, maxCommentLength: parseInt(e.target.value)})}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>최대 파일 크기 (MB)</Form.Label>
                <Form.Control
                  type="number"
                  value={systemSettings.maxFileSize || ''}
                  onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Button type="submit" variant="primary">
            설정 저장
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );

  // Redux에서 사용자 정보가 없으면 localStorage에서 가져오기
  let currentUser = user;
  if (!currentUser) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          관리자 권한이 필요합니다.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-page">
      <Row>
        <Col md={12}>
          <div className="admin-header mb-4">
            <h2>
              <i className="fas fa-cogs me-2"></i>
              CoinTalk 관리자 패널
            </h2>
            <p className="text-muted">시스템 전반을 관리하고 모니터링할 수 있습니다.</p>
          </div>
          
          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
          
          <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
            <Nav variant="tabs" className="admin-nav-tabs mb-4">
              <Nav.Item>
                <Nav.Link eventKey="dashboard">
                  <i className="fas fa-tachometer-alt me-2"></i>대시보드
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users">
                  <i className="fas fa-users me-2"></i>사용자 관리
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="posts">
                  <i className="fas fa-edit me-2"></i>게시물 관리
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="comments">
                  <i className="fas fa-comments me-2"></i>댓글 관리
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="settings">
                  <i className="fas fa-cog me-2"></i>시스템 설정
                </Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                  </Spinner>
                </div>
              ) : (
                <>
                  <Tab.Pane eventKey="dashboard">
                    {dashboardData && renderDashboard()}
                  </Tab.Pane>
                  <Tab.Pane eventKey="users">
                    {renderUsers()}
                  </Tab.Pane>
                  <Tab.Pane eventKey="posts">
                    {renderPosts()}
                  </Tab.Pane>
                  <Tab.Pane eventKey="comments">
                    {renderComments()}
                  </Tab.Pane>
                  <Tab.Pane eventKey="settings">
                    {renderSettings()}
                  </Tab.Pane>
                </>
              )}
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
      
      {/* 삭제 확인 모달 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>삭제 확인</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          정말로 삭제하시겠습니까?
          <br />
          <strong>{deleteTarget?.title}</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPage;
