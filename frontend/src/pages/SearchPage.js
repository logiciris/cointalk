import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Form, Alert, Nav, Tab } from 'react-bootstrap';
import searchService from '../services/searchService';

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('q') || '';
  
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 검색 결과 가져오기
  const fetchSearchResults = async (page = 1, keyword = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // SQL 인젝션 취약점을 가진 검색 API 호출
      const result = await searchService.searchAll(keyword, page, 10);
      
      if (result.success) {
        setPosts(result.data.posts || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setError(result.message);
        setPosts([]);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 및 검색어 변경 시 검색 실행
  useEffect(() => {
    if (initialKeyword) {
      fetchSearchResults(1, initialKeyword);
    } else {
      setLoading(false);
    }
  }, [initialKeyword]);

  // 검색 제출 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSearchResults(1, searchKeyword);
    
    // URL 쿼리 파라미터 업데이트
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('q', searchKeyword);
    window.history.pushState(null, '', `${location.pathname}?${searchParams.toString()}`);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSearchResults(page, searchKeyword);
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">검색 결과</h1>

      {/* 검색 폼 */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="게시물, 사용자, 코인 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary" className="w-100">
                  검색
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 검색 결과 탭 */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Card className="mb-4">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="posts">게시물</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users">사용자</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="coins">코인</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="posts">
                {/* 로딩 중 */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="sr-only">검색 중...</span>
                    </div>
                  </div>
                )}

                {/* 에러 발생 - SQL 오류 세부 정보 표시 */}
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    <div>{error.message || error}</div>
                    {error.errorDetails && (
                      <div className="mt-2">
                        <details>
                          <summary>오류 세부 정보 (디버깅용)</summary>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(error.errorDetails, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </Alert>
                )}

                {/* 검색어 없음 */}
                {!loading && !error && !initialKeyword && (
                  <Alert variant="info">
                    검색어를 입력하여 게시물을 찾아보세요.
                  </Alert>
                )}

                {/* 결과 없음 - XSS 취약점 추가 */}
                {!loading && !error && initialKeyword && posts.length === 0 && (
                  <Alert variant="warning">
                    <div dangerouslySetInnerHTML={{ __html: `'${initialKeyword}'에 대한 검색 결과가 없습니다.` }} />
                  </Alert>
                )}

                {/* 게시물 결과 목록 - XSS 취약점 추가 */}
                {!loading && !error && posts.length > 0 && (
                  <>
                    <div className="mb-3">
                      <div dangerouslySetInnerHTML={{ __html: `"${initialKeyword}"에 대한 검색 결과: ${posts.length}개 항목` }} />
                    </div>

                    {posts.map(post => (
                      <Card key={post.id} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <Link to={`/posts/${post.id}`} className="text-decoration-none">
                                <h5 className="card-title">{post.title}</h5>
                              </Link>
                              
                              <div className="text-muted mb-2">
                                {post.content?.substring(0, 200) + '...'}
                              </div>
                              
                              <div className="d-flex align-items-center text-sm text-muted">
                                <div 
                                  className="avatar me-2"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #f7931a, #f2a54a)',
                                    color: 'white',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {post.username?.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="me-3">{post.username}</span>
                                <span className="me-3">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                                <span className="me-3">
                                  <i className="bi bi-eye"></i> {post.views || 0}
                                </span>
                                <span>
                                  <i className="bi bi-heart"></i> {post.likes || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </>
                )}

                {/* 페이지네이션 */}
                {!loading && !error && posts.length > 0 && totalPages > 1 && (
                  <nav aria-label="검색 결과 페이지네이션">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          이전
                        </button>
                      </li>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          다음
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </Tab.Pane>
              
              <Tab.Pane eventKey="users">
                <Alert variant="info">
                  사용자 검색 기능은 아직 개발 중입니다. 곧 사용하실 수 있습니다.
                </Alert>
              </Tab.Pane>
              
              <Tab.Pane eventKey="coins">
                <Alert variant="info">
                  코인 검색 기능은 아직 개발 중입니다. 곧 사용하실 수 있습니다.
                </Alert>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </Container>
  );
};

export default SearchPage;