import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Form, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import postService from '../services/postService';
import likeService from '../services/likeService';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  // 게시물 목록 조회
  const fetchPosts = async (page = 1, keyword = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      
      if (keyword) {
        result = await postService.searchPosts(keyword, page, 10);
      } else {
        result = await postService.getPosts(page, 10);
      }
      
      if (result.success) {
        setPosts(result.data.posts || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setError(result.message);
        setPosts([]);
      }
    } catch (error) {
      console.error('게시물 조회 오류:', error);
      setError('네트워크 오류가 발생했습니다.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, searchKeyword);
  }, [currentPage]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    await fetchPosts(1, searchKeyword);
  };

  // 좋아요 토글 처리
  const handleLikeToggle = async (postId, currentLikes) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const result = await likeService.togglePostLike(postId);
      if (result.success) {
        // 게시물 목록에서 해당 게시물의 좋아요 수 업데이트
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: result.data.likeCount, isLiked: result.data.isLiked }
              : post
          )
        );
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>게시물 목록</h1>
        {isAuthenticated && (
          <Button 
            variant="primary" 
            onClick={() => navigate('/posts/create')}
          >
            게시물 작성
          </Button>
        )}
      </div>

      {/* 검색 폼 */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="게시물 제목이나 내용으로 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant="outline-primary" className="w-100">
                  검색
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">로딩 중...</span>
          </div>
        </div>
      ) : (
        <>
          {posts.length === 0 ? (
            <Alert variant="info">게시물이 없습니다.</Alert>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <Link to={`/posts/${post.id}`} className="text-decoration-none">
                        <h5 className="card-title">{post.title}</h5>
                      </Link>
                      
                      <div className="text-muted mb-2">
                        {post.content.substring(0, 200) + '...'}
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
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 text-muted me-3"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLikeToggle(post.id, post.likes || 0);
                          }}
                          disabled={!isAuthenticated}
                          style={{ textDecoration: 'none' }}
                        >
                          <i className={`bi bi-heart${post.isLiked ? '-fill text-danger' : ''}`}></i> {post.likes || 0}
                        </Button>
                        <span>
                          <i className="bi bi-chat"></i> {post.comment_count || 0}
                        </span>
                      </div>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div>
                        {post.tags.map(tag => (
                          <Badge key={tag.id} bg="secondary" className="me-1">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <nav aria-label="게시물 페이지네이션">
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
        </>
      )}
    </Container>
  );
};

export default PostsPage;
